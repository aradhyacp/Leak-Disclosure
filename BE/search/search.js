import express from "express";
import supabase from "../db/index.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
import { z } from "zod";

const emailSchema = z.email({
  error: "Invalid email format send correct email",
});

const breachSearch = async (validEmail, userId) => {
  try {
    let breachedBoolean = true;
    const breaches = await fetch(
      `https://api.xposedornot.com/v1/check-email/${validEmail}`
    );
    
    if (!breaches.ok) {
      console.error(`[breachSearch] API request failed: ${breaches.status} ${breaches.statusText}`);
      return { error: "Failed to fetch breach data from external API" };
    }

    const apiData = await breaches.json();
    if (apiData.length === 0 || apiData.Error) {
      breachedBoolean = false;
      return { breached: breachedBoolean, apiData: null, count: 0 };
    }
    const count = apiData.breaches[0].length || 0;

    try {
      const { data: search_insert, error: search_insert_error } = await supabase
        .from("searches")
        .insert({
          user_id: userId,
          email: validEmail,
          breached: breachedBoolean,
          breach_count: count,
        });

      if (search_insert_error) {
        console.error("[breachSearch] Database error - Failed to insert to searches table:", {
          error: search_insert_error,
          userId,
          email: validEmail,
          breached: breachedBoolean,
          count,
        });
        return { error: "Failed to insert to searches table" };
      }

      if (!search_insert) {
        console.error("[breachSearch] Silent error - No data returned from searches insert:", {
          userId,
          email: validEmail,
        });
      }
    } catch (dbError) {
      console.error("[breachSearch] Exception during searches insert:", {
        error: dbError,
        message: dbError?.message,
        stack: dbError?.stack,
        userId,
        email: validEmail,
      });
      return { error: "Database operation failed" };
    }

    try {
      const { data: analyticsRow, error: analyticsSelectError } = await supabase
        .from("analytics_cache")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (analyticsSelectError && analyticsSelectError.code !== "PGRST116") {
        console.error("[breachSearch] Database error - Failed to select from analytics_cache:", {
          error: analyticsSelectError,
          userId,
        });
      }

      if (analyticsRow) {
        const { error: analyticsUpdateError } = await supabase
          .from("analytics_cache")
          .update({
            total_searches: analyticsRow.total_searches + 1,
            total_breached: analyticsRow.total_breached + count,
          })
          .eq("user_id", userId);

        if (analyticsUpdateError) {
          console.error("[breachSearch] Database error - Failed to update analytics_cache:", {
            error: analyticsUpdateError,
            userId,
            analyticsRow,
          });
        }
      } else {
        const { data: analyticsInsert, error: analyticsInsertError } = await supabase
          .from("analytics_cache")
          .insert({
            user_id: userId,
            total_searches: 1,
            total_breached: count,
          });

        if (analyticsInsertError) {
          console.error("[breachSearch] Database error - Failed to insert to analytics_cache:", {
            error: analyticsInsertError,
            userId,
          });
        }

        if (!analyticsInsert) {
          console.error("[breachSearch] Silent error - No data returned from analytics_cache insert:", {
            userId,
          });
        }
      }
    } catch (analyticsError) {
      console.error("[breachSearch] Exception during analytics_cache operation:", {
        error: analyticsError,
        message: analyticsError?.message,
        stack: analyticsError?.stack,
        userId,
      });
    }

    return { breached: breachedBoolean, apiData, count };
  } catch (err) {
    console.error("[breachSearch] Unexpected error:", {
      error: err,
      message: err?.message,
      stack: err?.stack,
      email: validEmail,
      userId,
    });
    return { error: "Failed to fetch breach data" };
  }
};

