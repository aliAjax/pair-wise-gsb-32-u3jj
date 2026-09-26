import dayjs from 'dayjs';
import type { DayPlan } from '../models/dayPlan';
import type { TripTemplate } from '../models/tripTemplate';

export const templateDayCount = (template: TripTemplate) => template.days.length;

export function tripDayCount(startDate: string, endDate: string) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!startDate || !endDate || !start.isValid() || !end.isValid() || end.isBefore(start)) return 0;
  return end.diff(start, 'day') + 1;
}

export interface ScheduleGap {
  templateDays: number;
  tripDays: number;
  diff: number;
  matched: boolean;
}

export function scheduleGap(template: TripTemplate, startDate: string, endDate: string): ScheduleGap {
  const templateDays = templateDayCount(template);
  const tripDays = tripDayCount(startDate, endDate);
  const diff = tripDays - templateDays;
  return { templateDays, tripDays, diff, matched: tripDays > 0 && templateDays === tripDays };
}

export function shiftTemplateDays(template: TripTemplate, tripId: string, startDate: string): DayPlan[] {
  return template.days.map((day) => ({
    id: crypto.randomUUID(),
    trip_id: tripId,
    day_index: day.day_index,
    date: dayjs(startDate).add(day.day_index - 1, 'day').format('YYYY-MM-DD'),
    items: day.items.map((item) => ({ ...item })),
  }));
}
