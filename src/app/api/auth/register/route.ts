export const runtime = "nodejs";

import { ResponseBuilder as R } from "@/lib/utils/response";
import pool from "@/lib/db/db";
import bcrypt from "bcryptjs";

// round of encryption
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

export async function POST(req: Request) {

	try {

		const body = await req.json();
		const { email, name, password } = body;

		if (!email || !name || !password) {
			R.badRequest("Invalid Payload");
		}

		// normalize email
		const normEmail = email.trim().toLowerCase();

		// hash password
		const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

		// insert user
		const sql = `
		INSERT INTO users ( email, name, password_hash)
		VALUES ($1, $2, $3 )
		RETURNING email, name, created_at;
		`;

		const { rows } = await pool.query(sql, [normEmail, name, password_hash]);

		return R.ok(rows[0], "User Added Successfully");

	} catch (err: any) {
		
		// Handle unique constraint violations (Postgres 23505)
		if (err?.code === "23505") {

			return R.badRequest("Email already exists");

		}

		console.error(err);
		return R.serverError("An error occurred on the server.");

	}

}
