"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAllDailyStats, getDailyStats } from "@/lib/storage";
import { DailyStats } from "@/types";
import { Droplet, Scale, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

const COLORS = ["#FBBF24", "#60A5FA", "#10B981", "#EF4444", "#A855F7", "#EC4899"];

export default function HistoryPage() {
  const [allStats, setAllStats] = useState<DailyStats[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const stats = getAllDailyStats();
    setAllStats(stats);
  };

  // 切换日期展开/收起
  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  // 获取最近7天的数据（周视图）
  const getWeekData = () => {
    return allStats.slice(0, 7).reverse(); // 取最近7天，并反转顺序（从旧到新）
  };

  // 获取最近30天的数据（月视图）
  const getMonthData = () => {
    return allStats.slice(0, 30).reverse();
  };

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };

  // 格式化完整日期
  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // 计算饮水标签统计数据
  const getWaterTagStats = () => {
    const tagCounts: { [key: string]: number } = {};
    allStats.forEach((dailyStat) => {
      dailyStat.waterRecords.forEach((record) => {
        const tag = record.tag || "未知"; // 默认值
        tagCounts[tag] = (tagCounts[tag] || 0) + record.amount;
      });
    });
    return Object.entries(tagCounts).map(([tag, amount]) => ({ name: tag, value: amount }));
  };

  // 计算统计数据
  const calculateStats = (data: DailyStats[]) => {
    if (data.length === 0) return null;

    const avgWaterIntake =
      data.reduce((sum, d) => sum + d.totalWaterIntake, 0) / data.length;
    const avgUrineOutput =
      data.reduce((sum, d) => sum + d.totalUrineOutput, 0) / data.length;
    const avgNetIntake =
      data.reduce((sum, d) => sum + d.netIntake, 0) / data.length;
    const totalDays = data.length;

    return {
      avgWaterIntake,
      avgUrineOutput,
      avgNetIntake,
      totalDays,
    };
  };

  const chartData = viewMode === "week" ? getWeekData() : getMonthData();
  const stats = calculateStats(chartData);

  // 准备图表数据
  const chartDataFormatted = chartData.map((stat) => ({
    date: formatDate(stat.date),
    fullDate: stat.date,
    饮水量: stat.totalWaterIntake,
    尿量: stat.totalUrineOutput,
    净摄入: stat.netIntake,
  }));

  const waterTagData = getWaterTagStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部标题栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
          <p className="text-sm text-gray-500 mt-1">查看历史数据和趋势分析</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* 视图切换 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "week"
                ? "bg-primary-yellow text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            周视图
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "month"
                ? "bg-primary-yellow text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            月视图
          </button>
        </div>

        {/* 统计摘要 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-sm text-gray-600 mb-1">统计天数</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalDays} 天
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary-yellow">
              <div className="text-sm text-gray-600 mb-1">平均饮水量</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.avgWaterIntake.toFixed(0)}
                <span className="text-sm text-gray-500 ml-1">ml</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary-blue">
              <div className="text-sm text-gray-600 mb-1">平均尿量</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.avgUrineOutput.toFixed(0)}
                <span className="text-sm text-gray-500 ml-1">ml</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">平均净摄入</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.avgNetIntake >= 0 ? "+" : ""}
                {stats.avgNetIntake.toFixed(0)}
                <span className="text-sm text-gray-500 ml-1">ml</span>
              </div>
            </div>
          </div>
        )}

        {/* 趋势图表 */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {viewMode === "week" ? "最近7天趋势" : "最近30天趋势"}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataFormatted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="饮水量"
                    stroke="#FBBF24"
                    strokeWidth={2}
                    dot={{ fill: "#FBBF24", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="尿量"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    dot={{ fill: "#60A5FA", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="净摄入"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 柱状图对比 */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              饮水量与尿量对比
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataFormatted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="饮水量" fill="#FBBF24" />
                  <Bar dataKey="尿量" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 饮水类型分析图表 */}
        {waterTagData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              饮水类型分析
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={waterTagData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {waterTagData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} ml`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 每日详细记录列表 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            每日详细记录
          </h2>

          {allStats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无历史记录</p>
              <p className="text-sm mt-2">去"本日记录"页面添加第一条记录吧！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allStats.map((stat) => {
                const isExpanded = expandedDates.has(stat.date);
                return (
                  <div
                    key={stat.date}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* 日期标题栏 */}
                    <button
                      onClick={() => toggleDate(stat.date)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">
                            {formatFullDate(stat.date)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {stat.waterRecords.length} 条饮水记录 ·{" "}
                            {stat.weightRecords.length} 条称重记录
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {/* 快速统计 */}
                        <div className="hidden md:flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Droplet className="w-4 h-4 text-primary-yellow" />
                            <span className="text-gray-700">
                              {stat.totalWaterIntake}ml
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Scale className="w-4 h-4 text-primary-blue" />
                            <span className="text-gray-700">
                              {stat.totalUrineOutput}ml
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp
                              className={`w-4 h-4 ${
                                stat.netIntake >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            />
                            <span
                              className={
                                stat.netIntake >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {stat.netIntake >= 0 ? "+" : ""}
                              {stat.netIntake}ml
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* 展开的详细内容 */}
                    {isExpanded && (
                      <div className="px-4 py-4 bg-white border-t border-gray-200">
                        {/* 备注 */}
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">本日备注</div>
                          <div className="px-3 py-2 bg-gray-50 rounded text-gray-800 whitespace-pre-wrap">
                            {stat.note ? stat.note : "暂无备注"}
                          </div>
                        </div>

                        {/* 指标卡片 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-primary-yellow">
                            <div className="text-sm text-gray-600 mb-1">
                              总饮水量
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {stat.totalWaterIntake.toFixed(0)} ml
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-primary-blue">
                            <div className="text-sm text-gray-600 mb-1">
                              总尿量
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {stat.totalUrineOutput.toFixed(0)} ml
                            </div>
                          </div>
                          <div
                            className={`rounded-lg p-3 border-l-4 ${
                              stat.netIntake >= 0
                                ? "bg-green-50 border-green-500"
                                : "bg-red-50 border-red-500"
                            }`}
                          >
                            <div className="text-sm text-gray-600 mb-1">
                              净摄入
                            </div>
                            <div
                              className={`text-xl font-bold ${
                                stat.netIntake >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {stat.netIntake >= 0 ? "+" : ""}
                              {stat.netIntake.toFixed(0)} ml
                            </div>
                          </div>
                        </div>

                        {/* 分时段饮水量 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">
                              上午饮水量
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {stat.morningWaterIntake.toFixed(0)} ml
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">
                              下午饮水量
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {stat.afternoonWaterIntake.toFixed(0)} ml
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">
                              晚上饮水量
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {stat.eveningWaterIntake.toFixed(0)} ml
                            </div>
                          </div>
                        </div>

                        {/* 饮水记录详情 */}
                        {stat.waterRecords.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              饮水记录
                            </h4>
                            <div className="space-y-1">
                              {stat.waterRecords.map((record) => (
                                <div
                                  key={record.id}
                                  className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded text-sm"
                                >
                                  <Droplet className="w-4 h-4 text-primary-yellow" />
                                  <span className="text-gray-900">
                                    {record.amount} ml
                                  </span>
                                  <span className="text-gray-500 ml-auto">
                                    {new Date(
                                      record.timestamp
                                    ).toLocaleTimeString("zh-CN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 称重记录详情 */}
                        {stat.weightRecords.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              称重记录
                            </h4>
                            <div className="space-y-1">
                              {stat.weightRecords.map((record) => (
                                <div
                                  key={record.id}
                                  className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded text-sm"
                                >
                                  <Scale className="w-4 h-4 text-primary-blue" />
                                  <span className="text-gray-900">
                                    {record.weightBefore.toFixed(3)} kg →{" "}
                                    {record.weightAfter.toFixed(3)} kg
                                  </span>
                                  <span className="text-primary-blue ml-auto">
                                    (尿量: {record.urineOutput.toFixed(0)} ml)
                                  </span>
                                  <span className="text-gray-500">
                                    {new Date(
                                      record.timestamp
                                    ).toLocaleTimeString("zh-CN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
