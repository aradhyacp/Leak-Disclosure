import express from "express"
import Stripe from "stripe"
import config from "../config.js"
const router = express.Router()

const stripe = new Stripe(config.STRIPE_SECRET_KEY)

router.post("/stripe-checkout",async (req,res)=>{
    try {
        const { custEmail, priceId } = req.body;
        console.log(custEmail,priceId);
        
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{price: priceId,quantity: 1 }],
            success_url:"http://localhost:5173/stripe/success",
            cancel_url:"http://localhost:5173/stripe/cancel",
            customer_email: custEmail
        })
        console.log(session);
        
        return res.json({url: session.url})
    } catch (error) {
        console.log(error);
        return res.json({message: "an error from stripe end"})
    }
})

export default router;