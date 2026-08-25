"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useWeightController } from "@/lib/hooks/useWeightController";
import AddWeightModal from "@/app/components/AddWeight";
import { formatShortDate } from "@/lib/utils/date";
import { WeightCreate } from "@/lib/dataTypes";

export default function MeasurementsPage() {

	const wc = useWeightController();

	const [deletingId, setDeletingId] = useState<number | null>(null);

	useEffect(() => {
		wc.fetchHistory();
	}, []);

	// local handler for adding weight, refreshes the full history afterward
	async function handleWeightCreate(weightCreate: WeightCreate) {

		const created = await wc.onCreate(weightCreate);

		await wc.fetchHistory();

		wc.closeWeightModal();

		return created;

	}

	async function handleDelete(id: number) {

		setDeletingId(id);

		try {
			await wc.onDelete(id);
		} finally {
			setDeletingId(null);
		}

	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
			<main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Measurements</h1>
						<p className="text-sm text-slate-600 dark:text-slate-300">Log and manage your weight entries.</p>
					</div>
					<button
						onClick={wc.openWeightModal}
						className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500
									text-white px-4 py-2 text-sm font-medium
									shadow-lg shadow-indigo-500/30 ring-1 ring-white/10
									hover:from-indigo-400 hover:to-purple-400
									active:scale-95 transition"
					>
						+ Add weight
					</button>
				</div>

				{wc.error && (
					<div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
						{wc.error}
					</div>
				)}

				<div className="rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur overflow-hidden">
					{wc.loadingHistory ? (
						<div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
							Loading…
						</div>
					) : wc.history.length === 0 ? (
						<div className="px-6 py-10 text-center">
							<h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
								No weight entries yet
							</h2>
							<p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
								Start tracking to see your entries here.
							</p>
							<button
								onClick={wc.openWeightModal}
								className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500
											text-white px-3 py-1.5 text-sm font-medium
											shadow-lg shadow-indigo-500/30 ring-1 ring-white/10
											hover:from-indigo-400 hover:to-purple-400
											active:scale-95 transition"
							>
								Log your first weight
							</button>
						</div>
					) : (
						<ul className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
							{wc.history.map((w) => (
								<li
									key={w.id}
									className="flex items-center justify-between px-6 py-4"
								>
									<div>
										<div className="text-sm font-medium text-slate-900 dark:text-white">
											{Number(w.weight)} lb
										</div>
										<div className="text-xs text-slate-500 dark:text-slate-400">
											{formatShortDate(w.measured_at)}
										</div>
									</div>
									<button
										type="button"
										onClick={() => handleDelete(w.id)}
										disabled={deletingId === w.id}
										aria-label="Delete weight entry"
										className="rounded-lg p-2 text-slate-500 hover:text-red-600 hover:bg-red-50
													dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40
													disabled:opacity-50 transition"
									>
										<Trash2 size={16} />
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</main>

			<AddWeightModal
				isOpen={wc.weightModalOpen}
				onClose={wc.closeWeightModal}
				onCreate={handleWeightCreate}
			/>
		</div>
	);
}