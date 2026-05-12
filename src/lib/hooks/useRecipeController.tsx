"use client";

import { useCallback, useRef, useState } from "react";
import { searchFood, logFood } from "../api/food/food";
import { getRecipes, createRecipe, deleteRecipe } from "../api/recipes/recipes";
import { Food, RecipeItemCreate, PendingRecipeItem, UserRecipe } from "../dataTypes";
import { Meal } from "../utils/meal";

export type RecipeController = {
	loading: boolean;
	saving: boolean;
	error: string | null;

	recipes: UserRecipe[];
	fetchRecipes: () => Promise<void>;
	deleteSavedRecipe: (id: number) => Promise<void>;

	recipeName: string;
	setRecipeName: (name: string) => void;
	recipeYieldSize: string;
	setRecipeYieldSize: (v: string) => void;
	recipeYieldUnit: string;
	setRecipeYieldUnit: (v: string) => void;
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

	selectedRecipeToLog: UserRecipe | null;
	recipeLogSlot: Meal | null;
	recipeLogModalOpen: boolean;
	openRecipeLogModal: (recipe: UserRecipe, slot?: Meal | null) => void;
	closeRecipeLogModal: () => void;
	onLogRecipe: (food: Food, meal: number, date: string) => Promise<void>;
};

export function useRecipeController(): RecipeController {

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [recipes, setRecipes] = useState<UserRecipe[]>([]);

	const [recipeName, setRecipeName] = useState("");
	const [recipeYieldSize, setRecipeYieldSize] = useState("1");
	const [recipeYieldUnit, setRecipeYieldUnit] = useState("each");
	const [pendingItems, setPendingItems] = useState<PendingRecipeItem[]>([]);

	const [servingPickerFood, setServingPickerFood] = useState<Food | null>(null);
	const [servingPickerOpen, setServingPickerOpen] = useState(false);

	const [recipeLogModalOpen, setRecipeLogModalOpen] = useState(false);
	const [selectedRecipeToLog, setSelectedRecipeToLog] = useState<UserRecipe | null>(null);
	const [recipeLogSlot, setRecipeLogSlot] = useState<Meal | null>(null);

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
		setRecipeYieldSize("1");
		setRecipeYieldUnit("each");
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

		const yieldSize = Number(recipeYieldSize);
		if (!Number.isFinite(yieldSize) || yieldSize <= 0) {
			setError("Yield size must be a positive number");
			return;
		}

		if (!recipeYieldUnit.trim()) {
			setError("Yield unit is required");
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

		const res = await createRecipe({
			name: recipeName.trim(),
			yield_size: yieldSize,
			yield_unit: recipeYieldUnit.trim(),
			items,
		});

		setSaving(false);

		if (!res.ok) {
			setError(res.message);
			return;
		}

		setPendingItems([]);
		setRecipeName("");
		setRecipeYieldSize("1");
		setRecipeYieldUnit("each");
		fetchRecipes();

	}, [recipeName, recipeYieldSize, recipeYieldUnit, pendingItems, fetchRecipes]);

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

	function openRecipeLogModal(recipe: UserRecipe, slot: Meal | null = null) {
		setSelectedRecipeToLog(recipe);
		setRecipeLogSlot(slot);
		setRecipeLogModalOpen(true);
	}

	function closeRecipeLogModal() {
		setRecipeLogModalOpen(false);
		setSelectedRecipeToLog(null);
		setRecipeLogSlot(null);
	}

	const onLogRecipe = useCallback(async (food: Food, meal: number, date: string) => {
		await logFood(food, meal, date);
	}, []);

	return {
		loading,
		saving,
		error,
		recipes,
		fetchRecipes,
		deleteSavedRecipe,
		recipeName,
		setRecipeName,
		recipeYieldSize,
		setRecipeYieldSize,
		recipeYieldUnit,
		setRecipeYieldUnit,
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
		recipeLogModalOpen,
		selectedRecipeToLog,
		recipeLogSlot,
		openRecipeLogModal,
		closeRecipeLogModal,
		onLogRecipe,
	};
}
