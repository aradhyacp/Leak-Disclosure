import express from "express";
import supabase from "../db/index.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
import { z } from "zod";

const emailSchema = z.email({
  error: "Invalid email format send correct email",
});

router.post("/search", async (req, res) => {
  var breachedBoolean = true;
  const { email } = req.body;
  console.log(email);
  const validatedData = emailSchema.safeParse(email);
  if (!validatedData.success) {
    return res.json({
      message: z.prettifyError(validatedData.error),
    });
  }
  const validEmail = validatedData.data;
  console.log(validEmail);

  const { data: user_id, error: user_id_error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", req.clerkId)
    .single();
  if (!user_id || user_id_error) {
    return res.json({
      message: "there is something wrong in verifying you",
    });
  }

  const breaches = await fetch(
    `https://api.xposedornot.com/v1/check-email/${validEmail}`
  );
  const apiData = await breaches.json();
  if (apiData.length === 0) {
    breachedBoolean = false;
    return res.json({
      message: "No breaches found for this email",
    });
  }
  if (apiData.Error) {
    breachedBoolean = false;
    return res.json({
      message: "No breaches found for this email",
    });
  }
  const count = apiData.breaches[0].length;

  const { data: search_insert, error: search_insert_error } = await supabase
    .from("searches")
    .insert({ user_id, validEmail, breachedBoolean, count });
  if (search_insert_error) {
    return res.json({
      message: "Failed to insert to DB",
    });
  }
  const { data: analytics_data, error: analytics_data_error } = await supabase
    .from("analytics_cache")
    .upsert(
      {
        user_id,
        total_searches: searches,
        total_breached: breached,
        updated_at: new Date(),
      },
      { onConflict: ["user_id"] }
    )
    .select();

  await supabase
    .from("analytics_cache")
    .update({
      total_searches: supabase.raw("total_searches + ?", [searches]),
      total_breached: supabase.raw("total_breached + ?", [breached]),
      updated_at: new Date(),
    })
    .eq("user_id", user_id);

  return res.json({
    email: apiData.email,
    breaches: apiData.breaches || [],
    message: apiData.breaches?.length ? "Breaches found" : "No breaches found",
    count: count,
  });
});

router.post("/detailed-search", async (req, res) => {
  const { email } = req.body;
  const validatedData = emailSchema.safeParse(email);
  if (!validatedData.success) {
    return res.json({
      message: z.prettifyError(validatedData.error),
    });
  }
  const validEmail = validatedData.data;
  console.log(validEmail);

  const detailedBreached = await fetch(
    `https://api.xposedornot.com/v1/breach-analytics?email=${validEmail}`
  );
  const detailedData = await detailedBreached.json();
  console.log(detailedData);
  if (detailedData.BreachMetrics === null) {
    return res.json({
      message: "No detailed breaches found for this email",
    });
  }
  if (detailedData.ExposedBreaches === null) {
    return res.json({
      message: "No detailed breaches found for this email",
    });
  }
  if (detailedData.detail === "Not found") {
    return res.json({ message: "No detailed breaches found for this email" });
  }
  return res.json({
    message: "Detailed breaches found",
    industries: detailedData.BreachMetrics.industry,
    passwords_strength: detailedData.BreachMetrics.passwords_strength,
    riskScore: detailedData.BreachMetrics.risk,
    yearwiseBreaches: detailedData.BreachMetrics.yearwise_details,
    ExposedBreaches: detailedData.ExposedBreaches.breaches_details,
    BreachesSummary: detailedData.BreachesSummary,
  });
});

export default router;
