"use client";

import { useEffect, useState } from "react";
import { useUserSettingsController } from "@/lib/hooks/useUserSettingsController";
import { TIMEZONES } from "@/lib/dataTypes/dropdownData";
import Spinner from "@/app/components/Spinner";

export default function SettingsPage() {

	// controller for user settings
	const uc = useUserSettingsController();

	// account states for saving
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [timezone, setTimezone] = useState("America/Los_Angeles");

	// loading/error handling
	const [accountLoading, setAccountLoading] = useState(false);
	const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
	const [accountError, setAccountError] = useState<string | null>(null);

	// on open, trigger getting the user account info
	useEffect(() => {
		uc.getUserRecord();
	}, []);

	// set the values or default
	useEffect(() => {

		if (!uc.userRecord) return;

		setName(uc.userRecord.name ?? "");
		setEmail(uc.userRecord.email ?? "");
		setTimezone(uc.userRecord.timezone ?? "UTC");

	}, [uc.userRecord]);

	// handling account save
	async function handleAccountSave(e: React.FormEvent) {

		e.preventDefault();

		setAccountLoading(true);
		setAccountSuccess(null);
		setAccountError(null);

		if (!name || !email || !timezone) return;

		try {

			await uc.onAccountUpdate(name, email, timezone);
			setAccountSuccess("Account settings saved.");

		} catch {
			setAccountError("Unable to save account settings.");
		} finally {
			setAccountLoading(false);
		}

	}

	const userFormLoading = uc.userLoading && !uc.userRecord;

	return (
		<div className="mx-auto max-w-3xl px-6 py-10">
			<div className="mb-8">
				<h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
					User Settings
				</h1>
				<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
					Manage your account details and preferences.
				</p>
			</div>

			<div className="space-y-6">
				<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<div className="mb-5">
						<h2 className="text-lg font-medium text-slate-900 dark:text-white">
							Account
						</h2>
						<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
							Update your display name, email address, and timezone.
						</p>
					</div>

					<form onSubmit={handleAccountSave} className="space-y-4">
						{userFormLoading ? (
							<Spinner />
						) : (
							<>
								<div>
									<label
										htmlFor="name"
										className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
									>
										Name
									</label>
									<input
										id="name"
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your name"
										className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
									/>
								</div>

								<div>
									<label
										htmlFor="email"
										className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
									>
										Email
									</label>
									<input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
									/>
								</div>

								<div>
									<label
										htmlFor="timezone"
										className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
									>
										Timezone
									</label>
									<select
										id="timezone"
										value={timezone}
										onChange={(e) => setTimezone(e.target.value)}
										className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-600"
									>
										{TIMEZONES.map((tz) => (
											<option key={tz} value={tz}>
												{tz}
											</option>
										))}
									</select>
								</div>
							</>
						)}

						{accountError && (
							<p className="text-sm text-red-600 dark:text-red-400">
								{accountError}
							</p>
						)}

						{accountSuccess && (
							<p className="text-sm text-emerald-600 dark:text-emerald-400">
								{accountSuccess}
							</p>
						)}

						<div className="flex justify-end">
							<button
								type="submit"
								disabled={accountLoading || userFormLoading}
								className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900"
							>
								{accountLoading ? "Saving..." : "Save Settings"}
							</button>
						</div>
					</form>
				</section>
			</div>
		</div>
	);
}