"use client";

import { useState, useEffect } from "react";
import { Plus, Droplet, Scale, TrendingUp, Trash2 } from "lucide-react";
import {
  getTodayStats,
  addWaterRecord,
  addWeightRecord,
  deleteWaterRecord,
  deleteWeightRecord,
  setDailyNote,
} from "@/lib/storage";
import { DailyStats } from "@/types";

export default function TodayPage() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [waterAmount, setWaterAmount] = useState("");
  const [waterTag, setWaterTag] = useState<"主动喝水" | "骗水" | "补液" | "罐头">("主动喝水");
  const [weightBefore, setWeightBefore] = useState("");
  const [weightAfter, setWeightAfter] = useState("");
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showWaterForm, setShowWaterForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);

  // 加载今日数据
  const loadTodayStats = () => {
    const todayStats = getTodayStats();
    setStats(todayStats);
    setNote(todayStats.note ?? "");
  };

  useEffect(() => {
    loadTodayStats();
  }, []);

  // 提交饮水记录
  const handleWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(waterAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("请输入有效的饮水量");
      return;
    }
    addWaterRecord(amount, waterTag);
    setWaterAmount("");
    setWaterTag("主动喝水");
    setShowWaterForm(false);
    loadTodayStats();
  };

  // 提交称重记录
  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const before = Math.round(parseFloat(weightBefore) * 1000) / 1000;
    const after = Math.round(parseFloat(weightAfter) * 1000) / 1000;
    if (isNaN(before) || isNaN(after) || before <= 0 || after <= 0) {
      alert("请输入有效的体重值");
      return;
    }
    if (before <= after) {
      alert("出门前体重应大于回来后体重");
      return;
    }
    addWeightRecord(before, after);
    setWeightBefore("");
    setWeightAfter("");
    setShowWeightForm(false);
    loadTodayStats();
  };

  // 保存今日备注
  const handleSaveNote = () => {
    if (!stats) return;
    setIsSavingNote(true);
    setDailyNote(stats.date, note.trim());
    setIsSavingNote(false);
    loadTodayStats();
  };

  // 删除饮水记录
  const handleDeleteWater = (id: string) => {
    if (confirm("确定要删除这条记录吗？")) {
      deleteWaterRecord(id);
      loadTodayStats();
    }
  };

  // 删除称重记录
  const handleDeleteWeight = (id: string) => {
    if (confirm("确定要删除这条记录吗？")) {
      deleteWeightRecord(id);
      loadTodayStats();
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部标题栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">本日记录</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* 今日指标看板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* 总饮水量 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-yellow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Droplet className="w-5 h-5" />
                <span className="text-sm font-medium">总饮水量</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalWaterIntake.toFixed(0)}
              <span className="text-lg text-gray-500 ml-1">ml</span>
            </div>
          </div>

          {/* 总尿量 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-blue">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Scale className="w-5 h-5" />
                <span className="text-sm font-medium">总尿量</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalUrineOutput.toFixed(0)}
              <span className="text-lg text-gray-500 ml-1">ml</span>
            </div>
          </div>

          {/* 净摄入 */}
          <div
            className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
              stats.netIntake >= 0
                ? "border-green-500"
                : "border-red-500"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">净摄入</span>
              </div>
            </div>
            <div
              className={`text-3xl font-bold ${
                stats.netIntake >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.netIntake >= 0 ? "+" : ""}
              {stats.netIntake.toFixed(0)}
              <span className="text-lg text-gray-500 ml-1">ml</span>
            </div>
          </div>
        </div>

        {/* 分时段饮水量 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">上午饮水量</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.morningWaterIntake.toFixed(0)}
              <span className="text-sm text-gray-500 ml-1">ml</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">下午饮水量</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.afternoonWaterIntake.toFixed(0)}
              <span className="text-sm text-gray-500 ml-1">ml</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">晚上饮水量</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.eveningWaterIntake.toFixed(0)}
              <span className="text-sm text-gray-500 ml-1">ml</span>
            </div>
          </div>
        </div>

        {/* 快速录入区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* 饮水记录表单 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-primary-yellow" />
              记录饮水
            </h2>
            {!showWaterForm ? (
              <button
                onClick={() => setShowWaterForm(true)}
                className="w-full py-4 bg-primary-yellow hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                添加饮水记录
              </button>
            ) : (
              <form onSubmit={handleWaterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    饮水量 (ml)
                  </label>
                  <input
                    type="number"
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(e.target.value)}
                    placeholder="请输入饮水量"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                    autoFocus
                    step="1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    饮水方式
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[ "主动喝水", "骗水", "补液", "罐头" ].map((tagOption) => (
                      <button
                        key={tagOption}
                        type="button"
                        onClick={() => setWaterTag(tagOption as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${waterTag === tagOption ? "bg-primary-yellow text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                      >
                        {tagOption}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-yellow hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
                  >
                    确认
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWaterForm(false);
                      setWaterAmount("");
                    }}
                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 称重记录表单 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary-blue" />
              记录称重
            </h2>
            {!showWeightForm ? (
              <button
                onClick={() => setShowWeightForm(true)}
                className="w-full py-4 bg-primary-blue hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                添加称重记录
              </button>
            ) : (
              <form onSubmit={handleWeightSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出门前体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={weightBefore}
                    onChange={(e) => setWeightBefore(e.target.value)}
                    placeholder="请输入出门前体重"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    autoFocus
                  step="0.001"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    回来后体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={weightAfter}
                    onChange={(e) => setWeightAfter(e.target.value)}
                    placeholder="请输入回来后体重"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  step="0.001"
                    min="0"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-blue hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                  >
                    确认
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWeightForm(false);
                      setWeightBefore("");
                      setWeightAfter("");
                    }}
                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* 今日备注 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">本日备注</h2>
          <div className="space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录一下今天达达的情况，如精神状态、排便情况等"
              className="w-full min-h-[120px] px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  isSavingNote
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary-yellow hover:bg-yellow-500"
                }`}
              >
                {isSavingNote ? "保存中..." : "保存备注"}
              </button>
            </div>
          </div>
        </div>

        {/* 今日记录列表 */}
        {(stats.waterRecords.length > 0 || stats.weightRecords.length > 0) && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              今日记录
            </h2>

            {/* 饮水记录列表 */}
            {stats.waterRecords.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  饮水记录
                </h3>
                <div className="space-y-2">
                  {stats.waterRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Droplet className="w-4 h-4 text-primary-yellow" />
                        <span className="text-gray-900">
                          {record.amount} ml
                          {record.tag && (
                            <span className="ml-2 px-2 py-1 bg-primary-yellow/20 text-primary-yellow text-xs rounded-full">
                              {record.tag}
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(record.timestamp).toLocaleTimeString(
                            "zh-CN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteWater(record.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 称重记录列表 */}
            {stats.weightRecords.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  称重记录
                </h3>
                <div className="space-y-2">
                  {stats.weightRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Scale className="w-4 h-4 text-primary-blue" />
                        <div className="text-gray-900">
                          <span>
                            {record.weightBefore.toFixed(3)} kg →{" "}
                            {record.weightAfter.toFixed(3)} kg
                          </span>
                          <span className="text-primary-blue ml-2">
                            (尿量: {record.urineOutput.toFixed(0)} ml)
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(record.timestamp).toLocaleTimeString(
                            "zh-CN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteWeight(record.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
