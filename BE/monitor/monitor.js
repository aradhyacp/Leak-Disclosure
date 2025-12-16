import express from "express";
const router = express.Router();
import { z } from "zod";

const emailSchema = z.email({
  error: "Invalid email format send correct email",
});

router.post("/add", async (req, res) => {
  const { email } = req.body;
  const validatedData = emailSchema.safeParse(email);
  if (!validatedData.success) {
    return res.json({
      message: z.prettifyError(validatedData.error),
    });
  }
  const validEmail = validatedData.data;
  try {
    //add email to db
  } catch (error) {}
});

router.get("/list", async (req, res) => {
  try {
    //get all emails from db internal call only
  } catch (error) {}
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    //db call to remove
  } catch (error) {}
});
