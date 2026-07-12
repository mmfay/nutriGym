import crypto from "crypto";

export function generateRawApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {

	const rawKey = "ngk_" + crypto.randomBytes(32).toString("hex");
	const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
	const keyPrefix = rawKey.slice(0, 12);

	return { rawKey, keyHash, keyPrefix };

}
