import { ApiResult } from "@/lib/dataTypes/results";
import { RecipeCreate, UserRecipe } from "@/lib/dataTypes";
import { getJSON, postJSON, deleteJSON } from "../submissions";

export async function getRecipes(): Promise<ApiResult<UserRecipe[]>> {
	return getJSON("/api/recipes");
}

export async function createRecipe(data: RecipeCreate): Promise<ApiResult<UserRecipe>> {
	return postJSON("/api/recipes", data);
}

export async function deleteRecipe(id: number): Promise<ApiResult<null>> {
	return deleteJSON("/api/recipes", { id });
}