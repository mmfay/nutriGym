export const runtime = "nodejs";

import { ResponseBuilder as R } from "@/lib/utils/response";
import { getUserFromApiKey } from "@/lib/auth/apikey";
import { getMacroTrend } from "@/lib/services/macros";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {

	const user = await getUserFromApiKey(req);

	if (!user) {
		return R.unauthorized("Invalid or missing API key.");
	}

	try {

		const { searchParams } = new URL(req.url);

		const dateParam = searchParams.get("date");

		let date = new Date().toISOString().slice(0, 10);

		if (dateParam !== null) {

			if (!DATE_RE.test(dateParam)) {
				return R.badRequest("date must be formatted as YYYY-MM-DD");
			}

			date = dateParam;

		}

		const data = await getMacroTrend(user.id, date);

		return R.ok(data, "Successfully retrieved tracked macros.");

	} catch (err: any) {
		console.error("DB error:", err);
		return R.serverError("Server Error");
	}

}