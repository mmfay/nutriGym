// app/reset-password/page.tsx
"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";

// Props for page
type ResetPasswordProps = {
	searchParams: Promise<{
		token?: string;
	}>;
};

export default function ResetPassword({ searchParams }: ResetPasswordProps) {

	// to bring the in the reset password handler
	const auth = useAuth();

	// parse out the token from params
	const params = use(searchParams);
	const token = params.token ?? "";

	// states needed for form and confirmation
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// local form submission handler
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

		e.preventDefault();
		setError(null);
		setSuccess(null);

		if (!token) {
			setError("This reset link is invalid or missing a token.");
			return;
		}

		if (!password || !confirmPassword) {
			setError("Please fill out both password fields.");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		try {
			setLoading(true);

			await auth.handleResetPassword(password, token);
			
			setPassword("");
			setConfirmPassword("");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Unable to reset password.";
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
			<div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
				<div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<div className="mb-6">
						<h1 className="text-2xl font-semibold tracking-tight">
							Reset password
						</h1>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
							Enter your new password below.
						</p>
					</div>

					{!token && (
						<div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
							This reset link appears to be incomplete or invalid.
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="password"
								className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
							>
								New password
							</label>
							<div className="flex gap-2">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="new-password"
									disabled={loading}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-500 dark:focus:ring-slate-800"
									placeholder="Enter new password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
								>
									{showPassword ? "Hide" : "Show"}
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
							>
								Confirm new password
							</label>
							<div className="flex gap-2">
								<input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									autoComplete="new-password"
									disabled={loading}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-500 dark:focus:ring-slate-800"
									placeholder="Confirm new password"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((v) => !v)}
									className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
								>
									{showConfirmPassword ? "Hide" : "Show"}
								</button>
							</div>
						</div>

						{error && (
							<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
								{error}
							</div>
						)}

						{success && (
							<div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-300">
								{success}
							</div>
						)}

						<button
							type="submit"
							disabled={loading || !token}
							className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
						>
							{loading ? "Resetting..." : "Reset password"}
						</button>
					</form>

					<div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
						<Link
							href="/login"
							className="font-medium text-slate-900 hover:underline dark:text-slate-100"
						>
							Back to sign in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}