/**
 * 核心数据模型定义
 */

// 单次饮水记录
export interface WaterIntakeRecord {
  id: string; // 唯一标识
  amount: number; // 饮水量 (ml)
  timestamp: number; // 时间戳
  date: string; // 日期字符串 YYYY-MM-DD
  tag?: "主动喝水" | "骗水" | "补液" | "罐头"; // 饮水类型标签
}

// 单次称重记录（用于计算尿量）
export interface WeightRecord {
  id: string; // 唯一标识
  weightBefore: number; // 出门前体重 (kg)
  weightAfter: number; // 回来后体重 (kg)
  urineOutput: number; // 尿量 (ml) = (weightBefore - weightAfter) * 1000
  timestamp: number; // 时间戳
  date: string; // 日期字符串 YYYY-MM-DD
}

// 每日统计数据
export interface DailyStats {
  date: string; // 日期字符串 YYYY-MM-DD
  totalWaterIntake: number; // 总饮水量 (ml)
  totalUrineOutput: number; // 总尿量 (ml)
  netIntake: number; // 净摄入量 (ml) = totalWaterIntake - totalUrineOutput
  morningWaterIntake: number; // 上午饮水量 (0-12)
  afternoonWaterIntake: number; // 下午饮水量 (12-18)
  eveningWaterIntake: number; // 晚上饮水量 (18-24)
  note: string; // 当日备注
  waterRecords: WaterIntakeRecord[]; // 当天的所有饮水记录
  weightRecords: WeightRecord[]; // 当天的所有称重记录
}

// 存储的数据结构
export interface AppData {
  waterRecords: WaterIntakeRecord[];
  weightRecords: WeightRecord[];
  notes: Record<string, string>;
}
