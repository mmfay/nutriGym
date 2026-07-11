import { ApiKeyGenerated, ApiKeyMetadata } from "@/lib/dataTypes/auth";
import { getJSON, postJSON, deleteJSON } from "../submissions";
import { ApiResult } from "@/lib/dataTypes/results";

export async function getApiKeyMetadata(): Promise<ApiResult<ApiKeyMetadata>> {
	return getJSON("/api/apikeys");
}

export async function generateApiKey(): Promise<ApiResult<ApiKeyGenerated>> {
	return postJSON("/api/apikeys", {});
}

export async function revokeApiKey(): Promise<ApiResult<null>> {
	return deleteJSON("/api/apikeys");
}