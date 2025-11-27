import cron from "node-cron";
import supabase from "../db/index.js";
import { sendEmail } from "./email.js";

export async function cronMonitorEmails() {
  try {
    const { data: emailList, error } = await supabase
      .from("monitored_emails")
      .select("*");
    if (error) throw error;

    for (const email of emailList) {
      try {
        const res = await fetch(
          `https://api.xposedornot.com/v1/check-email/${emailEntry.email}`
        );
        const data = await res.json();
        const newBreachCount = data?.breaches?.length || 0;

        if (newBreachCount > emailEntry.last_breach_count) {
          const { data: user } = await supabase
            .from("users")
            .select("email")
            .eq("id", emailEntry.user_id)
            .single();

          await sendEmail(
            user.email,
            `New breach detected for ${emailEntry.email}`,
            `<p>Your monitored email <strong>${
              emailEntry.email
            }</strong> has <strong>${
              newBreachCount - emailEntry.last_breach_count
            } new breaches</strong>.</p>`
          );
          await supabase
            .from("monitored_emails")
            .update({
              last_breach_count: newBreachCount,
              last_checked_at: new Date(),
            })
            .eq("id", emailEntry.id);
        } else {
          await supabase
            .from("monitored_emails")
            .update({ last_checked_at: new Date() })
            .eq("id", emailEntry.id);
        }
      } catch (error) {
        console.error("Error checking email:", emailEntry.email, error);
      }
    }
  } catch (error) {
    console.error("Error fetching monitored emails:", error);
  }
}

cron.schedule("*/30 * * * * *", () => {
    console.log("Running monitored email check");
    cronMonitorEmails()
});
