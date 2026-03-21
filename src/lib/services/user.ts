import { getUser, SESSION_COOKIE } from "@/lib/auth/session";
import { ResponseBuilder as R } from "../utils/response";
import bcrypt from "bcryptjs";
import pool from "../db/db";
import { User } from "../dataTypes/auth";
import { Mailer } from "./mailer";

export async function getUserID(){

	const user = await getUser();
	const userID = user?.id; 

	// if no user is clear cookie and return unauthenticated
	if (!userID) {

		const res = R.unauthorized("You Must be Signed In.");
		// Clear stale cookie so clients don’t keep sending it
		res.cookies.set(SESSION_COOKIE, "", { 
			httpOnly: true, 
			secure: true, 
			sameSite: "lax", 
			path: "/", 
			maxAge: 0 
		});
		throw res;

	}

	return userID;

}

/**
 * Finds the user Record by UserID
 * 
 * @param userId id of the user to find by
 * @returns the User record if found, null otherwise.
 */
export async function findUserById(userId: string): Promise<User | null> {

	const sql = `
		SELECT
			id,
			email,
			name,
			password_hash
		FROM users
		WHERE id = $1
		LIMIT 1
	`;

	const { rows } = await pool.query<User>(sql, [userId]);

	return rows[0] ?? null;

}

/**
 * Updates the password for the user id in the database
 * 
 * @param userId id of the user that needs a password update
 * @param password the new password to store in the db
 */
export async function updatePassword(
	userId: number,
	password: string
): Promise<void> {

	const SALT_ROUNDS = 12;

	const normalizedPassword = password.trim();

	if (!userId) {
		console.log('UserID Error');
		throw new Error("User ID is required.");
	}

	if (!normalizedPassword) {
		console.log('password Error');
		throw new Error("Password is required.");
	}

	const passwordHash = await bcrypt.hash(normalizedPassword, SALT_ROUNDS);

	const sql = `
		UPDATE users
		SET
			password_hash = $2
		WHERE id = $1
	`;

	await pool.query(sql, [userId, passwordHash]);

}

/**
 * Finds the User Record if the email exists
 * 
 * @param email email of user we need to find
 * @returns User record if found, null otherwise;
 */
export async function findUserByEmail(email: string): Promise<User | null> {

	const sql = `
		SELECT 
			id
			,email 
			,name
		FROM users
		WHERE LOWER(email) = LOWER($1)
		LIMIT 1
	`;

	const { rows } = await pool.query<User>(sql, [email]);

	return rows[0] ?? null;

}

export async function updateUser(name: string, email: string, timezone: string, id: string): Promise<User | null> {

	const sql = `
		UPDATE users 
		SET 
			name = $1,
			email = $2,
			timezone = $3
		WHERE 
			id = $4
		RETURNING
			name,
			email,
			timezone,
			id;
	`;

	try {
		const { rows } = await pool.query<User>(sql, [name, email, timezone, id]);
		return rows[0] ?? null;
	} catch (error: any) {
		if (error.code === "23505") {
			throw Error("EMAIL_IN_USE");
		}
		console.log(error);
		throw Error("Something went wrong");
	}

}

export async function insertUser(email: string, name: string, hashedPassword: string) {

	// insert user
	const sql = `
		INSERT INTO users ( email, name, password_hash)
		VALUES ($1, $2, $3 )
		RETURNING email, name, created_at;
	`;

	const { rows } = await pool.query(sql, [email, name, hashedPassword]);
	const createdUser = rows[0] ?? null;

	if (!createdUser) {
		throw new Error("USER_CREATE_FAILED");
	}

	const mailer = new Mailer();

	mailer.sendVerificationEmail(createdUser.email, createdUser.name);

	return createdUser;

}

/**
 * Verifies a user's email if the provided token hash is valid and not expired.
 *
 * @param tokenHash hashed verification token
 * @returns updated user record if verified, null otherwise
 */
export async function verifyEmailByTokenHash(tokenHash: string): Promise<User | null> {
	
	const sql = `
		UPDATE users
		SET
			email_verified = TRUE,
			email_verified_at = NOW(),
			email_verification_token_hash = NULL,
			email_verification_expires_at = NULL
		WHERE
			email_verification_token_hash = $1
			AND email_verification_expires_at > NOW()
			AND email_verified = FALSE
		RETURNING
			id,
			email,
			name,
			timezone,
			is_enabled,
			email_verified,
			email_verified_at,
			created_at;
	`;

	const { rows } = await pool.query<User>(sql, [tokenHash]);

	const user = rows[0] ?? null;

	return user;

}

export type VerificationEmailTokenResult = {
	user_id: string;
	email_verification_token_hash: string;
	email_verification_expires_at: string;
};

export async function createVerificationEmailToken(
	userID: string,
	hashedToken: string
): Promise<VerificationEmailTokenResult | null> {

	const sql = `
		UPDATE users
		SET
			email_verification_token_hash = $1,
			email_verification_expires_at = NOW() + INTERVAL '24 hours'
		WHERE
			id = $2
		RETURNING
			id as user_id,
			email_verification_token_hash,
			email_verification_expires_at;
	`;

	const { rows } = await pool.query<VerificationEmailTokenResult>(sql, [hashedToken, userID]);

	return rows[0] ?? null;

}