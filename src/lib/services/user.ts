import { getUser, SESSION_COOKIE } from "@/lib/auth/session";
import { ResponseBuilder as R } from "../utils/response";
import bcrypt from "bcryptjs";
import pool from "../db/db";
import { User } from "../dataTypes/auth";

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