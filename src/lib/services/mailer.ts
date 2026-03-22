import nodemailer from "nodemailer";
import crypto from "crypto";
import { createVerificationEmailToken, findUserByEmail } from "./user";
import { createPasswordResetToken } from "./password_reset_tokens";

/**
 * Mailer class, build transporter on instantiation and helps build messaging internally before submitting.
 */
export class Mailer {
	
	private transporter;

	// build the transporter when object is created
	constructor() {

		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT ?? 587),
			secure: false, 
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

	}

	// builds the forgot password email
	private buildForgotPasswordEmail(params: {
		to: string;
		name?: string | null;
		resetUrl: string;
	}): { subject: string; text: string; html: string } {

		const recipientName = params.name?.trim() || "there";
		const subject = `Reset your NutriGym password`;

		const text = [
			`Hi ${recipientName},`,
			"",
			"We received a request to reset your password.",
			"",
			"Use the link below to reset it:",
			params.resetUrl,
			"",
			"If you did not request this, you can ignore this email.",
			"",
			`- NutriGym`,
		].join("\n");

		const html = `
			<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
				<p>Hi ${recipientName},</p>
				<p>We received a request to reset your password.</p>
				<p>
					<a href="${params.resetUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
						Reset password
					</a>
				</p>
				<p>If the button does not work, use this link:</p>
				<p><a href="${params.resetUrl}">${params.resetUrl}</a></p>
				<p>If you did not request this, you can ignore this email.</p>
				<p>- NutriGym</p>
			</div>
		`;

		return { subject, text, html };

	}

	// builds the verification email
	private buildVerificationEmail(params: {
		to: string;
		name?: string | null;
		verifyUrl: string;
	}): { subject: string; text: string; html: string } {

		const recipientName = params.name?.trim() || "there";
		const subject = `Verify your NutriGym Account`;

		const text = [
			`Hi ${recipientName},`,
			"",
			"Welcome to NutriGym.",
			"",
			"Please verify your email address by using the link below:",
			params.verifyUrl,
			"",
			"If you created this account, verifying your email will activate your access.",
			"If you did not create this account, you can safely ignore this email.",
			"",
			"- NutriGym",
		].join("\n");

		const html = `
			<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
				<p>Hi ${recipientName},</p>
				<p>Welcome to <strong>NutriGym</strong>.</p>
				<p>Please verify your email address by clicking the button below:</p>
				<p>
					<a
						href="${params.verifyUrl}"
						style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px;"
					>
						Verify email
					</a>
				</p>
				<p>If the button does not work, use this link:</p>
				<p><a href="${params.verifyUrl}">${params.verifyUrl}</a></p>
				<p>If you created this account, verifying your email will activate your access.</p>
				<p>If you did not create this account, you can safely ignore this email.</p>
				<p>- NutriGym</p>
			</div>
		`;

		return { subject, text, html };

	}

	// sends email when password is forgotten
	async sendForgotPasswordEmail(email: string): Promise<void> {

		const normalizedEmail = email.trim().toLowerCase();

		// find the user
		const user = await findUserByEmail(normalizedEmail);

		// If no user, return silently, we dont want a bad actor to know if they were successful.
		if (!user) {
			return;
		}

		// raw token
		const token = crypto.randomBytes(32).toString("hex");

		// hashed token 
		const tokenHash = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		// create the reset token in the db
		await createPasswordResetToken(user.id, tokenHash)

		// what is sent to the user in email
		const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

		// retrieves the forgot password email message, personalized for user
		const message = this.buildForgotPasswordEmail({
			to: user.email,
			name: user.name,
			resetUrl
		});

		// sends the forgot password email
		await this.transporter.sendMail({
			from: process.env.SMTP_FROM,
			to: user.email,
			subject: message.subject,
			text: message.text,
			html: message.html,
		});

	}

	async sendVerificationEmail(email: string, name: string): Promise<void> {

		const normalizedEmail = email.trim().toLowerCase();

		// find the user
		const user = await findUserByEmail(normalizedEmail);

		// If no user, return silently, we dont want a bad actor to know if they were successful.
		if (!user) {
			return;
		}

		// raw token
		const token = crypto.randomBytes(32).toString("hex");

		// hashed token 
		const tokenHash = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		// create the reset token in the db
		await createVerificationEmailToken(user.id, tokenHash)

		// what is sent to the user in email
		const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${encodeURIComponent(token)}`;

		// retrieves the forgot password email message, personalized for user
		const message = this.buildVerificationEmail({
			to: user.email,
			name: user.name,
			verifyUrl,
		});

		// sends the forgot password email
		await this.transporter.sendMail({
			from: process.env.SMTP_FROM,
			to: user.email,
			subject: message.subject,
			text: message.text,
			html: message.html,
		});

	}

	async sendNewUserAlert(email: string, name: string, createdDate: string) {

		const to = process.env.NEW_USER_ALERT_TO || process.env.SMTP_FROM;

		if (!to) {
			throw new Error("Missing NEW_USER_ALERT_TO or SMTP_FROM environment variable.");
		}

		const createdAt = createdDate ?? new Date();

		const subject = "New Signup";
		
		const text = [
			"A new user signed up for NutriGym.",
			"",
			`Name: ${name}`,
			`Email: ${email}`,
			`Created At: ${createdAt}`,
		].join("\n");

		const html = `
			<div style="font-family: Arial, sans-serif; line-height: 1.5;">
				<h2>New Signup</h2>
				<p>A new user signed up for NutriGym.</p>
				<ul>
					<li><strong>Name:</strong> ${name}</li>
					<li><strong>Email:</strong> ${email}</li>
					<li><strong>Created At:</strong> ${createdAt}</li>
				</ul>
			</div>
		`;

		await this.transporter.sendMail({
			from: process.env.SMTP_FROM,
			to,
			subject,
			text,
			html,
		});

	}

}