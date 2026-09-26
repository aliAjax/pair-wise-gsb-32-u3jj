import type { DayPlanItem } from './dayPlan';

export interface TemplateDay {
  day_index: number;
  items: DayPlanItem[];
}

export interface TripTemplate {
  id: string;
  title: string;
  destination: string;
  members: string[];
  budget: number;
  currency: string;
  days: TemplateDay[];
  created_at: string;
}
