import { Hono } from "hono";
import { CostTracker } from "./tracker";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

export function createApi(tracker: CostTracker) {
  const app = new Hono();

  app.use("*", logger());
  app.use("*", prettyJSON());

  app.get("/health", (c) => c.json({ status: "ok" }));

  // Track new usage
  app.post("/track", async (c) => {
    try {
      const body = await c.req.json();
      const { model, inputTokens, outputTokens, projectId, intentId, userId, metadata } = body;

      if (!model || inputTokens === undefined || outputTokens === undefined || !projectId || !intentId || !userId) {
        return c.json({ error: "Missing required fields" }, 400);
      }

      const record = tracker.trackUsage({
        model,
        inputTokens,
        outputTokens,
        projectId,
        intentId,
        userId,
        metadata
      });

      return c.json({ success: true, record });
    } catch (e) {
      return c.json({ error: String(e) }, 500);
    }
  });

  // Get summaries
  app.get("/summary", (c) => {
    const summary = tracker.getFullSummary();
    return c.json(summary);
  });

  app.get("/summary/project/:id", (c) => {
    const id = c.req.param("id");
    const summary = tracker.getSummaryByProject(id);
    return c.json(summary);
  });

  app.get("/summary/intent/:id", (c) => {
    const id = c.req.param("id");
    const summary = tracker.getSummaryByIntent(id);
    return c.json(summary);
  });

  app.get("/summary/user/:id", (c) => {
    const id = c.req.param("id");
    const summary = tracker.getSummaryByUser(id);
    return c.json(summary);
  });

  // Raw records with filtering
  app.get("/records", (c) => {
    const projectId = c.req.query("projectId");
    const intentId = c.req.query("intentId");
    const userId = c.req.query("userId");
    const model = c.req.query("model");
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");

    const records = tracker["storage"].filterRecords({
      projectId,
      intentId,
      userId,
      model,
      startDate,
      endDate
    });

    return c.json(records);
  });

  return app;
}
