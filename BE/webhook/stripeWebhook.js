import express from "express";
import config from "../config.js";
const router = express.Router();
import Stripe from "stripe";
import supabase from "../db/index.js";
import { clerkClient } from "@clerk/express";
const STRIPE_WEBHOOK_SECRET = config.STRIPE_WEBHOOK_SECRET;

router.post("/order", async (req, res) => {
  console.log("something came from stripe webhook");

  if (!STRIPE_WEBHOOK_SECRET) {
    return res.status(404).json({
      message: "STRIPE_WEBHOOK_SECRET not found",
    });
  }

  const signature = req.headers["stripe-signature"];
  console.log(signature);

  if (!signature) {
    return res.status(404).json({
      message: "stripe signature not found",
    });
  }

  let event;
  const stripe = new Stripe(config.STRIPE_SECRET_KEY);

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "something is wrong in webhooks" });
  }

  let userId = null;

  if (event.type === "invoice.payment_succeeded") {
    userId = event.data.object.parent.subscription_details.metadata.userId;
  } else if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.expired"
  ) {
    userId = event.data.object.metadata.userId;
  }

  if (!userId) {
    console.log("No userId found in event:", event.type);
    return res.json({ received: true });
  }

  switch (event.type) {
    case "invoice.payment_succeeded":
      const stripe_invoice_id = event.data.object.id;
      const plan_validity = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      const { data: clerk_id, error: clerk_id_error } = await supabase
        .from("users")
        .select("clerk_id")
        .eq("id", userId)
        .single();
      const { data: subscription, error: subscription_error } = await supabase
        .from("subscriptions")
        .update({
          stripe_invoice_id: stripe_invoice_id,
          payment_status: "completed",
          subscription_status: "active",
          stripe_status_text:
            "payment is successfull done and received to our end",
          stripe_payment_status: true,
          plan_validity: plan_validity,
        })
        .eq("user_id", userId);
      await clerkClient.users.updateUserMetadata(clerk_id?.clerk_id, {
        publicMetadata: { role: "user", subscription: "pro" },
      });
      return res
        .status(200)
        .json({
          message: "Added details to db and updated clerk metadata",
          received: true,
        });
      break;
    case "checkout.session.completed":
      const stripe_order_id = event.data.object.id;
      const {
        data: checkout_subscription_completed,
        error: checkout_subscription_completed_error,
      } = await supabase
        .from("subscriptions")
        .select("stripe_payment_status")
        .eq("user_id", userId)
        .single();
      if (checkout_subscription_completed.stripe_payment_status === false) {
        const { data: subscription, error: subscription_error } = await supabase
          .from("subscriptions")
          .update({
            stripe_status_text:
              "Checkout complete — waiting for payment confirmation",
          })
          .eq("user_id", userId);
        return res
          .status(200)
          .json({
            message: "Updated the status text since payment status was fault",
            received: true,
          });
      } else {
        return res
          .status(200)
          .json({
            message: "no update to db payment status is true",
            received: true,
          });
      }
    case "checkout.session.expired":
      const {
        data: checkout_subscription_expired,
        error: scheckout_subscription_expired_error,
      } = await supabase
        .from("subscriptions")
        .update({
          payment_status: "failed",
          subscription_status: "failed",
          stripe_status_text:
            "Checkout session expired no payment received to our end",
        })
        .eq("user_id", userId);
      return res
        .status(200)
        .json({
          message:
            "updated to db checkout session failed payment status is false",
          received: true,
        });
    default:
      return res.json({ received: true });
      break;
  }
});

export default router;
