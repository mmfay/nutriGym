export type CursorPage<T> = {
	items: T[];
	nextCursor: string | null;
	hasMore: boolean;
};

export function encodeCursor(payload: Record<string, unknown>): string {
	return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeCursor(cursor: string): Record<string, unknown> {
	try {
		return JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
	} catch {
		throw new Error("Invalid cursor");
	}
}
