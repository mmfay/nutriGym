import { getSession } from "@/lib/auth/session";
import { ResponseBuilder as R } from "@/lib/utils/response";
import { getUserRecipes, createRecipe, deleteRecipe } from "@/lib/services/recipes";

export async function GET() {

	const session = await getSession();
	if (!session) return R.unauthorized();

	const recipes = await getUserRecipes(session.user_id);
	return R.ok(recipes);

}

export async function POST(req: Request) {

	const session = await getSession();
	if (!session) return R.unauthorized();

	const body = await req.json();
	const { name, yield_size, yield_unit, items } = body;

	if (!name?.trim()) return R.badRequest("Recipe name is required");
	if (!Array.isArray(items) || items.length === 0) return R.badRequest("Recipe must have at least one item");
	const yieldSize = Number(yield_size);
	if (!Number.isFinite(yieldSize) || yieldSize <= 0) return R.badRequest("Yield size must be a positive number");
	if (!yield_unit?.trim()) return R.badRequest("Yield unit is required");

	const recipe = await createRecipe(session.user_id, { name: name.trim(), yield_size: yieldSize, yield_unit: yield_unit.trim(), items });
	return R.created(recipe, "Recipe created");

}

export async function DELETE(req: Request) {

	const session = await getSession();
	if (!session) return R.unauthorized();

	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get("id"));

	if (!id) return R.badRequest("Missing recipe id");

	const deleted = await deleteRecipe(session.user_id, id);
	if (!deleted) return R.badRequest("Recipe not found");

	return R.ok(null, "Recipe deleted");

}
