import { ResponseBuilder as R } from "@/lib/utils/response";
import { getUser } from "@/lib/auth/session";
import { copyMealFromPrevDay } from "@/lib/services/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {

	try {

		const user = await getUser();

		if (!user) return R.unauthorized();

		const { meal, toDate } = await req.json();

		if (typeof meal !== "number" || meal < 0 || meal > 3) return R.badRequest("Invalid meal");

		if (!toDate) return R.badRequest("Missing Date to Copy to");

		const items = await copyMealFromPrevDay(user.id, meal, toDate);

		return R.ok(items, "Meal copied successfully");

	} catch (err) {

		console.error(err);
		return R.serverError("Failed to copy meal");
		
	}

}
