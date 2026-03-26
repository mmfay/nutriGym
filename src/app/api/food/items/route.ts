// app/api/food/recent/dinner/route.ts
import { ResponseBuilder as R } from "@/lib/utils/response";
import { addNewFood } from "@/lib/services/food";
import { getUser } from "@/lib/services/user";

export async function POST(req: Request) {
	
	// check user
	const user = await getUser();
	
	const body = await req.json();
	const newFood = body.newFood;

	if(!newFood) {
		return R.badRequest("missing food");
	}
	
	await addNewFood(newFood, user?.is_sys_admin);

	return R.ok(null,"Food Created Successfully");

}
