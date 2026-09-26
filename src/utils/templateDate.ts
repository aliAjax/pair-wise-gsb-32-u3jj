import dayjs from 'dayjs';
import type { TripTemplate } from '../models/tripTemplate';

export interface DateRangeCheck {
  selectedDays: number;
  templateDays: number;
  gap: number;
  isMatch: boolean;
  isInvalid: boolean;
  message: string;
}

export const toISODate = (value: string) => dayjs(value).format('YYYY-MM-DD');

// 起止日期包含首尾，按天计算
export function countDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) return 0;
  return end.diff(start, 'day') + 1;
}

// 模板第 dayIndex 天（从 1 开始）按起始日平移到具体日期
export function shiftDate(startDate: string, dayIndex: number): string {
  return dayjs(startDate).add(dayIndex - 1, 'day').format('YYYY-MM-DD');
}

export function buildTripDates(startDate: string, dayCount: number): string[] {
  return Array.from({ length: dayCount }, (_, index) => shiftDate(startDate, index + 1));
}

// 模板天数与新填起止日期对不上时，指出缺口
export function checkDateRange(template: TripTemplate, startDate: string, endDate: string): DateRangeCheck {
  const templateDays = template.days.length;
  const selectedDays = countDays(startDate, endDate);
  if (!startDate || !endDate) {
    return { selectedDays, templateDays, gap: templateDays, isMatch: false, isInvalid: true, message: '请先选择起止日期' };
  }
  if (selectedDays === 0) {
    return { selectedDays, templateDays, gap: templateDays, isMatch: false, isInvalid: true, message: '结束日期不能早于开始日期，请重新选择' };
  }
  const gap = selectedDays - templateDays;
  if (gap === 0) {
    return { selectedDays, templateDays, gap: 0, isMatch: true, isInvalid: false, message: `日期共 ${selectedDays} 天，与模板一致` };
  }
  const message = gap > 0
    ? `模板只有 ${templateDays} 天，所选日期多出 ${gap} 天，请先到模板编辑页补上天数`
    : `模板有 ${templateDays} 天，所选日期少 ${-gap} 天，请先到模板编辑页删减天数`;
  return { selectedDays, templateDays, gap, isMatch: false, isInvalid: false, message };
}
