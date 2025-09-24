import dotenv from "dotenv"
dotenv.config()

export default {
    PORT: process.env.PORT,
    SUPABASE_URL : process.env.SUPABASE_URL,
    SUPABASE_KEY : process.env.SUPABASE_KEY
}