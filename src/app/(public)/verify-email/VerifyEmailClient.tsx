"use client";

import { useEffect, useState } from "react";
import { verifyEmail as validateEmail } from "@/lib/api/auth";

export function VerifyEmailClient({ token }: { token: string }) {

	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [message, setMessage] = useState("Verifying your email...");

	useEffect(() => {

		async function verifyEmail() {

			if (!token) {
				setStatus("error");
				setMessage("This verification link is invalid.");
				return;
			}

			try {
				const res = await validateEmail(token);

				if (!res.ok) {
					setStatus("error");
					setMessage(res.message || "This verification link is invalid or expired.");
					return;
				}

				setStatus("success");
				setMessage(res.message || "Your email has been verified successfully. You can now log in.");

			} catch {

				setStatus("error");
				setMessage("Something went wrong while verifying your email.");

			}
		}

		verifyEmail();

	}, [token]);

	return (
		<div className="flex min-h-screen items-center justify-center px-6">
			<div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
				<h1 className="mb-3 text-2xl font-semibold">Verify Email</h1>
				<p
					className={`text-sm ${
						status === "success"
							? "text-green-600 dark:text-green-400"
							: status === "error"
								? "text-red-600 dark:text-red-400"
								: "text-slate-600 dark:text-slate-300"
					}`}
				>
					{message}
				</p>
			</div>
		</div>
	);
}
