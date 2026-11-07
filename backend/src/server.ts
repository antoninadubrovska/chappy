import express from "express";
import usersRouter from './routes/users.ts'
import path from "node:path";
import { existsSync } from "node:fs";
import { getPort } from './utils.ts'
import { logger } from './middleware.ts'


const app = express();
const PORT = getPort();
const HOST = "0.0.0.0";

const distPath = path.resolve(
	import.meta.dirname,
	"../../../../frontend/dist"

);
console.log("Frontend path:", distPath);
console.log("index.html exists:", existsSync(path.join(distPath, "index.html")));

// Middleware
app.use(logger);
app.use(express.json());
app.use(express.static(distPath));

// API routes
app.use('/api/users', usersRouter)

// router test
app.get("/api/test", (_req, res) => {
	res.json({ message: "Hello from the Chappy backend" });
});

// React Router fallback
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile("index.html", { root: distPath });
});

// Start server
app.listen(PORT, HOST, () => {
	console.log(`Server running on ${PORT}`);
});
