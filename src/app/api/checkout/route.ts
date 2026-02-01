import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- FIX: Determine Seats based on Price ID ---
    // We grab the Agency Price ID from your environment variables
    const AGENCY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY;
    
    // Default to 1 seat (Solo)
    let seats = "1";
    
    // If the bought ID matches the Agency ID, set seats to 5
    if (priceId === AGENCY_PRICE_ID) {
        seats = "5";
    }

    console.log(`Creating checkout for ${seats} seats (Price: ${priceId})`);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      customer_email: userEmail,
      
      // --- CRITICAL SECTION ---
      // We manually pass the metadata here so the Webhook can read it later.
      metadata: {
        firebase_user_id: userId,
        max_seats: seats,             // <--- Sends "1" or "5"
        connector_type: "WOOCOMMERCE"
      },
      // ------------------------

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}