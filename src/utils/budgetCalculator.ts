import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import type { Trip } from '../models/trip';
import type { TripTemplate } from '../models/tripTemplate';
import { messages } from '../constants/messages';

function costOfItems(items: DayPlan['items'], spotMap: Map<string, Spot>) {
  return items.reduce((sum, item) => sum + (spotMap.get(item.spot_id)?.price || 0), 0);
}

export function calcTripCost(dayPlans: DayPlan[], spots: Spot[]) {
  const spotMap = new Map(spots.map((spot) => [spot.id, spot]));
  return dayPlans.reduce((sum, day) => sum + costOfItems(day.items, spotMap), 0);
}

// 模板内每天景点门票的合计预算（预览用，模板与行程数据互不影响）
export function calcTemplateCost(template: TripTemplate, spots: Spot[]) {
  const spotMap = new Map(spots.map((spot) => [spot.id, spot]));
  return template.days.reduce((sum, day) => sum + costOfItems(day.items, spotMap), 0);
}

export function budgetStatus(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
  const spent = calcTripCost(dayPlans, spots);
  return { spent, remaining: trip.budget - spent, warning: spent > trip.budget ? messages.budgetExceeded : '' };
}

