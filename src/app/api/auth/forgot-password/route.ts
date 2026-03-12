export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { ResponseBuilder as R } from "@/lib/utils/response";
import { Mailer } from "@/lib/services/mailer";

/**
 * Forgot Password API, just accepting the request and silently returning an ok.
 * 
 * @param req the body of the POST, just an email contained inside
 * @returns ok, not much in the sense of error handling for this
 */
export async function POST(req: NextRequest) {

	const body = await req.json();
	const potentialEmail = body.email;

	const mailer = new Mailer();
	await mailer.sendForgotPasswordEmail(potentialEmail);

	return R.ok("If an account exists for that email, we sent a reset link.")
	
}