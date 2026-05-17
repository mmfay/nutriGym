"use client";

import Recipes from "@/app/components/KitchenTabs/Recipes";

export default function Kitchen() {
	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<div className="mx-auto max-w-7xl px-6 py-8">
				<Recipes />
			</div>
		</div>
	);
}
