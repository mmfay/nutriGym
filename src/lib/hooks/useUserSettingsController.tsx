"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiKeyMetadata, User } from "../dataTypes/auth";
import { getUserRecord as getUser, updateUserRecord } from "../api/usersettings/usersettings";
import { getApiKeyMetadata as getApiKeyMetadataRequest, generateApiKey, revokeApiKey } from "../api/apikeys/apikeys";


export type UserSettingsController = {

	loading: boolean;
	userLoading: boolean;
	error: string | null;

	// gets
	getUserRecord: () => Promise<void>;

	// updates
	onAccountUpdate: (name: string, email: string, timezone: string) => Promise<void>;

	userRecord: User | undefined;

	// api keys
	apiKeyLoading: boolean;
	apiKeyMetadata: ApiKeyMetadata | undefined;
	generatedKey: string | null;
	getApiKeyMetadata: () => Promise<void>;
	onGenerateApiKey: () => Promise<void>;
	onRevokeApiKey: () => Promise<void>;

};

export function useUserSettingsController(): UserSettingsController {

	const [loading, setLoading] = useState(false);
	const [userLoading, setUserLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [userRecord, setUserRecord] = useState<User>();

	const [apiKeyLoading, setApiKeyLoading] = useState(false);
	const [apiKeyMetadata, setApiKeyMetadata] = useState<ApiKeyMetadata>();
	const [generatedKey, setGeneratedKey] = useState<string | null>(null);

	// Tracks whether the component using this hook is still mounted
	const aliveRef = useRef(true);

	useEffect(() => {

		aliveRef.current = true;

		return () => {
			aliveRef.current = false;
		};

	}, []);

	// get User Record
	const getUserRecord = useCallback ( async (): Promise<void> => {

		setUserLoading(true);
		setError(null);

		const res = await getUser();

		if (!res.ok) {
			setUserLoading(false);
			setError(res.message);
			throw new Error(res.message);
		}
		
		setUserRecord(res.data);

		setUserLoading(false);

	}, [])

	// update email address on record
	const onAccountUpdate = useCallback(async (name: string, email: string, timezone: string): Promise<void> => {
		
		setUserLoading(true);
		setError(null);
		
		if (!userRecord) {
			setUserLoading(false);
			return;
		}
		
		const updatedUser: User = {
			...userRecord,
			email: email,
			name: name,
			timezone: timezone,
		}


		const res = await updateUserRecord(updatedUser);
		
		if (!res.ok) {
			setUserLoading(false);
			setError(res.message);
			throw new Error(res.message);
		}

		setUserRecord(res.data);
		setUserLoading(false);

	}, [userRecord]);

	// get API key metadata (never the raw key)
	const getApiKeyMetadata = useCallback(async (): Promise<void> => {

		setApiKeyLoading(true);
		setError(null);

		const res = await getApiKeyMetadataRequest();

		if (!res.ok) {
			setApiKeyLoading(false);
			setError(res.message);
			throw new Error(res.message);
		}

		setApiKeyMetadata(res.data);

		setApiKeyLoading(false);

	}, []);

	// generate (or regenerate) the user's API key
	const onGenerateApiKey = useCallback(async (): Promise<void> => {

		setApiKeyLoading(true);
		setError(null);

		const res = await generateApiKey();

		if (!res.ok) {
			setApiKeyLoading(false);
			setError(res.message);
			throw new Error(res.message);
		}

		setGeneratedKey(res.data?.key ?? null);
		setApiKeyMetadata({
			has_key: true,
			key_prefix: res.data?.key_prefix ?? null,
			created_at: res.data?.created_at ?? null,
		});

		setApiKeyLoading(false);

	}, []);

	// revoke the user's API key
	const onRevokeApiKey = useCallback(async (): Promise<void> => {

		setApiKeyLoading(true);
		setError(null);

		const res = await revokeApiKey();

		if (!res.ok) {
			setApiKeyLoading(false);
			setError(res.message);
			throw new Error(res.message);
		}

		setGeneratedKey(null);
		setApiKeyMetadata({ has_key: false, key_prefix: null, created_at: null });

		setApiKeyLoading(false);

	}, []);

	return {
		loading,
		userLoading,
		error,
		getUserRecord,
		onAccountUpdate,
		userRecord,
		apiKeyLoading,
		apiKeyMetadata,
		generatedKey,
		getApiKeyMetadata,
		onGenerateApiKey,
		onRevokeApiKey,
	};
}