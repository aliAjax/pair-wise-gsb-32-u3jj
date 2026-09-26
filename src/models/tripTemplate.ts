import type { DayPlanItem } from './dayPlan';

export interface TemplateDay {
  day_index: number;
  items: DayPlanItem[];
}

export interface TripTemplate {
  id: string;
  title: string;
  destination: string;
  budget: number;
  currency: string;
  members: string[];
  days: TemplateDay[];
  created_at: string;
}
