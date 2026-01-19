/**
 * LocalStorage 数据存储工具
 */

import { AppData, WaterIntakeRecord, WeightRecord, DailyStats } from "@/types";

const STORAGE_KEY = "dada-water-tracker-data";

// 获取所有数据
export function getAllData(): AppData {
  if (typeof window === "undefined") {
    return { waterRecords: [], weightRecords: [] };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { waterRecords: [], weightRecords: [] };
  }

  try {
    return JSON.parse(stored) as AppData;
  } catch {
    return { waterRecords: [], weightRecords: [] };
  }
}

// 保存所有数据
export function saveAllData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 添加饮水记录
export function addWaterRecord(amount: number): WaterIntakeRecord {
  const data = getAllData();
  const now = Date.now();
  const date = new Date(now).toISOString().split("T")[0];

  const record: WaterIntakeRecord = {
    id: `water-${now}-${Math.random().toString(36).substring(2, 11)}`,
    amount,
    timestamp: now,
    date,
  };

  data.waterRecords.push(record);
  saveAllData(data);
  return record;
}

// 添加称重记录
export function addWeightRecord(
  weightBefore: number,
  weightAfter: number
): WeightRecord {
  const data = getAllData();
  const now = Date.now();
  const date = new Date(now).toISOString().split("T")[0];

  const urineOutput = (weightBefore - weightAfter) * 1000; // kg 转 ml (1g = 1ml)

  const record: WeightRecord = {
    id: `weight-${now}-${Math.random().toString(36).substring(2, 11)}`,
    weightBefore,
    weightAfter,
    urineOutput,
    timestamp: now,
    date,
  };

  data.weightRecords.push(record);
  saveAllData(data);
  return record;
}

// 删除饮水记录
export function deleteWaterRecord(id: string): void {
  const data = getAllData();
  data.waterRecords = data.waterRecords.filter((r) => r.id !== id);
  saveAllData(data);
}

// 删除称重记录
export function deleteWeightRecord(id: string): void {
  const data = getAllData();
  data.weightRecords = data.weightRecords.filter((r) => r.id !== id);
  saveAllData(data);
}

// 获取指定日期的统计数据
export function getDailyStats(date: string): DailyStats {
  const data = getAllData();

  const waterRecords = data.waterRecords.filter((r) => r.date === date);
  const weightRecords = data.weightRecords.filter((r) => r.date === date);

  const totalWaterIntake = waterRecords.reduce(
    (sum, r) => sum + r.amount,
    0
  );
  const totalUrineOutput = weightRecords.reduce(
    (sum, r) => sum + r.urineOutput,
    0
  );
  const netIntake = totalWaterIntake - totalUrineOutput;

  return {
    date,
    totalWaterIntake,
    totalUrineOutput,
    netIntake,
    waterRecords,
    weightRecords,
  };
}

// 获取今日统计数据
export function getTodayStats(): DailyStats {
  const today = new Date().toISOString().split("T")[0];
  return getDailyStats(today);
}

// 获取所有日期的统计数据（用于趋势图）
export function getAllDailyStats(): DailyStats[] {
  const data = getAllData();
  const dateSet = new Set<string>();

  data.waterRecords.forEach((r) => dateSet.add(r.date));
  data.weightRecords.forEach((r) => dateSet.add(r.date));

  const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a)); // 倒序排列

  return dates.map((date) => getDailyStats(date));
}
