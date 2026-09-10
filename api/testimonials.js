import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const cacheKey = "testimonials:v1";

    // 1. Check Redis
    const cached = await redis.get(cacheKey);

    // Cache HIT
    if (cached) {
      return res.status(200).json(cached);
    }

    // Cache MISS
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
      throw new Error(
        `Supabase request failed: ${response.status}`
      );
    }

    const data = await response.json();

    // Save in Redis for 7 days
    await redis.set(
      cacheKey,
      data,
      {
        ex: 604800
      }
    );

    // Return data
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to load testimonials"
    });
  }
}