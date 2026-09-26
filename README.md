# TripWeaver 旅游行程规划助手

## 快速启动

```bash
pnpm install
pnpm dev
```

访问地址：http://localhost:18417

TripWeaver 是一款纯前端旅行规划应用，支持创建旅行、探索景点、编排每日行程、预算统计和分享预览。

## 主要功能

- 我的旅行：创建、筛选、删除旅行计划。
- 旅行模板：把走完的行程保存为模板（标题、目的地、同行人、预算、景点顺序与停留时长）；模板列表预览每天景点与合计预算，可清理不再使用的模板；从模板新建时填写起止日期，日程按天数平移，模板与已建行程互不影响；模板天数与所选日期对不上时，创建页会指出缺口并引导先调整模板。
- 行程详情：查看每日行程、预算图表和共享时间线，可一键另存为旅行模板。
- 景点探索：按 SpotCategory 搜索和筛选，收藏并加入行程。
- 行程编排：SortableJS 拖拽排序，实时影响预算计算。
- 分享预览：生成可复制的行程文本。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端 | Vue 3 + TypeScript |
| 构建 | Vite |
| UI | Element Plus + ECharts |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 持久化 | localStorage + Dexie.js |
| 交互 | sortablejs |

## 目录结构

```
src/
├── api/
├── stores/
├── models/
├── types/
├── components/common/
├── hooks/
├── pages/
├── router/
├── utils/
├── config/
└── constants/
```

## 数据持久化

本地数据通过 `utils/storage.ts` 统一写入 localStorage，并保留 Dexie 数据库对象用于后续 IndexedDB 扩展。版本键来自 `constants/storageVersion.ts`。

旅行模板相关代码按三类职责分开整理：

- 模板资料：`src/models/tripTemplate.ts`（`TripTemplate` / `TemplateDay`）、`src/constants/messages.ts`（模板提示文案）、`src/pages/Templates.vue`、`src/pages/TemplateEdit.vue`。
- 日期换算：`src/utils/templateDate.ts`（天数统计、按天平移 `shiftDate`、模板天数与起止日期的缺口检查 `checkDateRange`）。
- 本地保存：`src/api/tripTemplateApi.ts` + `src/constants/storageVersion.ts`（`templates` 键），由 `src/stores/templateStore.ts` 统一读写；Dexie 在 v2 版本中新增 `templates` 表。

模板实例化（`templateStore.instantiate`）会深拷贝模板资料与日程，通过 `tripStore.addTrip` 与 `dayPlanStore.importDays` 生成全新的行程数据，因此模板和已建行程互不影响。

## 环境变量

`VITE_AMAP_KEY`：高德地图 key。未配置时使用 demo-key，地图主题配置同时出现在 `config/map.ts`、`SpotCard`、`DayTimeline`、`Planner` 相关逻辑中。

## 枚举出现位置清单

SpotCategory：
- `src/constants/spot.ts`
- `src/models/spot.ts`
- `src/stores/spotStore.ts`
- `src/components/common/CategoryFilter.vue`
- `src/components/common/SpotCard.vue`
- `src/pages/Spots.vue`
- `src/pages/TripDetail.vue`
- `src/utils/formatters.ts`
- `src/router/guards.ts`

TripStatus：
- `src/constants/trip.ts`
- `src/models/trip.ts`
- `src/stores/tripStore.ts`
- `src/components/common/TripCard.vue`
- `src/pages/Trips.vue`
- `src/utils/formatters.ts`
- `src/router/guards.ts`

## License

MIT

