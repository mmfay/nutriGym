import { ResponseBuilder as R } from "@/lib/utils/response";
import { estimateMacrosFromImage, getRemainingRequests, releaseAIUsage, reserveAIUsage, commitAIUsage } from "@/lib/services/ai";
import { getUserID } from "@/lib/services/user";
import { timezoneDate } from "@/lib/utils/date";
import { getUser } from "@/lib/auth/session";
import { User } from "@/lib/dataTypes/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {

	let user: User | null = null;
	let date: string | null = null;
	let reserved = false;
	let committed = false;

	try {

		user = await getUser();

		if (!user) {
			return R.unauthorized("User is not authorized");
		}

		date = timezoneDate(user?.timezone);

		const form = await req.formData();
		const file = form.get("image");

		if (!(file instanceof File)) {
			return R.badRequest("Missing image.");
		}

		if (!file.type.startsWith("image/")) {
			return R.badRequest("File must be an image.");
		}

		const bytes = new Uint8Array(await file.arrayBuffer());

		if (bytes.length === 0) {
			return R.badRequest("Empty upload.");
		}

		reserved = await reserveAIUsage(user.id, date);

		if (!reserved) {
			return R.badRequest("No more AI requests remain.");
		}

		const macros = await estimateMacrosFromImage({
			bytes,
			mimeType: file.type || "image/jpeg",
		});

		await commitAIUsage(user.id, date);

		committed = true;

		return R.ok(macros, "Successfully retrieved macros");

	} catch (err) {

		if (err instanceof Response) return err;

		console.error("POST /api/food/items failed:", err);

		if (err instanceof Error) {
			console.error("Error message:", err.message);
			console.error("Error stack:", err.stack);
		} else {
			console.error("Non-Error thrown:", JSON.stringify(err, null, 2));
		}

		return R.serverError("Something went wrong");

	} finally {

		if (reserved && !committed && user?.id && date) {

			try {
				await releaseAIUsage(user.id, date);
			} catch (releaseErr) {
				console.error("Failed to release AI usage:", releaseErr);
			}

		}

	}
	
}


export async function GET() {
	
	try {

		const user = await getUser(); 

		if (!user) {
			return R.unauthorized("User is not Authenticated");
		}

		const date = timezoneDate(user?.timezone);

		const remainingAIRequests = await getRemainingRequests(user.id, date);

		return R.ok({requests: remainingAIRequests}, "Successfully retrieved requests");

	} catch (err) {

		if (err instanceof Response) return err;

		console.error("GET /api/food/items:", err);
		return R.serverError("Something went wrong");
	}

}