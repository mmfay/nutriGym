"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "../dataTypes/auth";
import { getUserRecord as getUser, updateUserRecord } from "../api/usersettings/usersettings";


export type UserSettingsController = {

	loading: boolean;
	userLoading: boolean;
	error: string | null;

	// gets
	getUserRecord: () => Promise<void>;

	// updates
	onAccountUpdate: (name: string, email: string, timezone: string) => Promise<void>;

	userRecord: User | undefined;

};

export function useUserSettingsController(): UserSettingsController {

	const [loading, setLoading] = useState(false);
	const [userLoading, setUserLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [userRecord, setUserRecord] = useState<User>();

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

	return {
		loading,
		userLoading,
		error,
		getUserRecord,
		onAccountUpdate,
		userRecord,
	};
}