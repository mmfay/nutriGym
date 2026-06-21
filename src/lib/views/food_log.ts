import "server-only";
import { PoolClient } from "pg";
import { Common } from "@/lib/tables/common";
import { SQL } from "@/lib/services/sql";

const VIEW = "food_log_v";

export class FoodLog extends Common {

	// food_tracker columns
	id:           number | null = null;
	user_id:      string | null = null;
	meal:         number | null = null;
	meal_name:    string | null = null;
	recorded_at:  string | null = null;
	serving_size: number | null = null;
	serving_unit: string | null = null;
	protein:      number | null = null;
	carbs:        number | null = null;
	fat:          number | null = null;
	calories:     number | null = null;
	is_ai:        boolean | null = null;

	// food catalog columns (null for AI entries)
	food_id:                   number | null = null;
	food_name:                 string | null = null;
	brand:                     string | null = null;
	barcode:                   string | null = null;
	food_serving_size:         number | null = null;
	food_serving_unit:         string | null = null;
	food_protein_per_serving:  number | null = null;
	food_carbs_per_serving:    number | null = null;
	food_fat_per_serving:      number | null = null;
	food_calories_per_serving: number | null = null;
	servings_equivalent:       number | null = null;
	is_verified:               boolean | null = null;

	constructor(client: PoolClient | null = null) {
		super(client);
	}

	// --- Static finders ---

	static async findById(userId: string, id: number, client: PoolClient | null = null): Promise<FoodLog | null> {

		const temp = new FoodLog(client);

		const { sql, params } = SQL()
			.select(VIEW)
			.where("user_id = ?", userId)
			.where("id = ?", id)
			.build();

		const row = await temp.fetchOne(sql, params);

		return FoodLog.fromRow(row, client);

	}

	static async findByUserAndDate(userId: string, date: string, client: PoolClient | null = null): Promise<FoodLog[]> {

		const temp = new FoodLog(client);

		const { sql, params } = SQL()
			.select(VIEW)
			.where("user_id = ?", userId)
			.where("recorded_at = ?", date)
			.orderBy("meal")
			.orderBy("id")
			.build();

		const rows = await temp.fetchAll(sql, params);

		return rows.map(r => FoodLog.fromRow(r, client)!);

	}

	static async findByUserMealAndDate(userId: string, meal: number, date: string, client: PoolClient | null = null): Promise<FoodLog[]> {

		const temp = new FoodLog(client);

		const { sql, params } = SQL()
			.select(VIEW)
			.where("user_id = ?", userId)
			.where("meal = ?", meal)
			.where("recorded_at = ?", date)
			.orderBy("id")
			.build();

		const rows = await temp.fetchAll(sql, params);

		return rows.map(r => FoodLog.fromRow(r, client)!);

	}

	static async findByUserAndDateRange(userId: string, from: string, to: string, client: PoolClient | null = null): Promise<FoodLog[]> {

		const temp = new FoodLog(client);

		const { sql, params } = SQL()
			.select(VIEW)
			.where("user_id = ?", userId)
			.where("recorded_at >= ?", from)
			.where("recorded_at <= ?", to)
			.orderBy("recorded_at")
			.orderBy("meal")
			.orderBy("id")
			.build();

		const rows = await temp.fetchAll(sql, params);

		return rows.map(r => FoodLog.fromRow(r, client)!);

	}

}
