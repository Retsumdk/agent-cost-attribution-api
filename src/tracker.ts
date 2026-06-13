import { calculateCost } from "./models";
import { Storage, CostRecord } from "./storage";
import { v4 as uuidv4 } from "uuid";

export class CostTracker {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  public trackUsage(data: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    projectId: string;
    intentId: string;
    userId: string;
    metadata?: Record<string, any>;
  }): CostRecord {
    const cost = calculateCost(data.model, data.inputTokens, data.outputTokens);
    const record: CostRecord = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      cost,
      ...data
    };
    this.storage.addRecord(record);
    return record;
  }

  public getSummaryByProject(projectId: string) {
    const records = this.storage.filterRecords({ projectId });
    return this.aggregateRecords(records);
  }

  public getSummaryByIntent(intentId: string) {
    const records = this.storage.filterRecords({ intentId });
    return this.aggregateRecords(records);
  }

  public getSummaryByUser(userId: string) {
    const records = this.storage.filterRecords({ userId });
    return this.aggregateRecords(records);
  }

  public getFullSummary() {
    const records = this.storage.getRecords();
    return this.aggregateRecords(records);
  }

  private aggregateRecords(records: CostRecord[]) {
    const summary = {
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      recordCount: records.length,
      byModel: {} as Record<string, { cost: number; tokens: number }>,
    };

    for (const r of records) {
      summary.totalCost += r.cost;
      summary.totalInputTokens += r.inputTokens;
      summary.totalOutputTokens += r.outputTokens;
      
      if (!summary.byModel[r.model]) {
        summary.byModel[r.model] = { cost: 0, tokens: 0 };
      }
      summary.byModel[r.model].cost += r.cost;
      summary.byModel[r.model].tokens += (r.inputTokens + r.outputTokens);
    }

    return summary;
  }
}
