export const runtime = "nodejs";

import { ResponseBuilder as R } from "@/lib/utils/response";
import { getUser } from "@/lib/auth/session";
import { ApiKeys } from "@/lib/tables/api_keys";
import { generateRawApiKey } from "@/lib/services/api_keys";
import { ApiKeyMetadata, ApiKeyGenerated } from "@/lib/dataTypes/auth";

export async function GET() {

	const user = await getUser();

	if (!user) {
		return R.unauthorized("User is not authenticated");
	}

	try {

		const existing = await ApiKeys.findByUser(user.id);

		const metadata: ApiKeyMetadata = {
			has_key: !!existing,
			key_prefix: existing?.key_prefix ?? null,
			created_at: existing?.created_at ?? null,
		};

		return R.ok(metadata, "Successfully retrieved API key.");

	} catch (err: any) {
		console.error("DB error:", err);
		return R.serverError("Server Error");
	}

}

export async function POST() {

	const user = await getUser();

	if (!user) {
		return R.unauthorized("User is not authenticated");
	}

	try {

		const { rawKey, keyHash, keyPrefix } = generateRawApiKey();

		await ApiKeys.deleteByUser(user.id);

		let apiKey = new ApiKeys();
		apiKey.user_id = user.id;
		apiKey.key_hash = keyHash;
		apiKey.key_prefix = keyPrefix;

		apiKey = await apiKey.insert();

		const generated: ApiKeyGenerated = {
			key: rawKey,
			key_prefix: apiKey.key_prefix!,
			created_at: apiKey.created_at!,
		};

		return R.created(generated, "API key generated.");

	} catch (err: any) {
		console.error("DB error:", err);
		return R.serverError("Server Error");
	}

}

export async function DELETE() {

	const user = await getUser();

	if (!user) {
		return R.unauthorized("User is not authenticated");
	}

	try {

		await ApiKeys.deleteByUser(user.id);

		return R.ok(null, "API key revoked.");

	} catch (err: any) {
		console.error("DB error:", err);
		return R.serverError("Server Error");
	}

}