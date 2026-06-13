import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export interface CostRecord {
  id: string;
  timestamp: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  projectId: string;
  intentId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export class Storage {
  private filePath: string;
  private records: CostRecord[] = [];

  constructor(baseDir: string) {
    this.filePath = join(baseDir, "cost_data.json");
    this.load();
  }

  private load() {
    if (existsSync(this.filePath)) {
      try {
        const data = readFileSync(this.filePath, "utf-8");
        this.records = JSON.parse(data);
      } catch (e) {
        console.error("Failed to load storage:", e);
        this.records = [];
      }
    }
  }

  private save() {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.records, null, 2));
    } catch (e) {
      console.error("Failed to save storage:", e);
    }
  }

  public addRecord(record: CostRecord) {
    this.records.push(record);
    this.save();
  }

  public getRecords(): CostRecord[] {
    return [...this.records];
  }

  public filterRecords(filters: {
    projectId?: string;
    intentId?: string;
    userId?: string;
    model?: string;
    startDate?: string;
    endDate?: string;
  }): CostRecord[] {
    return this.records.filter(r => {
      if (filters.projectId && r.projectId !== filters.projectId) return false;
      if (filters.intentId && r.intentId !== filters.intentId) return false;
      if (filters.userId && r.userId !== filters.userId) return false;
      if (filters.model && r.model !== filters.model) return false;
      if (filters.startDate && new Date(r.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(r.timestamp) > new Date(filters.endDate)) return false;
      return true;
    });
  }

  public clear() {
    this.records = [];
    this.save();
  }
}
