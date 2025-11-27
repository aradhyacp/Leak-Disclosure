import express from "express"
// import supabase from "../db/index.js"
const router = express.Router()
import { z } from "zod"

const emailSchema = z.email({ error: "Invalid email format send correct email" })

router.post("/search", async (req,res)=>{
    const { email } = req.body;
    console.log(email);
    const validatedData = emailSchema.safeParse(email)
    if(!validatedData.success){
        return res.json({
            message: z.prettifyError(validatedData.error)
        })
    }
    const validEmail = validatedData.data
    console.log(validEmail);
    
    const breaches = await fetch(`https://api.xposedornot.com/v1/check-email/${validEmail}`)
    const data = await breaches.json()
    if(data.length === 0){
        return res.json({
            message: "No breaches found for this email"
        })
    }
    if(data.Error){
        return res.json({
            message: "No breaches found for this email"
        })
    }
    return res.json({
  email: data.email,
  breaches: data.breaches || [],
  message: data.breaches?.length ? "Breaches found" : "No breaches found"
});

})

router.post('/detailed-search', async (req, res) => {
    const {email} = req.body;
    const validatedData = emailSchema.safeParse(email)
    if(!validatedData.success){
        return res.json({
            message: z.prettifyError(validatedData.error)
        })
    }
    const validEmail = validatedData.data
    console.log(validEmail);

    const detailedBreached = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${validEmail}`)
    const detailedData = await detailedBreached.json()
    console.log(detailedData);
    if(detailedData.BreachMetrics === null){
        return res.json({
            message: "No detailed breaches found for this email"
        })
    }
    if(detailedData.detail === "Not found"){
        return res.json({message: "No detailed breaches found for this email"})
    }
    return res.json({
        message: "Detailed breaches found",
        industries: detailedData.BreachMetrics.industry,
        passwords_strength: detailedData.BreachMetrics.passwords_strength,
        riskScore: detailedData.BreachMetrics.risk,
        yearwiseBreaches: detailedData.BreachMetrics.yearwise_details,
        ExposedBreaches: detailedData.ExposedBreaches.breaches_details,
        BreachesSummary: detailedData.BreachesSummary
    })

})

export default router