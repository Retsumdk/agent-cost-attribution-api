import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { CostTracker } from "../src/tracker";
import { Storage } from "../src/storage";
import { calculateCost } from "../src/models";
import { rmSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const TEST_DATA_DIR = "./test_data";

describe("Cost Attribution API", () => {
  let storage: Storage;
  let tracker: CostTracker;

  beforeEach(() => {
    if (!existsSync(TEST_DATA_DIR)) {
      mkdirSync(TEST_DATA_DIR);
    }
    storage = new Storage(TEST_DATA_DIR);
    tracker = new CostTracker(storage);
  });

  afterEach(() => {
    storage.clear();
    if (existsSync(TEST_DATA_DIR)) {
      rmSync(TEST_DATA_DIR, { recursive: true, force: true });
    }
  });

  test("Cost calculation logic", () => {
    const cost = calculateCost("gpt-4o", 1000000, 1000000); // 1M input, 1M output
    expect(cost).toBe(5 + 15); // $5 input, $15 output
  });

  test("Tracking usage and retrieval", () => {
    const record = tracker.trackUsage({
      model: "gpt-4o",
      inputTokens: 1000,
      outputTokens: 500,
      projectId: "p1",
      intentId: "i1",
      userId: "u1"
    });

    expect(record.projectId).toBe("p1");
    expect(record.cost).toBeGreaterThan(0);
    
    const records = storage.getRecords();
    expect(records.length).toBe(1);
    expect(records[0].id).toBe(record.id);
  });

  test("Summary aggregation", () => {
    tracker.trackUsage({ model: "gpt-4o", inputTokens: 1000, outputTokens: 500, projectId: "p1", intentId: "i1", userId: "u1" });
    tracker.trackUsage({ model: "gpt-4o", inputTokens: 2000, outputTokens: 1000, projectId: "p1", intentId: "i2", userId: "u1" });
    tracker.trackUsage({ model: "gpt-3.5-turbo", inputTokens: 10000, outputTokens: 5000, projectId: "p2", intentId: "i3", userId: "u2" });

    const summary = tracker.getFullSummary();
    expect(summary.recordCount).toBe(3);
    expect(summary.byModel["gpt-4o"]).toBeDefined();
    expect(summary.byModel["gpt-3.5-turbo"]).toBeDefined();

    const p1Summary = tracker.getSummaryByProject("p1");
    expect(p1Summary.recordCount).toBe(2);
    
    const u2Summary = tracker.getSummaryByUser("u2");
    expect(u2Summary.recordCount).toBe(1);
  });

  test("Filtering records", () => {
    tracker.trackUsage({ model: "gpt-4o", inputTokens: 1000, outputTokens: 500, projectId: "p1", intentId: "i1", userId: "u1" });
    
    const filtered = storage.filterRecords({ projectId: "non-existent" });
    expect(filtered.length).toBe(0);

    const filtered2 = storage.filterRecords({ projectId: "p1" });
    expect(filtered2.length).toBe(1);
  });
});
