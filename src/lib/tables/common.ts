import "server-only";
import pool from "@/lib/db/db";
import { PoolClient, QueryResult } from "pg";

/**
 * Base data access class providing shared database operations.
 *
 * Supports two modes:
 *   Bound client (passed in) → used for transactions
 *   Auto-managed client     → acquired/released per call
 *
 * This allows higher-level services to control transactions when needed,
 * while keeping simple queries lightweight.
 *
 */
export class Common {

	protected _client: PoolClient | null;

	constructor(client: PoolClient | null = null) {
		this._client = client;
	}

	private usingBoundClient(): boolean {
		return this._client !== null;
	}

	private async acquire(): Promise<{ client: PoolClient; release: () => void }> {
		if (this._client) {
			return { client: this._client, release: () => {} };
		}
		const client = await pool.connect();
		return { client, release: () => client.release() };
	}

	// Execute a statement (INSERT / UPDATE / DELETE).
	async execute(sql: string, params: unknown[] = []): Promise<QueryResult> {
		const { client, release } = await this.acquire();
		try {
			return await client.query(sql, params);
		} finally {
			release();
		}
	}

	// Fetch a single row. Returns null if not found.
	async fetchOne<T extends Record<string, unknown> = Record<string, unknown>>(
		sql: string,
		params: unknown[] = []
	): Promise<T | null> {
		const { client, release } = await this.acquire();
		try {
			const result = await client.query<T>(sql, params);
			return result.rows[0] ?? null;
		} finally {
			release();
		}
	}

	// Fetch multiple rows. Always returns an array.
	async fetchAll<T extends Record<string, unknown> = Record<string, unknown>>(
		sql: string,
		params: unknown[] = []
	): Promise<T[]> {
		const { client, release } = await this.acquire();
		try {
			const result = await client.query<T>(sql, params);
			return result.rows;
		} finally {
			release();
		}
	}

	// Fetch a single scalar value (COUNT, SUM, ID, etc.).
	async fetchValue<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
		const { client, release } = await this.acquire();
		try {
			const result = await client.query(sql, params);
			if (!result.rows[0]) return null;
			return Object.values(result.rows[0])[0] as T;
		} finally {
			release();
		}
	}

	// Map a DB row to an instance of the calling subclass.
	// Only sets keys that already exist as properties on the instance.
	static fromRow<T extends Common>(
		this: new (client?: PoolClient | null) => T,
		row: Record<string, unknown> | null,
		client: PoolClient | null = null
	): T | null {
		if (!row) return null;
		const obj = new this(client);
		for (const [key, value] of Object.entries(row)) {
			if (key in obj) {
				(obj as unknown as Record<string, unknown>)[key] = value;
			}
		}
		return obj;
	}

	// Run a block of operations inside a single transaction.
	// Automatically commits on success or rolls back on error.
	static async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			const result = await fn(client);
			await client.query("COMMIT");
			return result;
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	}
}
