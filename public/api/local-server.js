import "dotenv/config";
import http from "http";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  try {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    // =========================
    // VIDEO TESTIMONIALS
    // =========================
    if (req.url === "/api/video-testimonials") {
      const cacheKey = "video_testimonials:v1";

      console.log("\nChecking Redis for video testimonials...");

      // Check Redis
      const cached = await redis.get(cacheKey);

      if (cached) {
        console.log("CACHE HIT ✅");
        return res.end(JSON.stringify(cached));
      }

      console.log("CACHE MISS ⚠️");

      // Get from Supabase
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/video_testimonials?select=id,name,short_description,video_url,sort_order,active&active=eq.true&order=sort_order.asc,id.asc`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          `Supabase request failed: ${response.status}`
        );
      }

      const data = await response.json();

      // Save for 7 days
      await redis.set(cacheKey, data, {
        ex: 604800
      });

      console.log("Saved to Redis for 7 days ✅");

      return res.end(JSON.stringify(data));
    }

    // =========================
    // TEXT TESTIMONIALS
    // =========================
    if (req.url === "/api/testimonials") {
      const cacheKey = "testimonials:v1";

      console.log("\nChecking Redis for testimonials...");

      const cached = await redis.get(cacheKey);

      if (cached) {
        console.log("CACHE HIT ✅");
        return res.end(JSON.stringify(cached));
      }

      console.log("CACHE MISS ⚠️");

      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/text%20testimonials?select=id,name,short_description,testimonial&order=id.asc`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          `Supabase request failed: ${response.status}`
        );
      }

      const data = await response.json();

      await redis.set(cacheKey, data, {
        ex: 604800
      });

      console.log("Saved to Redis for 7 days ✅");

      return res.end(JSON.stringify(data));
    }

    // Not found
    res.statusCode = 404;

    return res.end(
      JSON.stringify({
        error: "API route not found"
      })
    );

  } catch (error) {
    console.error("ERROR ❌");
    console.error(error);

    res.statusCode = 500;

    return res.end(
      JSON.stringify({
        error: "Internal server error"
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`\nLocal API running on http://localhost:${PORT}`);
});