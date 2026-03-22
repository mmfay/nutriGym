export const runtime = "nodejs";

import { ResponseBuilder as R } from "@/lib/utils/response";
import pool from "@/lib/db/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const SESSION_TTL_SEC = 60 * 60 * 24; // 1 Day

export async function POST(req: Request) {

	try {

		const body = await req.json();

		const { email, password } = body;

		const emailNorm = email.trim().toLowerCase();

		// fetch user by email
		const sql = `
			SELECT id, email, name, timezone, password_hash, is_enabled, email_verified
			FROM users
			WHERE email = $1
			LIMIT 1
		`;

		// store what is returned in rows
		const { rows } = await pool.query(sql, [emailNorm]);
		const user = rows[0];

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

		// validate password
		const valid = await bcrypt.compare(password, user.password_hash);
		if (!valid) {
			return R.unauthorized("Invalid email or password.");
		}
		
		// Create opaque session id + persist
		const sid = crypto.randomBytes(24).toString("base64url");

		// insert a server side session
		await pool.query(
		`
			INSERT INTO auth_sessions (id, user_id, data, expires_at)
			VALUES ($1, $2::uuid, '{}'::jsonb, now() + make_interval(secs => $3))
			ON CONFLICT (id) DO NOTHING
		`,
		[sid, user.id, SESSION_TTL_SEC]
		);

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