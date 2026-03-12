import { postJSON, getJSON } from "./submissions";
import { ApiResult } from "../dataTypes/results";
import { UserDTO } from "../dataTypes/auth";

// login method
export async function login(email: string, password: string): Promise<ApiResult<null>> {
	return postJSON("/api/auth/login", { email, password });
}

// logout method
export async function logout(): Promise<ApiResult<null>> {
	return postJSON("/api/auth/logout", { });
}

// registration method
export async function register(email: string, name: string, password: string): Promise<ApiResult<null>> {
	return postJSON("/api/auth/register", { email, name, password });
}

// authentication data retrieve
export async function me(): Promise<ApiResult<UserDTO>> {
	return getJSON("/api/auth/me", );
}

// forgot password 
export async function forgotPassword(email: string): Promise<ApiResult<null>> {
	return postJSON("api/auth/forgot-password", { email });
}

// forgot password 
export async function resetPassword(newPassword: string, token: string): Promise<ApiResult<null>> {
	return postJSON("api/auth/reset-password", { newPassword, token });
}
