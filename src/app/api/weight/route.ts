// app/api/weight/route.ts
import { NextResponse } from "next/server";
import { getWeightHistory, deleteWeight } from "@/lib/services/weight";
import { ResponseBuilder as R } from "@/lib/utils/response";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getUser, SESSION_COOKIE } from "@/lib/auth/session";

export async function GET() {

    const userid = await getUser();
    const userId = userid?.id;

    // if no user is clear cookie and return unauthenticated
    if (!userId) {

        const res = NextResponse.json(
            { ok: false, code: "UNAUTHENTICATED", message: "You must be signed in." },
            { status: 401, headers: { "Cache-Control": "no-store" } }
        );
        // Optional: clear stale cookie so clients don’t keep sending it
        res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
        return res;

    }

    const data = await getWeightHistory(userId);
    return R.ok(data, "Weight history loaded");

}

export async function DELETE(req: Request) {

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return R.badRequest("Missing weight id");
    }

    const userid = await getUser();
    const userId = userid?.id;

    // if no user is clear cookie and return unauthenticated
    if (!userId) {

        const res = R.unauthorized();
        // Optional: clear stale cookie so clients don’t keep sending it
        res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
        return res;

    }

    await deleteWeight(userId, Number(id));

    return R.ok({}, "Weight deleted successfully");

}