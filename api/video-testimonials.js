import "dotenv/config";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const cacheKey = "video_testimonials:v1";

async function test() {
  try {
    console.log("Checking Redis...");

    // 1. Check Redis
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("CACHE HIT ✅");
      console.log(cached);
      return;
    }

    console.log("CACHE MISS ⚠️");

    // 2. Get data from Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/video_testimonials?select=id,name,short_description,video_url,sort_order,active&active=eq.true&order=sort_order.asc,id.asc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      }
    );

    if (!response.ok) {
  const errorText = await response.text();

  console.log("Supabase error:", errorText);

  throw new Error(`Supabase request failed: ${response.status}`);
}
    const data = await response.json();

    // 3. Save to Redis for 7 days
    await redis.set(cacheKey, data, {
      ex: 604800
    });

    console.log("Saved to Redis ✅");
    console.log(data);

  } catch (error) {
    console.error("ERROR ❌");
    console.error(error);
  }
}

test();