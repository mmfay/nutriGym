"use client";

import { useEffect, useState } from "react";
import RecipeBuilder from "./Create/RecipeBuilder";
import { useRecipeController } from "@/lib/hooks/useRecipeController";

type Mode = "create" | "edit";

export default function Recipes() {

	const rc = useRecipeController();
	const [mode, setMode] = useState<Mode>("create");

	useEffect(() => {
		rc.fetchRecipes();
	}, []);

	return (
		<div className="space-y-6">

			{/* Toggle */}
			<div className="flex gap-2">
				<button
					onClick={() => setMode("create")}
					className={[
						"px-3 py-1.5 rounded border text-sm",
						mode === "create"
							? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
							: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300",
					].join(" ")}
				>
					Create
				</button>

				<button
					onClick={() => { setMode("edit"); rc.fetchRecipes(); }}
					className={[
						"px-3 py-1.5 rounded border text-sm",
						mode === "edit"
							? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
							: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300",
					].join(" ")}
				>
					Saved ({rc.recipes.length})
				</button>
			</div>

			{/* Content */}
			<div>
				{mode === "create" ? (
					<RecipeBuilder rc={rc} />
				) : (
					<SavedRecipes rc={rc} />
				)}
			</div>
		</div>
	);
}

function SavedRecipes({ rc }: { rc: ReturnType<typeof useRecipeController> }) {

	if (rc.loading) {
		return <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>;
	}

	if (rc.recipes.length === 0) {
		return <p className="text-sm text-gray-500 dark:text-gray-400 italic">No saved recipes yet. Create one in the Create tab.</p>;
	}

	return (
		<div className="space-y-4">
			{rc.recipes.map((recipe) => {
				const totalCals = recipe.items.reduce((s, i) => s + Number(i.calories), 0);
				const totalProtein = recipe.items.reduce((s, i) => s + Number(i.protein), 0);
				const totalCarbs = recipe.items.reduce((s, i) => s + Number(i.carbs), 0);
				const totalFat = recipe.items.reduce((s, i) => s + Number(i.fat), 0);

				return (
					<div
						key={recipe.id}
						className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
					>
						{/* Header */}
						<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
							<div>
								<p className="font-semibold text-gray-900 dark:text-gray-100">{recipe.name}</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
									{recipe.items.length} item{recipe.items.length !== 1 ? "s" : ""} &nbsp;·&nbsp; {Math.round(totalCals)} kcal
								</p>
							</div>
							<button
								onClick={() => rc.deleteSavedRecipe(recipe.id)}
								className="rounded border border-red-300 dark:border-red-700/60 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
							>
								Delete
							</button>
						</div>

						{/* Macro summary */}
						<div className="grid grid-cols-3 gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/40">
							<MacroChip label="Protein" value={`${Math.round(totalProtein)}g`} />
							<MacroChip label="Carbs"   value={`${Math.round(totalCarbs)}g`} />
							<MacroChip label="Fat"     value={`${Math.round(totalFat)}g`} />
						</div>

						{/* Items list */}
						{recipe.items.length > 0 && (
							<div className="px-4 py-3 space-y-1">
								{recipe.items.map((item) => (
									<div key={item.id} className="flex items-center justify-between text-sm">
										<span className="text-gray-800 dark:text-gray-200 truncate">{item.food_name}</span>
										<span className="text-gray-500 dark:text-gray-400 text-xs shrink-0 ml-2">
											{Number(item.serving_size)}{item.serving_unit} · {Math.round(Number(item.calories))} kcal
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

function MacroChip({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded bg-white dark:bg-gray-800 px-2 py-1 text-center">
			<div className="text-[10px] text-gray-500 dark:text-gray-400">{label}</div>
			<div className="text-xs font-semibold text-gray-900 dark:text-gray-100">{value}</div>
		</div>
	);
}
