import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const snap = await adminDb().collection("users").doc(uid).collection("notebook_sets").doc(id).get();
      if (!snap.exists) {
        return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
      }
      return NextResponse.json({ id: snap.id, ...snap.data() });
    }

    const snap = await adminDb()
      .collection("users")
      .doc(uid)
      .collection("notebook_sets")
      .orderBy("createdAt", "desc")
      .get();

    const items = snap.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title || "Untitled Notebook",
      briefingDoc: doc.data().briefingDoc || "",
      sourceName: doc.data().sourceName || "Source Document",
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Notebook API error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await adminDb().collection("users").doc(uid).collection("notebook_sets").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notebook delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
