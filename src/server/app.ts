import { Hono } from "hono";
import type { Env } from "./context";
import { setLogRecorder } from "./middleware/audit-log";
import { routes } from "./route-defs";
import { createOperationLog } from "./services";
import { setupErrorHandlers } from "./setup/error-handlers";
import { setupMiddlewares } from "./setup/middlewares";

const app = new Hono<Env>();

setLogRecorder(createOperationLog);

setupMiddlewares(app);

app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api", routes);

setupErrorHandlers(app);

export { app };
