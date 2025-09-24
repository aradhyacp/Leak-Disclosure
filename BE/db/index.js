import { createClient } from "@supabase/supabase-js";
import config from "../config";

const SUPABASE_URL = config.SUPABASE_URL
const SUPABASE_KEY = config.SUPABASE_KEY

const supabase = createClient(SUPABASE_URL,SUPABASE_KEY)

export default supabase