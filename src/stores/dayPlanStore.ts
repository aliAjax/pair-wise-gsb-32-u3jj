import { defineStore } from 'pinia';
import type { DayPlan, DayPlanItem } from '../models/dayPlan';
import { dayPlanApi } from '../api/dayPlanApi';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

export interface ImportedDay {
  day_index: number;
  date: string;
  items: DayPlanItem[];
}

export const useDayPlanStore = defineStore('dayPlan', {
  state: () => ({ dayPlans: dayPlanApi.list() as DayPlan[] }),
  actions: {
    ensureDay(tripId: string, dayIndex = 1, date = new Date().toISOString().slice(0, 10)) {
      let day = this.dayPlans.find((item) => item.trip_id === tripId && item.day_index === dayIndex);
      if (!day) {
        day = { id: crypto.randomUUID(), trip_id: tripId, day_index: dayIndex, date, items: [] };
        this.dayPlans.push(day);
      }
      return day;
    },
    // 模板实例化时写入一整份深拷贝日程，与模板数据互不影响
    importDays(tripId: string, days: ImportedDay[]) {
      const copied: DayPlan[] = days.map((day) => ({
        id: crypto.randomUUID(),
        trip_id: tripId,
        day_index: day.day_index,
        date: day.date,
        items: day.items.map((item) => ({ ...item })),
      }));
      this.dayPlans.push(...copied);
      dayPlanApi.save(this.dayPlans);
    },
    addSpot(tripId: string, spotId: string, dayIndex = 1) {
      const day = this.ensureDay(tripId, dayIndex);
      const item: DayPlanItem = { spot_id: spotId, start_time: '10:00', end_time: '12:00', note: '现场调整', transport: 'metro' };
      day.items.push(item);
      dayPlanApi.save(this.dayPlans);
      toast.ok(messages.spotAdded);
    },
    reorder(tripId: string, dayIndex: number, from: number, to: number) {
      const day = this.ensureDay(tripId, dayIndex);
      const [moved] = day.items.splice(from, 1);
      if (moved) day.items.splice(to, 0, moved);
      dayPlanApi.save(this.dayPlans);
    },
  },
});
