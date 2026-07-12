export const runtime = "nodejs";

import { ResponseBuilder as R } from "@/lib/utils/response";
import { getUserFromApiKey } from "@/lib/auth/apikey";
import { getTodayGoals } from "@/lib/services/macros";

export async function GET(req: Request) {

	const user = await getUserFromApiKey(req);

	if (!user) {
		return R.unauthorized("Invalid or missing API key.");
	}

	try {

		const data = await getTodayGoals(user.id);

		return R.ok(data, "Successfully retrieved macro goals.");

	} catch (err: any) {
		console.error("DB error:", err);
		return R.serverError("Server Error");
	}

}