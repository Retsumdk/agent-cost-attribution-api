#!/usr/bin/env bun
import { Command } from "commander";
import { serve } from "bun";
import { createApi } from "./api";
import { CostTracker } from "./tracker";
import { Storage } from "./storage";
import { join } from "path";

const program = new Command();

program
  .name("agent-cost-attribution-api")
  .description("Granular cost tracking attributing LLM spend to specific user intents or projects")
  .version("1.0.0");

program
  .command("serve")
  .description("Start the cost attribution API server")
  .option("-p, --port <number>", "Port to listen on", "3000")
  .option("-d, --data <dir>", "Directory to store data", "./data")
  .action((options) => {
    const port = parseInt(options.port);
    const dataDir = options.data;
    
    // Ensure data directory exists
    const fs = require("fs");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const storage = new Storage(dataDir);
    const tracker = new CostTracker(storage);
    const app = createApi(tracker);

    console.log(`🚀 Server starting on port ${port}...`);
    serve({
      fetch: app.fetch,
      port: port,
    });
  });

program
  .command("clear")
  .description("Clear all tracked records")
  .option("-d, --data <dir>", "Directory where data is stored", "./data")
  .action((options) => {
    const storage = new Storage(options.data);
    storage.clear();
    console.log("✅ All records cleared.");
  });

program
  .command("report")
  .description("Generate a quick report in the console")
  .option("-d, --data <dir>", "Directory where data is stored", "./data")
  .action((options) => {
    const storage = new Storage(options.data);
    const tracker = new CostTracker(storage);
    const summary = tracker.getFullSummary();

    console.log("\n📊 AGENT COST ATTRIBUTION REPORT");
    console.log("================================");
    console.log(`Total Records: ${summary.recordCount}`);
    console.log(`Total Cost:    $${summary.totalCost.toFixed(6)}`);
    console.log(`Total Tokens:  ${(summary.totalInputTokens + summary.totalOutputTokens).toLocaleString()}`);
    console.log("\nBreakdown by Model:");
    for (const [model, data] of Object.entries(summary.byModel)) {
      console.log(`- ${model.padEnd(20)}: $${data.cost.toFixed(6)} (${data.tokens.toLocaleString()} tokens)`);
    }
    console.log("================================\n");
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
