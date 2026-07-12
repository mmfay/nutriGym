// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { AuthSessions } from "@/lib/tables/auth_sessions";

export async function POST() {
	
	const cookieStore = await cookies();
	const sid = cookieStore.get(SESSION_COOKIE)?.value;

	// If you keep a server-side session, invalidate it
	if (sid) {
		try {
			
			const session = await AuthSessions.find(sid);

			session?.delete();

		} catch (e) {
			// don't leak errors to client—logging is fine
			console.error("logout: failed to delete session", e);
		}
	}

	// Clear the cookie
	const res = NextResponse.json({ ok: true });

	res.cookies.set(SESSION_COOKIE, "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		expires: new Date(0),        // expire immediately
	});

	return res;
	
}
