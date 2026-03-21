"use client";

import Link from "next/link";
import { useState } from "react";
import { register } from "@/lib/api/auth";

export default function SignupPage() {

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [agree, setAgree] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	function validate() {
		if (!name.trim()) return "Please enter your name.";
		if (!email.trim()) return "Please enter your email.";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email.";
		if (password.length < 8) return "Password must be at least 8 characters.";
		if (password !== confirm) return "Passwords do not match.";
		if (!agree) return "Please agree to the Terms and Privacy Policy.";
		return null;
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		const v = validate();
		if (v) {
			setError(v);
			return;
		}

		try {
			setLoading(true);

			const res = await register(email, name, password);

			if (!res.ok) {
				setError(res.message || "Signup failed");
				return;
			}

			setSuccess(`We sent a verification email to ${email}. Please verify your account before logging in.`);

			// optional: clear form after success
			setName("");
			setEmail("");
			setPassword("");
			setConfirm("");
			setAgree(false);
		} catch (err: any) {
			setError(err?.message || "Signup failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
			<main className="px-6 pt-16">
				<div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
					<section className="hidden lg:block">
						<div className="space-y-6">
							<h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
								Create your account
							</h1>
							<p className="leading-relaxed text-slate-600 dark:text-slate-300">
								Set goals and log food with speed. NutriGym keeps things clean and
								focused—no clutter, no gimmicks.
							</p>
							<ul className="space-y-3 text-slate-600 dark:text-slate-300">
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
									Track macros & calories
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
									AI Enabled Macro Tracking
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
									Fast food search; barcode scanning
								</li>
							</ul>
						</div>
					</section>

					<section>
						<div className="relative">
							<div
								className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-slate-200 to-slate-100 opacity-60 blur-xl dark:from-slate-800 dark:to-slate-900"
								aria-hidden
							/>
							<div className="relative rounded-3xl border border-slate-200/60 bg-white/70 shadow-xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70">
								<div className="p-8 sm:p-10">
									<div className="mb-6">
										<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
											Sign up
										</h2>
										<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
											Start your free account
										</p>
									</div>

									{success ? (
										<div className="space-y-5">
											<div className="rounded-xl border border-green-300/50 bg-green-50/80 px-4 py-3 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-950/40 dark:text-green-200">
												{success}
											</div>

											<div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
												<p>Check your inbox and spam folder for the verification link.</p>
												<p>
													After verifying your email, you can sign in to your account.
												</p>
											</div>

											<Link
												href="/login"
												className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 font-medium text-white shadow-lg shadow-slate-900/10 hover:opacity-95 active:opacity-90"
											>
												Go to login
											</Link>

										</div>
									) : (
										<form onSubmit={handleSubmit} className="space-y-5">
											<div className="space-y-2">
												<label
													htmlFor="name"
													className="block text-sm font-medium text-slate-700 dark:text-slate-300"
												>
													Name
												</label>
												<input
													id="name"
													type="text"
													autoComplete="name"
													value={name}
													onChange={(e) => setName(e.target.value)}
													placeholder="Your name"
													className="w-full rounded-xl border border-slate-300/80 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:ring-slate-800"
												/>
											</div>

											<div className="space-y-2">
												<label
													htmlFor="email"
													className="block text-sm font-medium text-slate-700 dark:text-slate-300"
												>
													Email
												</label>
												<input
													id="email"
													type="email"
													autoComplete="email"
													inputMode="email"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													placeholder="you@example.com"
													className="w-full rounded-xl border border-slate-300/80 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:ring-slate-800"
												/>
											</div>

											<div className="space-y-2">
												<label
													htmlFor="password"
													className="block text-sm font-medium text-slate-700 dark:text-slate-300"
												>
													Password
												</label>
												<div className="relative">
													<input
														id="password"
														type={showPassword ? "text" : "password"}
														autoComplete="new-password"
														value={password}
														onChange={(e) => setPassword(e.target.value)}
														placeholder="At least 8 characters"
														className="w-full rounded-xl border border-slate-300/80 bg-white/80 px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:ring-slate-800"
													/>
													<button
														type="button"
														onClick={() => setShowPassword((v) => !v)}
														className="absolute inset-y-0 right-0 px-3 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
														aria-label={showPassword ? "Hide password" : "Show password"}
													>
														{showPassword ? "Hide" : "Show"}
													</button>
												</div>
											</div>

											<div className="space-y-2">
												<label
													htmlFor="confirm"
													className="block text-sm font-medium text-slate-700 dark:text-slate-300"
												>
													Confirm password
												</label>
												<div className="relative">
													<input
														id="confirm"
														type={showConfirm ? "text" : "password"}
														autoComplete="new-password"
														value={confirm}
														onChange={(e) => setConfirm(e.target.value)}
														placeholder="Re-type your password"
														className="w-full rounded-xl border border-slate-300/80 bg-white/80 px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:ring-slate-800"
													/>
													<button
														type="button"
														onClick={() => setShowConfirm((v) => !v)}
														className="absolute inset-y-0 right-0 px-3 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
														aria-label={showConfirm ? "Hide password" : "Show password"}
													>
														{showConfirm ? "Hide" : "Show"}
													</button>
												</div>
											</div>

											<label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
												<input
													type="checkbox"
													checked={agree}
													onChange={(e) => setAgree(e.target.checked)}
													className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
												/>
												I agree to the <Link href="/terms" className="underline">Terms</Link> and{" "}
												<Link href="/privacy" className="underline">
													Privacy Policy
												</Link>
												.
											</label>

											{error && (
												<div className="rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/40 dark:text-red-200">
													{error}
												</div>
											)}

											<button
												type="submit"
												disabled={loading}
												className="w-full rounded-xl bg-slate-900 py-3 font-medium text-white shadow-lg shadow-slate-900/10 hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
											>
												{loading ? "Creating account…" : "Create account"}
											</button>

											<p className="text-center text-sm text-slate-600 dark:text-slate-300 sm:hidden">
												Already have an account?{" "}
												<Link href="/login" className="font-medium hover:underline">
													Log in
												</Link>
											</p>
										</form>
									)}
								</div>
							</div>
						</div>

						<div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
							We care about your privacy. Read our{" "}
							<Link href="/privacy" className="underline">
								Privacy Policy
							</Link>
							.
						</div>
					</section>
				</div>
			</main>

			<footer className="px-6 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
				© {new Date().getFullYear()} NutriGym. All rights reserved.
			</footer>
		</div>
	);
}