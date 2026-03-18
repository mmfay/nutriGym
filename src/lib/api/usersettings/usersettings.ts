import { User } from "@/lib/dataTypes/auth";
import { getJSON, patchJSON } from "../submissions";
import { ApiResult } from "@/lib/dataTypes/results";

/**
 * Get User Record
 */
export async function getUserRecord(): Promise<ApiResult<User>> {
	return getJSON("/api/usersettings");
}

/**
 * Update User Record
 */
export async function updateUserRecord(updatedRecord: User): Promise<ApiResult<User>> {
	return patchJSON("/api/usersettings", updatedRecord);
}