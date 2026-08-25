// lib/services/weight.ts
import pool from "@/lib/db/db";
import { Weight } from "../dataTypes";
import { ResponseBuilder as R } from "../utils/response";

export async function getWeightTrend(userId: string, days = 28) {

	const { rows } = await pool.query(
		`select
			measured_at::text as date
			,weight
		from weight
		where user_id = $1 and measured_at >= now() - ($2 || ' days')::interval
		order by measured_at asc`,
		[userId, days]
	);
	return rows;

}

// full weight history (with ids) for the measurements page, newest first
export async function getWeightHistory(userId: string): Promise<Weight[]> {

	const { rows } = await pool.query<Weight>(
		`select
			id
			,measured_at::text as measured_at
			,weight
		from weight
		where user_id = $1
		order by measured_at desc`,
		[userId]
	);
	return rows;

}

// deletes a single weight entry belonging to the user
export async function deleteWeight(userId: string, id: number) {

	await pool.query(
		`delete from weight where user_id = $1 and id = $2`,
		[userId, id]
	);

}

// adds weight and if old date specified it updates it, then returns trend to front end
export async function addWeight(userId: string, dateOfWeight: Date, weight: number) {

	const sql = `
	INSERT INTO WEIGHT (user_id, measured_at, weight, unit)
		VALUES ($1, $2::date, $3, 'lb')
		ON CONFLICT (user_id, measured_at)
		DO UPDATE SET
  			weight = EXCLUDED.weight
		RETURNING id, measured_at::text AS measured_at, weight;
	`;

	const { rows } = await pool.query<Weight>(sql, [userId, dateOfWeight, weight]);

	if (!rows) {
		return R.serverError("Not able to create weight, try again");
	}

	return rows[0];

}