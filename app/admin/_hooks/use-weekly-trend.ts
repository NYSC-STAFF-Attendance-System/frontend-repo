"use client";

import { weeklyTrend } from "../_data";

const PLOT_HEIGHT = 184;
const SCALE_MAX = 210;

export function useWeeklyTrend() {
  return weeklyTrend.map((day, index) => ({
    label: day.label,
    value: day.value,
    isToday: index === weeklyTrend.length - 1,
    barHeight: (day.value / SCALE_MAX) * PLOT_HEIGHT,
  }));
}
