import express from "express"
import config from "../config.js";
const router = express.Router()
import Stripe from "stripe"
const STRIPE_WEBHOOK_SECRET = config.STRIPE_WEBHOOK_SECRET


router.post("/order", async (req,res)=>{
  console.log("something came from stripe webhook");
  
  if(!STRIPE_WEBHOOK_SECRET){
    return res.status(404).json({
      message:"STRIPE_WEBHOOK_SECRET not found"
    })
  }

  const signature = req.headers["stripe-signature"]
  console.log(signature);
  
  if(!signature){
    return res.status(404).json({
      message:"stripe signature not found"
    })
  }

  let event
  const stripe = new Stripe(config.STRIPE_SECRET_KEY)

  try {
    event = stripe.webhooks.constructEvent(req.body,signature,STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.log(error);
    return res.status(400).json({message:"something is wrong in webhooks"})
  }

  console.log(event);
  return res.json({received:true})
})

export default router