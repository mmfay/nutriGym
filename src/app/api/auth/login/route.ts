export const runtime = "nodejs";

import { ResponseBuilder as R } from "@/lib/utils/response";
import pool from "@/lib/db/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Users } from "@/lib/tables/users";
import { AuthSessions } from "@/lib/tables/auth_sessions";

const SESSION_TTL_SEC = 60 * 60 * 24; // 1 Day

export async function POST(req: Request) {

	try {

		const body = await req.json();

		const { email, password } = body;

		const emailNorm = email.trim().toLowerCase();

		const user = await Users.findByEmail(emailNorm);

		// if no user, send email not found.
		if (!user) {
			return R.unauthorized("Invalid login.");
		}		
		
		// validate that user is enabled.
		if (!user.is_enabled) {
			return R.unauthorized("This account is disabled.");
		}	

		// validate that user email has been verified.
		if (!user.email_verified) {
			return R.unauthorized("Please verify your email before signing in.");
		}
		
		if (!user.password_hash) {
			return R.unauthorized("There is an issue with your account, please contact support");
		}

		// validate password
		const valid = await bcrypt.compare(password, user.password_hash);

		if (!valid) {
			return R.unauthorized("Invalid email or password.");
		}
		
		// Create opaque session id + persist
		const sid = crypto.randomBytes(24).toString("base64url");

		var auth_session = new AuthSessions();

		auth_session.id = sid;
		auth_session.user_id = user.id;
		auth_session.expires_at = new Date(Date.now() + SESSION_TTL_SEC * 1000);

		auth_session = await auth_session.insert();

		// Set HttpOnly cookie + return user
		const res = R.ok("User logged in successfully.");
		
		res.cookies.set({
			name: "sid",
			value: sid, // opaque only
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: SESSION_TTL_SEC,
		});

		return res;

	} catch (err: any) {

		console.error("Error on the server:", err);
		R.serverError("There was an error on the server");

	}
	
}