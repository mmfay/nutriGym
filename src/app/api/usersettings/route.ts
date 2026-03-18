export const runtime = "nodejs"; // force Node runtime (pg doesn't work on Edge)

import { ResponseBuilder as R } from "@/lib/utils/response";
import { getUser } from "@/lib/auth/session";
import { updateUser } from "@/lib/services/user";

// shows we can connect to our database
export async function GET() {

	const user = await getUser();  

	if (!user) {
		return R.unauthorized("User is not authenticated");
	}

    try {
      	
      	return R.ok(user, "Successful retrieved user.");

    } catch (err: any) {

		console.error("DB error: ", err);

		if (err instanceof Error) {
			if (err.message === "EMAIL_IN_USE") {
				return R.badRequest("Email in use");
			}
			return R.serverError("Something went wrong");
		}

		return R.serverError("Server Error");
		
    }
	
}

// shows we can connect to our database
export async function PATCH(req: Request) {

	const user = await getUser();

	if (!user) {
		return R.unauthorized("User is not authenticated");
	}

	try {

		const body = await req.json();
		const { name, email, timezone } = body;

		const updatedUser = await updateUser(name, email, timezone, user.id);

      	return R.ok(updatedUser, "Successfully updated user");

    } catch (err: any) {
      	console.error("DB error:", err);
      	return R.serverError("Server Error");
    }
	
}
