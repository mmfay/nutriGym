// app/api/food/log/clear/route.ts
import { clearFoodLog } from "@/lib/services/tracking";
import { ResponseBuilder as R } from "@/lib/utils/response";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getUser, SESSION_COOKIE } from "@/lib/auth/session";

export async function DELETE() {

	const userid = await getUser();
	const userId = userid?.id;

	// if no user is clear cookie and return unauthenticated
	if (!userId) {

		const res = R.unauthorized();
		// Optional: clear stale cookie so clients don’t keep sending it
		res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
		return res;

	}

	await clearFoodLog(userId);

	return R.ok({}, "Tracking history cleared");

}