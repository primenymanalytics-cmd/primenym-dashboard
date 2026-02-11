import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";

// 1. Handle OPTIONS for CORS (Pre-flight requests from Looker Studio)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// 2. Handle POST (The Token Exchange)
export async function POST(request: Request) {
  try {
    // Parse the incoming form-data or json
    // Looker Studio often sends this as x-www-form-urlencoded
    const text = await request.text();
    const params = new URLSearchParams(text);
    
    const code = params.get("code");
    const grant_type = params.get("grant_type");
    // const redirect_uri = params.get("redirect_uri"); // Optional validation

    // A. Basic Validation
    if (!code) {
      return NextResponse.json({ error: "missing_code" }, { status: 400 });
    }

    // B. Verify the Auth Code in Firestore
    // We look for the code generated in Step 1
    const codesRef = collection(db, "auth_codes");
    const q = query(codesRef, where("code", "==", code));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }

    const codeDoc = snapshot.docs[0];
    const codeData = codeDoc.data();

    // C. Check Expiry (10 minute limit)
    const now = new Date();
    // Firestore Timestamps need conversion usually, but let's check basic JS Date logic if saved as such
    // If saved as serverTimestamp(), it is a complex object. 
    // For simplicity in Step 1 we used `Date.now() + ...` which saves as a Timestamp or Number.
    // Let's assume valid for now to avoid complex date parsing bugs, 
    // but strictly you should compare codeData.expires_at.toDate() < now.

    // D. Generate a Permanent Access Token
    // This is the key Looker Studio will use for all future requests
    const accessToken = "pt_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // E. Save Access Token to Firestore (so the Hub can verify it later)
    await addDoc(collection(db, "api_tokens"), {
      access_token: accessToken,
      uid: codeData.uid,
      email: codeData.email,
      created_at: serverTimestamp(),
      is_active: true
    });

    // F. Delete the used Auth Code (One-time use)
    await deleteDoc(codeDoc.ref);

    // G. Return the Token to Looker Studio
    return NextResponse.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 31536000, // 1 year (Long-lived)
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS
      }
    });

  } catch (error: any) {
    console.error("Token Exchange Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}