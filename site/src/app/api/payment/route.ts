import { createHmac } from "crypto";
import "../../../../envConfig";
import database from "@/db";
import { PaymentStatus } from "@/constants/status";

export async function POST(request: Request) {
  try {
    // validate event
    let paystack_secret_key: string = "";
    if (process.env.NODE_ENV === "production") {
      paystack_secret_key = process.env.LIVE_PAYSTACK_SECRET_KEY
    } else {
      paystack_secret_key = process.env.TEST_PAYSTACK_SECRET_KEY
    }

    const event = await request.json();
    const hash = createHmac('sha512', paystack_secret_key).update(JSON.stringify(event)).digest('hex');
    if (hash === request.headers.get('x-paystack-signature')) {
      if (event?.event === "charge.success") {
        if (event?.data?.reference) {
          const reference: string = event?.data?.reference;
          // Mark payment request as paid
          await database.updateStockPurchaseStatus(reference, PaymentStatus.PAID);
        }
      } else {
        console.log("Not handled", event);
      }
    } else {
      // invalid
      console.log("invalid event", request);
    }
  } catch (err) {
    console.log(err);
  } finally {
    return Response.json({ message: "Okay" }, { status: 200 });
  }
}