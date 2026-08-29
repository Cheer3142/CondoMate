// Explicit Vercel Function entry point. Vercel reliably discovers api/index.js
// for non-Next/Vite projects; the catch-all routes are handled by Express.
import app from "./[...path].js";

export default app;
