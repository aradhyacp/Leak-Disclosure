import express from "express";
import supabase from "../db/index.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
import { z } from "zod";

const emailSchema = z.email({
  error: "Invalid email format send correct email",
});

router.post("/search", authMiddleware,async (req, res) => {
  var breachedBoolean = true;
  const { email } = req.body;
  console.log(req.clerkId);
  
  const validatedData = emailSchema.safeParse(email);
  if (!validatedData.success) {
    return res.json({
      message: z.prettifyError(validatedData.error),
    });
  }
  const validEmail = validatedData.data;

  const { data: user_id, error: user_id_error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", req.clerkId)
    .single();

    console.log(user_id);
    
    const userId = user_id?.id;


  if (!user_id || user_id_error) {
    return res.json({
      message: "there is something wrong in verifying you",
    });
  }
  const user_subscription = req.subscription;
  if(user_subscription === "pro"){
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
    .insert({
  user_id: userId,
  email: validEmail,
  breached: breachedBoolean,
  breach_count: count,
})
  if (search_insert_error) {
    return res.json({
      message: "Failed to insert to DB",
    });
  }

  const { data: analyticsRow } = await supabase
  .from("analytics_cache")
  .select("*")
  .eq("user_id", userId)
  .single();

if (analyticsRow) {
  await supabase.from("analytics_cache").update({
    total_searches: analyticsRow.total_searches + 1,
    total_breached: analyticsRow.total_breached + count,
  }).eq("user_id", userId);
} else {
  await supabase.from("analytics_cache").insert({
    user_id: userId,
    total_searches: 1,
    total_breached: count,
  });
}

const {data:last_search_table} = await supabase.from("user_search").select("*").eq("id",userId).single()

if(!last_search_table){
    await supabase.from("user_search").insert({
        id: userId,
        search_count_today: 1,
        last_search_date: new Date().toISOString()
    })
}else{
    await supabase.from("user_search").update({
        search_count_today: last_search_table.search_count_today + 1,
        last_search_date: new Date().toISOString()
    }).eq("id",userId)
}

  return res.json({
    email: apiData.email,
    breaches: apiData.breaches || [],
    message: apiData.breaches?.length ? "Breaches found" : "No breaches found",
    count: count,
  });
} else if(user_subscription === "free"){
    //i will try this later
} else{
    return res.json({
        message:"you are neither a free user nor a pro user we are having difficulty in identifying you"
    })
}
});

router.post("/detailed-search", authMiddleware ,async (req, res) => {
    var breachedBoolean = true;
  const { email } = req.body;
  const validatedData = emailSchema.safeParse(email);
  if (!validatedData.success) {
    return res.json({
      message: z.prettifyError(validatedData.error),
    });
  }
  const validEmail = validatedData.data;
  console.log(req.clerkId);

  const { data: user_id, error: user_id_error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", req.clerkId)
    .single();

    const userId = user_id?.id;

  if (!user_id || user_id_error) {
    return res.json({
      message: "there is something wrong in verifying you",
    });
  }

  const detailedBreached = await fetch(
    `https://api.xposedornot.com/v1/breach-analytics?email=${validEmail}`
  );
  const detailedData = await detailedBreached.json();
  console.log(detailedData);
  if (detailedData.BreachMetrics === null) {
     breachedBoolean = false;
    return res.json({
      message: "No detailed breaches found for this email",
    });
  }
  if (detailedData.ExposedBreaches === null) {
     breachedBoolean = false;
    return res.json({
      message: "No detailed breaches found for this email",
    });
  }
  if (detailedData.detail === "Not found") {
     breachedBoolean = false;
    return res.json({ message: "No detailed breaches found for this email" });
  }

  console.log(detailedData.BreachesSummary);
  const breachedCount = detailedData.BreachesSummary.site.split(";").length;
  console.log(breachedCount);
  
  const { data: search_insert, error: search_insert_error } = await supabase
    .from("searches")
    .insert({
  user_id: userId,
  email: validEmail,
  breached: breachedBoolean,
  breach_count: breachedCount,
})
  if (search_insert_error) {
    return res.json({
      message: "Failed to insert to DB",
    });
  }

  const { data: analyticsRow } = await supabase
  .from("analytics_cache")
  .select("*")
  .eq("user_id", userId)
  .single();

if (analyticsRow) {
  await supabase.from("analytics_cache").update({
    total_searches: analyticsRow.total_searches + 1,
    total_breached: analyticsRow.total_breached + breachedCount,
  }).eq("user_id", userId);
} else {
  await supabase.from("analytics_cache").insert({
    user_id: userId,
    total_searches: 1,
    total_breached: breachedCount,
  });
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
