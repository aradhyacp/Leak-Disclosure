import config from "./config.js";
import express from "express";
import cors from "cors";
import searchRouter from "./search/search.js"
import authRouter from "./auth/auth.js"
// import "./monitor/monitorCron.js"
import clerkWebook from "./webhook/webhook.js"
import { clerkMiddleware } from "@clerk/express";

const app = express();


app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

const PORT = config.PORT || 1337;

app.use('/api/webhook', clerkWebook)
app.use("/api",searchRouter);
app.use("api/auth",authRouter);

app.get("/",(req,res)=>{
    res.json({
        message: "server is running"
    })
})

app.get("/healthz", (req, res) => {
  res.status(200).json({
    message: "healthy",
  });
});

app.use((req,res,next)=>{
    res.status(404).json({
        message: "route not found"
    })
})

app.use((err,req,res,next)=>{
    console.log(err);
    return res.status(400).json({
        message: "internal server error"
    })
})

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})