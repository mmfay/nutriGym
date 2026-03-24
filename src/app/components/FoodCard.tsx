import { Food } from "@/lib/dataTypes";
import { mealColors, MEALS } from "@/lib/ui/mealColors";
import { Meal } from "@/lib/utils/meal";
import VerifiedBadge from "./VerifiedBadge";

type FoodCardProps = {
	food: Food;
	onClick: () => void;
	onQuickAdd: (meal: Meal) => void;
};

export default function FoodCard({
	food,
	onClick,
	onQuickAdd,
}: FoodCardProps) {

	return (
		<button
			onClick={onClick}
			className="relative w-full text-left p-3 rounded-xl shadow transition border hover:-translate-y-0.5 hover:shadow-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
		>
			{/* Top-right badge */}
			{food.is_verified && (
				<div className="absolute top-3 right-3">
					<VerifiedBadge verified={food.is_verified} />
				</div>
			)}
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0 pr-24">
					<div className="font-semibold truncate">{food.name}</div>

					<div className="mt-1 inline-flex flex-wrap items-center gap-2">
						{food.brand && (
							<span className="px-2 py-0.5 text-[11px] rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
								{food.brand}
							</span>
						)}

						<span className="px-2 py-0.5 text-[11px] rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
							{food.calories} kcal
						</span>

						<span className="px-2 py-0.5 text-[11px] rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
							P:{food.protein} C:{food.carbs} F:{food.fat}
						</span>
					</div>
				</div>
			</div>

			<div className="mt-3 flex flex-wrap gap-2">
				{MEALS.map((m) => {
					const c = mealColors[m];
					return (
						<span
							key={m}
							onClick={(e) => {
								e.stopPropagation();
								onQuickAdd(m);
							}}
							className={[
								"px-2 py-1 text-xs rounded border cursor-pointer capitalize transition",
								c.bg,
								c.text,
								c.border,
								c.hover,
							].join(" ")}
						>
							+ {m}
						</span>
					);
				})}
			</div>
		</button>
	);
}