import OpenAI from "openai";

import pool from "@/lib/db/db";
import { ResponseBuilder as R } from "../utils/response";
import { FoodMacros } from "../dataTypes";

// Daily AI Usage Limit
const DAILY_LIMIT = 3;

// API Key
function getOpenAIClient() {

	const apiKey = process.env.OPENAI_API_KEY;

	if (!apiKey) {
		throw new Error("OPENAI_API_KEY is not configured");
	}

	return new OpenAI({ apiKey });

}

// builds image.
function toDataUrl(bytes: Uint8Array, mimeType: string) {
	const base64 = Buffer.from(bytes).toString("base64");
	return `data:${mimeType};base64,${base64}`;
}

/**
 * Moderates an image (data URL or regular URL). Throws if flagged.
 * Uses omni-moderation-latest which supports image inputs.
 */
async function moderateImage(imageUrl: string) {
	const mod = await getOpenAIClient().moderations.create({
		model: "omni-moderation-latest",
		input: [
		// Optional: include a little text context for better classification signals
		{ type: "text", text: "User uploaded an image for food macro estimation." },
		{ type: "image_url", image_url: { url: imageUrl } },
		],
	});

	const result = mod.results?.[0];

	if (!result) {
		throw R.badGateway("Issue moderating request");
	}

	// improve on how we moderate for now, just throw an error.
	if (result.flagged) {
		// You can choose to be more granular (block only certain categories),
		// but simplest is: if flagged => reject.
		const categories = Object.entries(result.categories ?? {})
		.filter(([, v]) => v)
		.map(([k]) => k);

		throw R.badRequest("Photo did not pass moderation");
	}

	return result; // in case you want logging/telemetry
}

/**
 * Uses OpenAI to calculate macros from an image.
 */
export async function estimateMacrosFromImage(args: {
	bytes: Uint8Array;
	mimeType: string;
}){

	const { bytes, mimeType } = args;

	const imageUrl = toDataUrl(bytes, mimeType);

	// moderate photo, way to make sure someone isn't violating the use of the app.
	await moderateImage(imageUrl);

	// macro estimation prompt if moderation is successful
	const prompt =
		`You are a nutrition estimator.\n` +
		`First, identify the food as a COMMON NAME someone would type into a food log (1–3 words).\n` +
		`Examples: "lemon", "chicken fajitas", "pepperoni pizza", "scrambled eggs".\n` +
		`Do NOT describe the scene or use adjectives like "plate of", "close-up", "homemade".\n` +
		`\n` +
		`Then estimate TOTAL macros for all food shown (combine items).\n` +
		`Return ONLY valid JSON with EXACT keys: foodName, calories, protein, carbs, fat.\n` +
		`Numbers only. Protein/carbs/fat are grams. No extra text.`;

	const resp = await getOpenAIClient().chat.completions.create({
		model: "gpt-4.1-mini",
		temperature: 0.2,
		messages: [
			{
				role: "user",
				content: [
					{ type: "text", text: prompt },
					{ type: "image_url", image_url: { url: imageUrl } },
				],
			},
		],
		response_format: { type: "json_object" },
	});

	const text = resp.choices[0]?.message?.content ?? "{}";

	let parsed: any;

	try {
		parsed = JSON.parse(text);
	} catch {
		throw R.badGateway("Service was not able to process at this time");
	}

	const macros: FoodMacros = {
		foodName: parsed.foodName,
		calories: Number(parsed.calories ?? 0),
		protein: Number(parsed.protein ?? 0),
		carbs: Number(parsed.carbs ?? 0),
		fat: Number(parsed.fat ?? 0),
	};

	if (
		!Number.isFinite(macros.calories) ||
		!Number.isFinite(macros.protein) ||
		!Number.isFinite(macros.carbs) ||
		!Number.isFinite(macros.fat) ||
		!macros.foodName
	) {
		throw R.badGateway("Service was not able to process at this time.");
	}

	return macros;

}

/**
 * 
 * checks to see how many AI Requests a User has remaining.
 * To help limit the currently free API usage from client perspective.
 */
export async function getRemainingRequests(user_id: string, usage_date: string) {

	const sql = `
		SELECT 
			COALESCE(used_count, 0) AS used_count,
			COALESCE(pending_count, 0) AS pending_count
		FROM ai_daily_usage
		WHERE
			user_id = $1
			AND usage_date = $2
	`;

	const { rows } = await pool.query(sql, [user_id, usage_date]);

	const used = Number(rows[0]?.used_count ?? 0);
	const pending = Number(rows[0]?.pending_count ?? 0);

	return Math.max(0, DAILY_LIMIT - used - pending);
}

/**
 * log increased usage when AI is used.
 */
export async function increaseUsage(user_id: string, usage_date: string) {

	const sql = `
		insert into ai_daily_usage (user_id, usage_date, used_count)
		values ($1, $2::date, 1)
		on conflict (user_id, usage_date)
		do update
		set used_count = ai_daily_usage.used_count + 1,
			updated_at = now()
		where ai_daily_usage.used_count < $3
		returning used_count;
	`;

	const { rows } = await pool.query(sql, [user_id, usage_date, DAILY_LIMIT]);

	// If no row returned, user is already at (or above) the limit
	if (rows.length === 0) {

		return R.badRequest("No Remaining AI Requests");

	}

	const used = Number(rows[0].used_count);
	const remaining = Math.max(DAILY_LIMIT - used, 0);

	return R.ok({used, remaining}, "Request Remain");

}

/**
 * add to AI Usage as Pending
 */
export async function reserveAIUsage(
	user_id: string,
	usage_date: string
): Promise<boolean> {

	const sql = `
		INSERT INTO ai_daily_usage (
			user_id,
			usage_date,
			used_count,
			pending_count
		)
		VALUES ($1, $2, 0, 1)
		ON CONFLICT (user_id, usage_date)
		DO UPDATE
			SET pending_count = ai_daily_usage.pending_count + 1
		WHERE (ai_daily_usage.used_count + ai_daily_usage.pending_count) < $3
		RETURNING user_id;
	`;

	const { rowCount } = await pool.query(sql, [user_id, usage_date, DAILY_LIMIT]);

	return rowCount === 1;

}

/**
 * Commit pending AI Usage.
 */
export async function commitAIUsage(
	user_id: string,
	usage_date: string
): Promise<void> {

	const sql = `
		UPDATE ai_daily_usage
		SET
			pending_count = pending_count - 1,
			used_count = used_count + 1,
			updated_at = now()
		WHERE
			user_id = $1
			AND usage_date = $2
			AND pending_count > 0;
	`;

	const { rowCount } = await pool.query(sql, [user_id, usage_date]);

	if (rowCount !== 1) {
		throw new Error("Failed to commit AI usage reservation.");
	}

}

/**
 * release pending committed AI Usage
 */
export async function releaseAIUsage(
	user_id: string,
	usage_date: string
): Promise<void> {

	const sql = `
		UPDATE ai_daily_usage
		SET pending_count = pending_count - 1
		WHERE
			user_id = $1
			AND usage_date = $2
			AND pending_count > 0;
	`;

	const { rowCount } = await pool.query(sql, [user_id, usage_date]);

	if (rowCount !== 1) {
		throw new Error("Failed to release AI usage reservation.");
	}

}