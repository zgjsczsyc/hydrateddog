# 达达健康监测站 (Dada Water Tracker)

一个响应式 Web 应用，用于记录宠物狗达达的每日饮水量与排尿量（通过体重差计算）。

## 功能特性

- ✅ **饮水记录**：快速录入单次饮水量，自动求和得到每日总饮水量
- ✅ **尿量记录**：记录每次遛狗的出门前/回来后体重，自动计算尿量差值
- ✅ **多次记录支持**：支持一天多次遛狗记录，自动累加所有差值
- ✅ **净摄入计算**：自动计算当日净水分摄入（总饮水量 - 总尿量）
- ✅ **今日看板**：实时显示今日三大指标（总饮水、总尿量、净摄入）
- ✅ **记录管理**：查看和删除当日的所有记录

## 技术栈

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts (待实现趋势页)
- **Storage**: LocalStorage

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
dada-water-tracker/
├── app/
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── lib/
│   └── storage.ts           # LocalStorage 数据存储工具
├── types/
│   └── index.ts             # TypeScript 类型定义
└── package.json
```

## 数据模型

### WaterIntakeRecord (饮水记录)
- `id`: 唯一标识
- `amount`: 饮水量 (ml)
- `timestamp`: 时间戳
- `date`: 日期字符串 (YYYY-MM-DD)

### WeightRecord (称重记录)
- `id`: 唯一标识
- `weightBefore`: 出门前体重 (kg)
- `weightAfter`: 回来后体重 (kg)
- `urineOutput`: 尿量 (ml) = (weightBefore - weightAfter) × 1000
- `timestamp`: 时间戳
- `date`: 日期字符串 (YYYY-MM-DD)

### DailyStats (每日统计)
- `date`: 日期
- `totalWaterIntake`: 总饮水量 (ml)
- `totalUrineOutput`: 总尿量 (ml)
- `netIntake`: 净摄入量 (ml)
- `waterRecords`: 当天的所有饮水记录
- `weightRecords`: 当天的所有称重记录

## 待实现功能

- [ ] 趋势页：周视图和月视图图表
- [ ] 历史记录页：按日期查看历史数据
- [ ] 数据导出功能

## 设计说明

- **配色方案**：
  - 暖黄色 (#FBBF24)：用于饮水相关功能
  - 天蓝色 (#60A5FA)：用于称重/尿量相关功能
- **响应式设计**：支持桌面端和移动端
- **交互优化**：大尺寸输入框，方便手机操作
