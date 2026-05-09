"use client";

import { useCallback, useRef, useState } from "react";
import { searchFood } from "../api/food/food";
import { getRecipes, createRecipe, deleteRecipe } from "../api/recipes/recipes";
import { Food, RecipeItemCreate, PendingRecipeItem, UserRecipe } from "../dataTypes";

export type RecipeController = {
	loading: boolean;
	saving: boolean;
	error: string | null;

	recipes: UserRecipe[];
	fetchRecipes: () => Promise<void>;
	deleteSavedRecipe: (id: number) => Promise<void>;

	recipeName: string;
	setRecipeName: (name: string) => void;
	pendingItems: PendingRecipeItem[];
	addItemToPending: (item: PendingRecipeItem) => void;
	removeItemFromPending: (tempId: string) => void;
	clearPending: () => void;
	saveRecipe: () => Promise<void>;

	onSearch: (text: string) => Promise<Food[]>;

	servingPickerFood: Food | null;
	servingPickerOpen: boolean;
	openServingPicker: (food: Food) => void;
	closeServingPicker: () => void;

	addFoodModalOpen: boolean;
	openAddFoodModal: () => void;
	closeAddFoodModal: () => void;
};

export function useRecipeController(): RecipeController {

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [recipes, setRecipes] = useState<UserRecipe[]>([]);

	const [recipeName, setRecipeName] = useState("");
	const [pendingItems, setPendingItems] = useState<PendingRecipeItem[]>([]);

	const [servingPickerFood, setServingPickerFood] = useState<Food | null>(null);
	const [servingPickerOpen, setServingPickerOpen] = useState(false);

	const [addFoodModalOpen, setAddFoodModalOpen] = useState(false);

	const aliveRef = useRef(true);

	const fetchRecipes = useCallback(async () => {

		setLoading(true);
		setError(null);

		const res = await getRecipes();

		if (!aliveRef.current) return;

		if (!res.ok) {
			setError(res.message);
			setLoading(false);
			return;
		}

		setRecipes((res.data as UserRecipe[]) ?? []);
		setLoading(false);

	}, []);

	const deleteSavedRecipe = useCallback(async (id: number) => {

		setError(null);

		const res = await deleteRecipe(id);

		if (!res.ok) {
			setError(res.message);
			return;
		}

		setRecipes((prev) => prev.filter((r) => r.id !== id));

	}, []);

	const addItemToPending = useCallback((item: PendingRecipeItem) => {
		setPendingItems((prev) => [...prev, item]);
	}, []);

	const removeItemFromPending = useCallback((tempId: string) => {
		setPendingItems((prev) => prev.filter((i) => i.tempId !== tempId));
	}, []);

	const clearPending = useCallback(() => {
		setPendingItems([]);
		setRecipeName("");
	}, []);

	const saveRecipe = useCallback(async () => {

		if (!recipeName.trim()) {
			setError("Recipe name is required");
			return;
		}

		if (pendingItems.length === 0) {
			setError("Add at least one food item");
			return;
		}

		setSaving(true);
		setError(null);

		const items: RecipeItemCreate[] = pendingItems.map((p) => ({
			food_id: p.food.id as number,
			serving_size: p.serving_size,
			serving_unit: p.serving_unit,
			calories: p.calories,
			protein: p.protein,
			carbs: p.carbs,
			fat: p.fat,
		}));

		const res = await createRecipe({ name: recipeName.trim(), items });

		setSaving(false);

		if (!res.ok) {
			setError(res.message);
			return;
		}

		setPendingItems([]);
		setRecipeName("");
		fetchRecipes();

	}, [recipeName, pendingItems, fetchRecipes]);

	const onSearch = useCallback(async (text: string): Promise<Food[]> => {

		const res = await searchFood(text);

		if (!res.ok) {
			setError(res.message);
			throw new Error(res.message);
		}

		return (res.data as Food[]) ?? [];

	}, []);

	function openServingPicker(food: Food) {
		setServingPickerFood(food);
		setServingPickerOpen(true);
	}

	function closeServingPicker() {
		setServingPickerOpen(false);
		setServingPickerFood(null);
	}

	function openAddFoodModal() { setAddFoodModalOpen(true); }
	function closeAddFoodModal() { setAddFoodModalOpen(false); }

	return {
		loading,
		saving,
		error,
		recipes,
		fetchRecipes,
		deleteSavedRecipe,
		recipeName,
		setRecipeName,
		pendingItems,
		addItemToPending,
		removeItemFromPending,
		clearPending,
		saveRecipe,
		onSearch,
		servingPickerFood,
		servingPickerOpen,
		openServingPicker,
		closeServingPicker,
		addFoodModalOpen,
		openAddFoodModal,
		closeAddFoodModal,
	};
}