router.post("/search", authMiddleware, async (req, res) => {
  const { email } = req.body;
  console.log("[search] Request received for clerkId:", req.clerkId);
  
  try {
    const validatedData = emailSchema.safeParse(email);
    if (!validatedData.success) {
      return res.json({
        message: z.prettifyError(validatedData.error),
      });
    }
    const validEmail = validatedData.data;


    let userId;
    try {
      const { data: user_id, error: user_id_error } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", req.clerkId)
        .single();

      if (user_id_error) {
        console.error("[search] Database error - Failed to fetch user:", {
          error: user_id_error,
          clerkId: req.clerkId,
        });
        return res.json({
          message: "there is something wrong in verifying you",
        });
      }

      if (!user_id) {
        console.error("[search] Silent error - No user data returned:", {
          clerkId: req.clerkId,
        });
        return res.json({
          message: "there is something wrong in verifying you",
        });
      }

      userId = user_id.id;
      console.log("[search] User ID retrieved:", userId);
    } catch (userError) {
      console.error("[search] Exception during user lookup:", {
        error: userError,
        message: userError?.message,
        stack: userError?.stack,
        clerkId: req.clerkId,
      });
      return res.json({
        message: "there is something wrong in verifying you",
      });
    }


    let last_search_table;
    try {
      const { data: searchTableData, error: searchTableError } = await supabase
        .from("user_search")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (searchTableError) {
        console.error("[search] Database error - Failed to fetch user_search:", {
          error: searchTableError,
          userId,
        });
      }

      if (!searchTableData) {
        const { data: insertData, error: insertError } = await supabase
          .from("user_search")
          .insert({
            id: userId,
            search_count_today: 1,
            last_search_date: new Date().toISOString(),
          });

        if (insertError) {
          console.error("[search] Database error - Failed to insert user_search:", {
            error: insertError,
            userId,
          });
          return res.json({
            message: "Failed to initialize search record",
          });
        }

        if (!insertData) {
          console.error("[search] Silent error - No data returned from user_search insert:", {
            userId,
          });
        }

        last_search_table = {
          id: userId,
          search_count_today: 1,
          last_search_date: new Date().toISOString(),
        };
      } else {
        last_search_table = searchTableData;
      }
    } catch (searchTableError) {
      console.error("[search] Exception during user_search operation:", {
        error: searchTableError,
        message: searchTableError?.message,
        stack: searchTableError?.stack,
        userId,
      });
      return res.json({
        message: "Failed to process search record",
      });
    }

    const user_subscription = req.subscription;


    if (user_subscription === "free") {
      try {
        const todayDate = new Date().toISOString().split("T")[0];
        const lastSearch = new Date(last_search_table.last_search_date)
          .toISOString()
          .split("T")[0];
        
        if (todayDate > lastSearch) {
          const { error: resetError } = await supabase
            .from("user_search")
            .update({
              search_count_today: 0,
              last_search_date: new Date().toISOString(),
            })
            .eq("id", userId);

          if (resetError) {
            console.error("[search] Database error - Failed to reset search count:", {
              error: resetError,
              userId,
            });
          } else {
            last_search_table.search_count_today = 0;
          }
        } else if (last_search_table.search_count_today > 10) {
          return res.json({ message: "Limit exceeded for today" });
        }
      } catch (freeLimitError) {
        console.error("[search] Exception during free subscription limit check:", {
          error: freeLimitError,
          message: freeLimitError?.message,
          stack: freeLimitError?.stack,
          userId,
        });
      }
    }


    try {
      const { error: updateError } = await supabase
        .from("user_search")
        .update({
          search_count_today: last_search_table.search_count_today + 1,
          last_search_date: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("[search] Database error - Failed to update search count:", {
          error: updateError,
          userId,
          search_count: last_search_table.search_count_today,
        });
      }
    } catch (updateError) {
      console.error("[search] Exception during search count update:", {
        error: updateError,
        message: updateError?.message,
        stack: updateError?.stack,
        userId,
      });
    }

    const result = await breachSearch(validEmail, userId);
    if (result.error) {
      return res.json({ message: result.error });
    }

    if (!result.apiData) {
      return res.json({ message: "No breaches found", count: 0 });
    }

    return res.json({
      email: result.apiData.email,
      breaches: result.apiData.breaches || [],
      message: result.count > 0 ? "Breaches found" : "No breaches found",
      count: result.count,
    });
  } catch (err) {
    console.error("[search] Unexpected error:", {
      error: err,
      message: err?.message,
      stack: err?.stack,
      email: req.body?.email,
      clerkId: req.clerkId,
    });
    return res.status(500).json({
      message: "Internal server error during search",
    });
  }
});

router.post("/detailed-search", authMiddleware, async (req, res) => {
  let breachedBoolean = true;
  const { email } = req.body;
  
  try {
    const validatedData = emailSchema.safeParse(email);
    if (!validatedData.success) {
      return res.json({
        message: z.prettifyError(validatedData.error),
      });
    }
    const validEmail = validatedData.data;
    console.log("[detailed-search] Request received for clerkId:", req.clerkId);


    let userId;
    try {
      const { data: user_id, error: user_id_error } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", req.clerkId)
        .single();

      if (user_id_error) {
        console.error("[detailed-search] Database error - Failed to fetch user:", {
          error: user_id_error,
          clerkId: req.clerkId,
        });
        return res.json({
          message: "there is something wrong in verifying you",
        });
      }

      if (!user_id) {
        console.error("[detailed-search] Silent error - No user data returned:", {
          clerkId: req.clerkId,
        });
        return res.json({
          message: "there is something wrong in verifying you",
        });
      }

      userId = user_id.id;
    } catch (userError) {
      console.error("[detailed-search] Exception during user lookup:", {
        error: userError,
        message: userError?.message,
        stack: userError?.stack,
        clerkId: req.clerkId,
      });
      return res.json({
        message: "there is something wrong in verifying you",
      });
    }

    let detailedData;
    try {
      const detailedBreached = await fetch(
        `https://api.xposedornot.com/v1/breach-analytics?email=${validEmail}`
      );

      if (!detailedBreached.ok) {
        console.error(`[detailed-search] API request failed: ${detailedBreached.status} ${detailedBreached.statusText}`);
        return res.json({
          message: "Failed to fetch detailed breach data from external API",
        });
      }

      detailedData = await detailedBreached.json();
      console.log("[detailed-search] API response received");
    } catch (apiError) {
      console.error("[detailed-search] Exception during API fetch:", {
        error: apiError,
        message: apiError?.message,
        stack: apiError?.stack,
        email: validEmail,
      });
      return res.json({
        message: "Failed to fetch detailed breach data",
      });
    }


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

    let breachedCount = 0;
    try {
      if (detailedData.BreachesSummary?.site) {
        breachedCount = detailedData.BreachesSummary.site.split(";").length;
        console.log("[detailed-search] Breach count calculated:", breachedCount);
      } else {
        console.error("[detailed-search] Missing BreachesSummary.site in API response");
      }
    } catch (countError) {
      console.error("[detailed-search] Exception during breach count calculation:", {
        error: countError,
        message: countError?.message,
        stack: countError?.stack,
        BreachesSummary: detailedData.BreachesSummary,
      });
    }


    try {
      const { data: search_insert, error: search_insert_error } = await supabase
        .from("searches")
        .insert({
          user_id: userId,
          email: validEmail,
          breached: breachedBoolean,
          breach_count: breachedCount,
        });

      if (search_insert_error) {
        console.error("[detailed-search] Database error - Failed to insert to searches table:", {
          error: search_insert_error,
          userId,
          email: validEmail,
          breached: breachedBoolean,
          breach_count: breachedCount,
        });
        return res.json({
          message: "Failed to insert to DB",
        });
      }

      if (!search_insert) {
        console.error("[detailed-search] Silent error - No data returned from searches insert:", {
          userId,
          email: validEmail,
        });
      }
    } catch (dbError) {
      console.error("[detailed-search] Exception during searches insert:", {
        error: dbError,
        message: dbError?.message,
        stack: dbError?.stack,
        userId,
        email: validEmail,
      });
      return res.json({
        message: "Database operation failed",
      });
    }


    try {
      const { data: analyticsRow, error: analyticsSelectError } = await supabase
        .from("analytics_cache")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (analyticsSelectError && analyticsSelectError.code !== "PGRST116") {
        console.error("[detailed-search] Database error - Failed to select from analytics_cache:", {
          error: analyticsSelectError,
          userId,
        });
      }

      if (analyticsRow) {
        const { error: analyticsUpdateError } = await supabase
          .from("analytics_cache")
          .update({
            total_searches: analyticsRow.total_searches + 1,
            total_breached: analyticsRow.total_breached + breachedCount,
          })
          .eq("user_id", userId);

        if (analyticsUpdateError) {
          console.error("[detailed-search] Database error - Failed to update analytics_cache:", {
            error: analyticsUpdateError,
            userId,
            analyticsRow,
          });
        }
      } else {
        const { data: analyticsInsert, error: analyticsInsertError } = await supabase
          .from("analytics_cache")
          .insert({
            user_id: userId,
            total_searches: 1,
            total_breached: breachedCount,
          });

        if (analyticsInsertError) {
          console.error("[detailed-search] Database error - Failed to insert to analytics_cache:", {
            error: analyticsInsertError,
            userId,
          });
        }

        if (!analyticsInsert) {
          console.error("[detailed-search] Silent error - No data returned from analytics_cache insert:", {
            userId,
          });
        }
      }
    } catch (analyticsError) {
      console.error("[detailed-search] Exception during analytics_cache operation:", {
        error: analyticsError,
        message: analyticsError?.message,
        stack: analyticsError?.stack,
        userId,
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
  } catch (err) {
    console.error("[detailed-search] Unexpected error:", {
      error: err,
      message: err?.message,
      stack: err?.stack,
      email: req.body?.email,
      clerkId: req.clerkId,
    });
    return res.status(500).json({
      message: "Internal server error during detailed search",
    });
  }
});


export default router;
