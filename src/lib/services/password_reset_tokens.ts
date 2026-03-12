// lib/services/password_reset_tokens.ts
import pool from "@/lib/db/db";
import crypto from "crypto";

import { PasswordResetToken } from "../dataTypes/auth";

const RESET_TOKEN_TTL_MINUTES = 5;

/**
 * Creates the Password Reset Token Record in the db.
 * 
 * @param userId Id of the User creating the reset token
 * @param tokenHash hashed token to store securely in the DB
 * @returns Password Reset Token Record
 */
export async function createPasswordResetToken(
	userId: number,
	tokenHash: string
): Promise<PasswordResetToken> {

	const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

	const sql = `
		INSERT INTO password_reset_tokens (
			user_id,
			token_hash,
			expires_at
		)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			user_id,
			token_hash,
			expires_at,
			used_at,
			created_at
	`;

	const { rows } = await pool.query<PasswordResetToken>(sql, [
		userId,
		tokenHash,
		expiresAt,
	]);

	return rows[0];
	
}

/**
 * Method allows the check of a token to see if it is still valid.
 * 
 * @param token The raw password reset token provided by user
 * @returns The matching password reset token record if valid; otherwise null
 */
export async function getValidPasswordResetToken(
	token: string
): Promise<PasswordResetToken | null> {
	const normalizedToken = token.trim();

	if (!normalizedToken) {
		return null;
	}

	const tokenHash = crypto
		.createHash("sha256")
		.update(normalizedToken)
		.digest("hex");

	const sql = `
		SELECT
			id,
			user_id,
			token_hash,
			expires_at,
			used_at,
			created_at
		FROM password_reset_tokens
		WHERE token_hash = $1
		  AND used_at IS NULL
		  AND expires_at > now()
		LIMIT 1
	`;

	const { rows } = await pool.query<PasswordResetToken>(sql, [tokenHash]);

	return rows[0] ?? null;

}