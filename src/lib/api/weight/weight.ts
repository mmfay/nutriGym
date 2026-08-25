// lib/api/weight.ts
import { WeightCreate, Weight, WeightPoint } from "@/lib/dataTypes";
import { postJSON, getJSON, deleteJSON } from "../submissions";
import { ApiResult } from "@/lib/dataTypes/results";

// fetches date and weight
export async function fetchWeightTrend(): Promise<WeightPoint[]> {
    const res = await fetch("/api/weight/trend", {
      method: "GET",
      credentials: "include", // keep cookies/session if you’re using them
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch weight trend: ${res.statusText}`);
    }

    return res.json();
}

// posts weight on date, returns new weight
export async function addNewWeight(newWeight: WeightCreate): Promise<ApiResult<Weight>> {
	return postJSON("/api/weight/add", newWeight);
}

// fetches full weight history (with ids) for the measurements page
export async function fetchWeightHistory(): Promise<ApiResult<Weight[]>> {
	return getJSON("/api/weight");
}

// deletes a weight entry by id
export async function deleteWeight(id: number): Promise<ApiResult<null>> {
	return deleteJSON("/api/weight", { id });
}