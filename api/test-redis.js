import "dotenv/config";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const cacheKey = "testimonials:v1";

async function test() {
  try {
    console.log("Checking Redis...");

    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("CACHE HIT ✅");
      console.log(cached);
      return;
    }

    console.log("CACHE MISS ⚠️");

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/text%20testimonials?select=id,name,short_description,testimonial&order=id.asc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.status}`);
    }

    const data = await response.json();

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