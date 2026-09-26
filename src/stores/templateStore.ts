import { defineStore } from 'pinia';
import type { TripTemplate, TemplateDay } from '../models/tripTemplate';
import type { DayPlanItem } from '../models/dayPlan';
import type { Trip } from '../models/trip';
import { tripTemplateApi } from '../api/tripTemplateApi';
import { useTripStore } from './tripStore';
import { useDayPlanStore } from './dayPlanStore';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';
import { shiftDate } from '../utils/templateDate';

export type TemplatePatch = Pick<TripTemplate, 'title' | 'destination' | 'members' | 'budget' | 'currency' | 'days'>;

export const useTemplateStore = defineStore('template', {
  state: () => ({ templates: tripTemplateApi.list() as TripTemplate[] }),
  getters: {
    getById: (state) => (id: string) => state.templates.find((item) => item.id === id),
  },
  actions: {
    persist() {
      tripTemplateApi.save(this.templates);
    },
    createBlank(): string {
      const template: TripTemplate = {
        id: crypto.randomUUID(),
        title: '未命名模板',
        destination: '',
        members: ['我'],
        budget: 0,
        currency: 'CNY',
        days: [{ day_index: 1, items: [] }],
        created_at: new Date().toISOString(),
      };
      this.templates.unshift(template);
      this.persist();
      toast.ok(messages.templateCreated);
      return template.id;
    },
    // 从已走完的行程另存模板：深拷贝资料与日程，之后两边互不影响
    createFromTrip(trip: Trip, tripDays: { day_index: number; items: DayPlanItem[] }[]): string {
      const template: TripTemplate = {
        id: crypto.randomUUID(),
        title: trip.title + ' 模板',
        destination: trip.destination,
        members: [...trip.members],
        budget: trip.budget,
        currency: trip.currency,
        days: tripDays
          .slice()
          .sort((a, b) => a.day_index - b.day_index)
          .map((day, index) => ({
            day_index: index + 1,
            items: day.items.map((item) => ({ ...item })),
          })),
        created_at: new Date().toISOString(),
      };
      this.templates.unshift(template);
      this.persist();
      toast.ok(messages.templateFromTrip);
      return template.id;
    },
    update(id: string, patch: TemplatePatch) {
      const template = this.getById(id);
      if (!template) return;
      const days: TemplateDay[] = patch.days.map((day, index) => ({
        day_index: index + 1,
        items: day.items.map((item) => ({ ...item })),
      }));
      Object.assign(template, {
        title: patch.title,
        destination: patch.destination,
        members: [...patch.members],
        budget: patch.budget,
        currency: patch.currency,
        days,
      });
      this.persist();
      toast.ok(messages.templateSaved);
    },
    remove(id: string) {
      this.templates = this.templates.filter((item) => item.id !== id);
      this.persist();
      toast.ok(messages.templateDeleted);
    },
    // 从模板新建行程：日程按天数平移，模板本身保持不变
    instantiate(id: string, startDate: string, endDate: string): string | null {
      const template = this.getById(id);
      if (!template) return null;
      const tripStore = useTripStore();
      const dayPlanStore = useDayPlanStore();
      const tripId = tripStore.addTrip({
        title: template.title.replace(/\s*模板$/, ''),
        destination: template.destination,
        start_date: startDate,
        end_date: endDate,
        budget: template.budget,
        currency: template.currency,
        members: [...template.members],
      });
      dayPlanStore.importDays(
        tripId,
        template.days.map((day) => ({
          day_index: day.day_index,
          date: shiftDate(startDate, day.day_index),
          items: day.items.map((item) => ({ ...item })),
        })),
      );
      toast.ok(messages.templateTripCreated);
      return tripId;
    },
  },
});
