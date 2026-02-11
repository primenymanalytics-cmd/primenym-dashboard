import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // Ensure this exports your Firestore instance
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { shopUrl, accessToken, userId, userEmail } = await request.json();

    // 1. Basic Validation
    if (!shopUrl || !accessToken || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Clean URL logic (Same as Hub)
    const cleanShopUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // 3. VERIFY CREDENTIALS with Shopify
    // We try to fetch the shop info. If this fails, the token is wrong.
    try {
      await axios.get(`https://${cleanShopUrl}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
    } catch (shopifyError) {
      return NextResponse.json({ error: "Invalid Shopify Access Token or URL." }, { status: 401 });
    }

    // 4. Save to Firestore "integrations" collection
    // This is the collection the Hub will read from later.
    const docRef = await addDoc(collection(db, "integrations"), {
      uid: userId,
      email: userEmail,
      type: "SHOPIFY",
      name: cleanShopUrl, // We use the URL as the name for now
      shop_url: cleanShopUrl,
      access_token: accessToken,
      created_at: serverTimestamp(),
      active: true
    });

    return NextResponse.json({ success: true, id: docRef.id });

  } catch (error: any) {
    console.error("Add Integration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}