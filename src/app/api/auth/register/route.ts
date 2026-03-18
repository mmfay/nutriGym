export const runtime = "nodejs";

import { ResponseBuilder as R } from "@/lib/utils/response";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db/db";
import bcrypt from "bcryptjs";

// input schema
const RegisterReq = z.object({
	email: z.string().email(),                  // unique
	name: z.string().min(1).max(120),
	password: z.string().min(8),                // will be hashed
});

// round of encryption
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

export async function POST(req: NextRequest) {
	
	// parse body
	let body: unknown;

	try {
		body = await req.json();
	} catch {
		return R.badRequest("Poorly formed Request");
	}

	const parsed = RegisterReq.safeParse(body);

	if (!parsed.success) {
		return R.badRequest("Invalid Payload");
	}

	const { email, name, password } = parsed.data;

	try {

		// normalize email
		const normEmail = email.trim().toLowerCase();

		// hash password
		const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

		// insert user
		const sql = `
		INSERT INTO users ( email, name, password_hash)
		VALUES ($1, $2, $3 )
		RETURNING email, name, created_at
		`;

		const { rows } = await pool.query(sql, [normEmail, name, password_hash]);

		return NextResponse.json(
			{ ok: true, user: rows[0] },
			{ status: 201 }
		);

	} catch (err: any) {

		// Handle unique constraint violations (Postgres 23505)
		if (err?.code === "23505") {

			return R.badRequest("Email already exists");

		}

		console.error(err);
		return R.serverError("An error occurred on the server.");
		
	}
}
