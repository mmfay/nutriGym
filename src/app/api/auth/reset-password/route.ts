export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { ResponseBuilder as R } from "@/lib/utils/response";
import { getValidPasswordResetToken } from "@/lib/services/password_reset_tokens";
import { findUserById, updatePassword } from "@/lib/services/user";

/**
 * Allows the reset of a password if token is valid
 * 
 * @param req body of the POST, contains newPassword and token
 * @returns success when password is reset, and errors when not.
 */
export async function POST(req: NextRequest) {

	const body = await req.json();
	const updatedPassword = body.newPassword;
	const passedToken = body.token;

	const resetToken = await getValidPasswordResetToken(passedToken);

	if (!resetToken) {
		return R.badRequest("Reset link is invalid or expired.");
	}

	const user = await findUserById(resetToken.user_id);

	if (!user) {
		return R.badRequest("Reset link is invalid or expired.");
	}

	await updatePassword(user.id, updatedPassword);

	return R.ok("Password Reset Successful")
	
}