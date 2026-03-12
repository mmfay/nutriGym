"use client";

import { useState } from "react";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";

export default function ForgotPasswordPage() {

	// to get the handler for forgot password
	const auth = useAuth();

	// states needed for data submission
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	// local handler of form
	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitted(true);

		// not much to return in the way of errors, not something we want to give the user indication on success or not.
		try {

			auth.handleForgotPassword(email);
			
		} catch {

		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
			<main className="px-6 pt-16">
				<div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
					{/* Left: Value prop */}
					<section className="hidden lg:block">
						<div className="space-y-6">
							<h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
								Reset your password
							</h1>
							<p className="text-slate-600 dark:text-slate-300 leading-relaxed">
								Enter the email associated with your account and we’ll help you get back in.
								Simple, secure, and designed to keep account recovery straightforward.
							</p>
							<ul className="text-slate-600 dark:text-slate-300 space-y-3">
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
									Secure account recovery flow
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
									One-time reset links
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
									Back to tracking in minutes
								</li>
							</ul>
						</div>
					</section>

					{/* Right: Reset card */}
					<section>
						<div className="relative">
							<div
								className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 blur-xl opacity-60"
								aria-hidden
							/>
							<div className="relative rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
								<div className="p-8 sm:p-10">
									<div className="mb-6">
										<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
											Forgot password
										</h2>
										<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
											Enter your email to receive a reset link
										</p>
									</div>

									{submitted ? (
										<div className="space-y-5">
											<div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
												If an account exists for that email, a password reset link has been sent.
											</div>

											<Link
												href="/login"
												className="inline-flex text-sm font-medium text-slate-700 underline-offset-4 hover:underline dark:text-slate-300"
											>
												Back to login
											</Link>
										</div>
									) : (
										<form onSubmit={handleSubmit} className="space-y-5">
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
													className="w-full rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800"
													required
												/>
											</div>

											<button
												type="submit"
												className="w-full rounded-xl bg-slate-900 text-white py-3 font-medium shadow-lg shadow-slate-900/10 hover:opacity-95 active:opacity-90"
											>
												Send reset link
											</button>

											<div className="text-center">
												<Link
													href="/login"
													className="text-sm text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
												>
													Back to login
												</Link>
											</div>
										</form>
									)}
								</div>
							</div>
						</div>

						<div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
							By continuing you agree to our{" "}
							<Link href="/terms" className="underline">
								Terms
							</Link>{" "}
							and{" "}
							<Link href="/privacy" className="underline">
								Privacy Policy
							</Link>
							.
						</div>
					</section>
				</div>
			</main>
			<Footer/>
		</div>
	);
}