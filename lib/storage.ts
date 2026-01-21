/**
 * LocalStorage 数据存储工具
 */

import { AppData, WaterIntakeRecord, WeightRecord, DailyStats } from "@/types";

const STORAGE_KEY = "dada-water-tracker-data";

// 获取所有数据
export function getAllData(): AppData {
  if (typeof window === "undefined") {
    return { waterRecords: [], weightRecords: [], notes: {} };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { waterRecords: [], weightRecords: [], notes: {} };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AppData>;
    return {
      waterRecords: parsed.waterRecords ?? [],
      weightRecords: parsed.weightRecords ?? [],
      notes: parsed.notes ?? {},
    };
  } catch {
    return { waterRecords: [], weightRecords: [], notes: {} };
  }
}

// 保存所有数据
export function saveAllData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 添加饮水记录
export function addWaterRecord(amount: number, tag?: "主动喝水" | "骗水" | "补液" | "罐头"): WaterIntakeRecord {
  const data = getAllData();
  const now = Date.now();
  const date = new Date(now).toISOString().split("T")[0];

  const record: WaterIntakeRecord = {
    id: `water-${now}-${Math.random().toString(36).substring(2, 11)}`,
    amount,
    timestamp: now,
    date,
    tag,
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

  const roundTo3 = (value: number) => Math.round(value * 1000) / 1000;
  const beforeRounded = roundTo3(weightBefore);
  const afterRounded = roundTo3(weightAfter);

  const urineOutput = (beforeRounded - afterRounded) * 1000; // kg 转 ml (1g = 1ml)

  const record: WeightRecord = {
    id: `weight-${now}-${Math.random().toString(36).substring(2, 11)}`,
    weightBefore: beforeRounded,
    weightAfter: afterRounded,
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

  let morningWaterIntake = 0;
  let afternoonWaterIntake = 0;
  let eveningWaterIntake = 0;

  waterRecords.forEach((r) => {
    const hour = new Date(r.timestamp).getHours();
    if (hour < 12) {
      morningWaterIntake += r.amount;
    } else if (hour < 18) {
      afternoonWaterIntake += r.amount;
    } else {
      eveningWaterIntake += r.amount;
    }
  });

  return {
    date,
    totalWaterIntake,
    totalUrineOutput,
    netIntake,
    morningWaterIntake,
    afternoonWaterIntake,
    eveningWaterIntake,
    note: data.notes?.[date] ?? "",
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
  Object.keys(data.notes ?? {}).forEach((d) => dateSet.add(d));

  const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a)); // 倒序排列

  return dates.map((date) => getDailyStats(date));
}

// 设置某日备注
export function setDailyNote(date: string, note: string): void {
  const data = getAllData();
  data.notes = data.notes ?? {};
  data.notes[date] = note;
  saveAllData(data);
}
