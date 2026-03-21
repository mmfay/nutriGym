export const runtime = "nodejs";

import crypto from "crypto";
import { ResponseBuilder as R } from "@/lib/utils/response";
import { verifyEmailByTokenHash } from "@/lib/services/user";

/**
 * Verifies a user's email if the token is valid.
 *
 * @param req body of the POST, contains token
 * @returns success when email is verified, and errors when not.
 */
export async function POST(req: Request) {

	try {
		
		const body = await req.json();
		const passedToken = body.token?.trim();

		if (!passedToken) {
			return R.badRequest("Verification link is invalid or expired.");
		}

		const tokenHash = crypto
			.createHash("sha256")
			.update(passedToken)
			.digest("hex");

		const verifiedUser = await verifyEmailByTokenHash(tokenHash);

		if (!verifiedUser) {
			return R.badRequest("Verification link is invalid or expired.");
		}

		return R.ok(verifiedUser, "Email verified successfully.");

	} catch (error) {

		console.error("Verify email error:", error);
		return R.serverError("Something went wrong.");

	}
	
}