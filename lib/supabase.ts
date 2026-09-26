import {createClient} from "@supabase/supabase-js";
const fallbackUrl="https://c--09586474-253e-4035-b48c-481591adc286-prod.lovable.cloud";
const fallbackKey="sb_publishable_4zkSUbnHOH5kawdNM3d6lQ_xd5Do3bb";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||fallbackUrl;
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||fallbackKey;
export const supabase=createClient(url,key);
