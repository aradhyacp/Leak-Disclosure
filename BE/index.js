import config from "./config.js";
import express from "express";
import cors from "cors";

const app = express();


app.use(cors());
app.use(express.json());

const PORT = config.PORT || 1337;

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

app.use((err,req,res,next)=>{
    console.log(err);
    return res.status(400).json({
        message: "internal server error"
    })
})

app.use((req,res,next)=>{
    res.status(404).json({
        message: "route not found"
    })
})

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})