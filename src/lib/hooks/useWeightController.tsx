"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { WeightCreate, Weight } from "../dataTypes";
import { addNewWeight, fetchWeightHistory, deleteWeight } from "../api/weight/weight";

export type WeightController = {

	loading: boolean;
	error: string | null;

	history: Weight[];
	loadingHistory: boolean;

	onCreate: (food: WeightCreate) => Promise<Weight>;
	fetchHistory: () => Promise<void>;
	onDelete: (id: number) => Promise<void>;

	openWeightModal: () => void;
	closeWeightModal: () => void;

	weightModalOpen: boolean;
};

export function useWeightController(): WeightController {

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [history, setHistory] = useState<Weight[]>([]);
	const [loadingHistory, setLoadingHistory] = useState(false);

	const [weightModalOpen, setWeightModalOpen] = useState(false);

	// Tracks whether the component using this hook is still mounted
	const aliveRef = useRef(true);

	useEffect(() => {
		aliveRef.current = true;
		return () => {
		aliveRef.current = false;
		};
	}, []);

	// create a weight item
	const onCreate = useCallback(
		
		async (weight: WeightCreate): Promise<Weight> => {

			setError(null);

			const res = await addNewWeight(weight);
			
			if (!res.ok) {
				setError(res.error);
				throw new Error(res.error);
			}

			return res.data as Weight;
	
		}
		, []
	);

	// fetches the full weight history for the measurements page
	const fetchHistory = useCallback(async (): Promise<void> => {

		setLoadingHistory(true);
		setError(null);

		const res = await fetchWeightHistory();

		if (!res.ok) {
			setError(res.message);
			setLoadingHistory(false);
			return;
		}

		setHistory(res.data ?? []);
		setLoadingHistory(false);

	}, []);

	// deletes a weight entry
	const onDelete = useCallback(async (id: number): Promise<void> => {

		setError(null);

		const res = await deleteWeight(id);

		if (!res.ok) {
			setError(res.message);
			return;
		}

		setHistory((prev) => prev.filter((w) => w.id !== id));

	}, []);

	// opens food modal
	function openWeightModal() {
		setWeightModalOpen(true);
	}

	// closes food modal
	function closeWeightModal() {
		setWeightModalOpen(false);
	}

	return {
		loading,
		error,
		history,
		loadingHistory,
		onCreate,
		fetchHistory,
		onDelete,
		openWeightModal,
		closeWeightModal,
		weightModalOpen,
	};
}