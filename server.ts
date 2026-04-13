import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Routes
import movieRoutes from "./src/routes/movies";
import tvRoutes from "./src/routes/tv";
import userRoutes from "./src/routes/user";
import embedRoutes from "./src/routes/embed";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Fix express-rate-limit trust proxy warning
  app.set('trust proxy', 1);

  // Security & Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development to allow Vite & Embeds
  }));
  app.use(cors());
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  app.use("/api/", limiter);

  // API Routes
  app.use("/api/movies", movieRoutes);
  app.use("/api/tv", tvRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/embed", embedRoutes);

  // Search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const { q, page } = req.query;
      const { tmdbService } = await import("./src/services/tmdb.service");
      const data = await tmdbService.searchMulti(q as string, Number(page) || 1);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to search" });
    }
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Debug TMDB
  app.get("/api/debug/tmdb", async (req, res) => {
    try {
      const { tmdbService } = await import("./src/services/tmdb.service");
      const results = await tmdbService.getTrending('movie');
      res.json({
        keyPresent: !!process.env.TMDB_API_KEY,
        keyLength: process.env.TMDB_API_KEY?.length,
        testResultCount: results.length,
        results: results.slice(0, 2)
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
        details: error.response?.data
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
