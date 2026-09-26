import { defineStore } from 'pinia';
import { TripStatus } from '../constants/trip';
import type { Trip } from '../models/trip';
import type { DayPlan } from '../models/dayPlan';
import type { TripTemplate } from '../models/tripTemplate';
import { tripTemplateApi } from '../api/tripTemplateApi';
import { scheduleGap, shiftTemplateDays } from '../utils/templateSchedule';
import { useTripStore } from './tripStore';
import { useDayPlanStore } from './dayPlanStore';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

export const useTripTemplateStore = defineStore('tripTemplate', {
  state: () => ({ templates: tripTemplateApi.list() as TripTemplate[] }),
  actions: {
    saveFromTrip(trip: Trip, dayPlans: DayPlan[]) {
      const template: TripTemplate = {
        id: crypto.randomUUID(),
        title: trip.title,
        destination: trip.destination,
        budget: trip.budget,
        currency: trip.currency,
        members: [...trip.members],
        days: dayPlans
          .filter((day) => day.trip_id === trip.id)
          .sort((a, b) => a.day_index - b.day_index)
          .map((day) => ({ day_index: day.day_index, items: day.items.map((item) => ({ ...item })) })),
        created_at: new Date().toISOString(),
      };
      this.templates.unshift(template);
      tripTemplateApi.save(this.templates);
      toast.ok(messages.templateSaved);
      return template.id;
    },
    removeTemplate(id: string) {
      this.templates = this.templates.filter((template) => template.id !== id);
      tripTemplateApi.save(this.templates);
      toast.ok(messages.templateDeleted);
    },
    createTripFromTemplate(templateId: string, startDate: string, endDate: string) {
      const template = this.templates.find((item) => item.id === templateId);
      if (!template) return '';
      if (!scheduleGap(template, startDate, endDate).matched) {
        toast.warn(messages.templateGapMismatch);
        return '';
      }
      const trip: Trip = {
        id: crypto.randomUUID(),
        title: template.title,
        destination: template.destination,
        start_date: startDate,
        end_date: endDate,
        budget: template.budget,
        currency: template.currency,
        members: [...template.members],
        status: TripStatus.PLANNING,
        created_at: new Date().toISOString(),
      };
      useTripStore().importTrip(trip);
      useDayPlanStore().importDayPlans(shiftTemplateDays(template, trip.id, startDate));
      toast.ok(messages.templateTripCreated);
      return trip.id;
    },
  },
});
