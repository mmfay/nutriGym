import "server-only";
import pool from "@/lib/db/db";
import { RecipeCreate } from "@/lib/dataTypes";

export async function getUserRecipes(user_id: string) {

	const sql = `
		SELECT
			r.id,
			r.name,
			r.created_at,
			r.yield_size,
			r.yield_unit,
			COALESCE(
				json_agg(
					json_build_object(
						'id',           ri.id,
						'food_id',      ri.food_id,
						'food_name',    f.name,
						'brand',        f.brand,
						'serving_size', ri.serving_size,
						'serving_unit', ri.serving_unit,
						'calories',     ri.calories,
						'protein',      ri.protein,
						'carbs',        ri.carbs,
						'fat',          ri.fat
					) ORDER BY ri.id
				) FILTER (WHERE ri.id IS NOT NULL),
				'[]'
			) AS items
		FROM recipes r
		LEFT JOIN recipe_items ri ON ri.recipe_id = r.id
		LEFT JOIN food f ON f.id = ri.food_id
		WHERE r.user_id = $1
		GROUP BY r.id
		ORDER BY r.created_at DESC
	`;

	const { rows } = await pool.query(sql, [user_id]);
	return rows;

}

export async function createRecipe(user_id: string, data: RecipeCreate) {

	const client = await pool.connect();

	try {

		await client.query("BEGIN");

		const { rows: [recipe] } = await client.query(
			`INSERT INTO recipes (user_id, name, yield_size, yield_unit)
			 VALUES ($1, $2, $3, $4)
			 RETURNING id, name, created_at, yield_size, yield_unit`,
			[user_id, data.name, data.yield_size, data.yield_unit]
		);

		for (const item of data.items) {
			await client.query(
				`INSERT INTO recipe_items (recipe_id, food_id, serving_size, serving_unit, calories, protein, carbs, fat)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
				[recipe.id, item.food_id, item.serving_size, item.serving_unit, item.calories, item.protein, item.carbs, item.fat]
			);
		}

		await client.query("COMMIT");
		return { ...recipe, items: data.items };

	} catch (e) {

		await client.query("ROLLBACK");
		throw e;

	} finally {

		client.release();

	}

}

export async function deleteRecipe(user_id: string, recipe_id: number) {

	const { rowCount } = await pool.query(
		`DELETE FROM recipes WHERE id = $1 AND user_id = $2`,
		[recipe_id, user_id]
	);

	return rowCount === 1;

}
