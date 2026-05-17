type BuildResult = { sql: string; params: unknown[] };
type Direction = "ASC" | "DESC";
type JoinType = "JOIN" | "LEFT JOIN" | "RIGHT JOIN" | "INNER JOIN";

class QueryBuilder {
	private _params: unknown[] = [];
	private _type: "select" | "insert" | "update" | "delete" = "select";

	private _table = "";
	private _cols: string[] = [];
	private _joins: string[] = [];
	private _wheres: string[] = [];
	private _orders: string[] = [];
	private _limitVal?: number;
	private _offsetVal?: number;

	private _insertData: Record<string, unknown> = {};
	private _updateTable = "";
	private _sets: string[] = [];

	private _returning: string[] = [];

	private param(val: unknown): string {
		this._params.push(val);
		return `$${this._params.length}`;
	}

	// SELECT

	select(table: string): this {
		this._type = "select";
		this._table = table;
		return this;
	}

	columns(...cols: string[]): this {
		this._cols.push(...cols);
		return this;
	}

	join(table: string, on: string, type: JoinType = "JOIN"): this {
		this._joins.push(`${type} ${table} ON ${on}`);
		return this;
	}

	leftJoin(table: string, on: string): this {
		return this.join(table, on, "LEFT JOIN");
	}

	where(condition: string, ...values: unknown[]): this {
		let i = 0;
		const cond = condition.replace(/\?/g, () => this.param(values[i++]));
		this._wheres.push(cond);
		return this;
	}

	orderBy(col: string, dir: Direction = "ASC"): this {
		this._orders.push(`${col} ${dir}`);
		return this;
	}

	limit(n: number): this {
		this._limitVal = n;
		return this;
	}

	offset(n: number): this {
		this._offsetVal = n;
		return this;
	}

	// INSERT

	insertInto(table: string): this {
		this._type = "insert";
		this._table = table;
		return this;
	}

	values(data: Record<string, unknown>): this {
		this._insertData = data;
		return this;
	}

	// UPDATE

	update(table: string): this {
		this._type = "update";
		this._updateTable = table;
		return this;
	}

	set(col: string, value: unknown): this;
	set(data: Record<string, unknown>): this;
	set(colOrData: string | Record<string, unknown>, value?: unknown): this {
		if (typeof colOrData === "string") {
			this._sets.push(`${colOrData} = ${this.param(value)}`);
		} else {
			for (const [k, v] of Object.entries(colOrData)) {
				this._sets.push(`${k} = ${this.param(v)}`);
			}
		}
		return this;
	}

	// DELETE

	deleteFrom(table: string): this {
		this._type = "delete";
		this._table = table;
		return this;
	}

	// RETURNING

	returning(...cols: string[]): this {
		this._returning.push(...cols);
		return this;
	}

	// BUILD

	build(): BuildResult {
		switch (this._type) {
			case "select": return this.buildSelect();
			case "insert": return this.buildInsert();
			case "update": return this.buildUpdate();
			case "delete": return this.buildDelete();
		}
	}

	private buildSelect(): BuildResult {
		const cols = this._cols.length ? this._cols.join(", ") : "*";
		const parts = [`SELECT ${cols} FROM ${this._table}`];
		if (this._joins.length)  parts.push(this._joins.join("\n"));
		if (this._wheres.length) parts.push(`WHERE ${this._wheres.join(" AND ")}`);
		if (this._orders.length) parts.push(`ORDER BY ${this._orders.join(", ")}`);
		if (this._limitVal  != null) parts.push(`LIMIT ${this._limitVal}`);
		if (this._offsetVal != null) parts.push(`OFFSET ${this._offsetVal}`);
		return { sql: parts.join("\n"), params: this._params };
	}

	private buildInsert(): BuildResult {
		const keys = Object.keys(this._insertData);
		const cols = keys.join(", ");
		const placeholders = keys.map(k => this.param(this._insertData[k])).join(", ");
		let sql = `INSERT INTO ${this._table} (${cols}) VALUES (${placeholders})`;
		if (this._returning.length) sql += `\nRETURNING ${this._returning.join(", ")}`;
		return { sql, params: this._params };
	}

	private buildUpdate(): BuildResult {
		const parts = [`UPDATE ${this._updateTable} SET ${this._sets.join(", ")}`];
		if (this._wheres.length)   parts.push(`WHERE ${this._wheres.join(" AND ")}`);
		if (this._returning.length) parts.push(`RETURNING ${this._returning.join(", ")}`);
		return { sql: parts.join("\n"), params: this._params };
	}

	private buildDelete(): BuildResult {
		const parts = [`DELETE FROM ${this._table}`];
		if (this._wheres.length)   parts.push(`WHERE ${this._wheres.join(" AND ")}`);
		if (this._returning.length) parts.push(`RETURNING ${this._returning.join(", ")}`);
		return { sql: parts.join("\n"), params: this._params };
	}
}

export function SQL(): QueryBuilder {
	return new QueryBuilder();
}
