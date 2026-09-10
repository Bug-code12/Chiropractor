import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const cacheKey = "video_testimonials:v1";

    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.status(200).json(cached);
    }

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
      throw new Error(
        `Supabase request failed: ${response.status}`
      );
    }

    const data = await response.json();

    await redis.set(
      cacheKey,
      data,
      {
        ex: 604800
      }
    );

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to load video testimonials"
    });
  }
}
