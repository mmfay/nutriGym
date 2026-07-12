import "server-only";
import { PoolClient } from "pg";
import { Common } from "./common";
import { SQL } from "@/lib/services/sql";

const TABLE = "api_keys";

export class ApiKeys extends Common {

	id:         string | null = null;
	user_id:    string | null = null;
	key_hash:   string | null = null;
	key_prefix: string | null = null;
	created_at: Date | null = null;

	constructor(client: PoolClient | null = null) {
		super(client);
	}

	async insert(): Promise<this> {

		if (!this.user_id)    throw new Error("user_id required to insert");
		if (!this.key_hash)   throw new Error("key_hash required to insert");
		if (!this.key_prefix) throw new Error("key_prefix required to insert");

		const { sql, params } = SQL()
			.insertInto(TABLE)
			.values({
				user_id:    this.user_id,
				key_hash:   this.key_hash,
				key_prefix: this.key_prefix,
			})
			.returning("id", "user_id", "key_hash", "key_prefix", "created_at")
			.build();

		const row = await this.fetchOne(sql, params);

		if (!row) throw new Error("Insert failed: no row returned");

		this.id         = row.id as string;
		this.created_at = row.created_at as Date;

		return this;

	}

	// --- Static finders ---

	static async findByUser(userId: string, client: PoolClient | null = null): Promise<ApiKeys | null> {

		const temp = new ApiKeys(client);

		const { sql, params } = SQL()
			.select(TABLE)
			.where("user_id = ?", userId)
			.build();

		const row = await temp.fetchOne(sql, params);

		return ApiKeys.fromRow(row, client);

	}

	static async deleteByUser(userId: string, client: PoolClient | null = null): Promise<void> {

		const temp = new ApiKeys(client);

		const { sql, params } = SQL()
			.deleteFrom(TABLE)
			.where("user_id = ?", userId)
			.build();

		await temp.execute(sql, params);

	}

}