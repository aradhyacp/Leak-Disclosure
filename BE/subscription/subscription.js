import express from "express"
import Stripe from "stripe"
import config from "../config.js"
import authMiddleware from "../middleware/authMiddleware.js"
import supabase from "../db/index.js"
const router = express.Router()

const stripe = new Stripe(config.STRIPE_SECRET_KEY)

router.post("/stripe-checkout",authMiddleware,async (req,res)=>{
    try {
        const { custEmail, priceId } = req.body;
        const clerkId = req.clerkId
        const {data:user,error:userFetch} = await supabase.from("users").select("id").eq("clerk_id",clerkId).single()
        const userId = user?.id
        if(!userId){
            return res.status(401).json({
                message:"Your not found in the db contact admin"
            })
        }

        
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{price: priceId,quantity: 1 }],
            success_url:"http://localhost:5173/stripe/success",
            cancel_url:"http://localhost:5173/stripe/cancel",
            customer_email: custEmail,
            metadata:{
                userId: userId,
                plan: "pro"
            },
            subscription_data: {
    metadata: {
      userId: userId,
      plan: "pro"
    }
  },
        })
        console.log(session);

        const {data:subscriptionInsert, error: subscriptionInsertError} = await supabase.from("subscriptions").insert({user_id:userId,stripe_order_id:session.id,stripe_status_text:"Checkout Session Created",stripe_payment_status:false})
        
        return res.json({url: session.url,session})
    } catch (error) {
        console.log(error);
        return res.json({message: "an error from stripe end"})
    }
})

export default router;