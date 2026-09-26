<template>
  <article class="trip-card">
    <div>
      <strong>{{ template.title }}</strong>
      <p class="muted">{{ template.destination }} · {{ template.days.length }} 天 · 同行 {{ template.members.join('、') }}</p>
    </div>
    <el-tag>合计预算 {{ formatCurrency(totalCost, template.currency) }}</el-tag>
    <ol class="day-preview">
      <li v-for="day in template.days" :key="day.day_index">
        第 {{ day.day_index }} 天：{{ daySpotNames(day) || '这一天还没有安排' }}
      </li>
    </ol>
    <div class="toolbar">
      <el-button type="primary" @click="$emit('use', template.id)">从模板新建</el-button>
      <el-button @click="$emit('remove', template.id)">删除模板</el-button>
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { TemplateDay, TripTemplate } from '../../models/tripTemplate';
import type { Spot } from '../../models/spot';
import { calcTemplateCost } from '../../utils/budgetCalculator';
import { formatCurrency } from '../../utils/formatters';
const props = defineProps<{ template: TripTemplate; spots: Spot[] }>();
defineEmits<{ use: [id: string]; remove: [id: string] }>();
const totalCost = computed(() => calcTemplateCost(props.template, props.spots));
const daySpotNames = (day: TemplateDay) =>
  day.items.map((item) => props.spots.find((spot) => spot.id === item.spot_id)?.name || '未知景点').join('、');
</script>
<style scoped>
.trip-card { background: #fff; border: 1px solid #dbe7cf; border-radius: 8px; padding: 18px; }
.day-preview { margin: 12px 0; padding-left: 20px; color: #61706b; }
</style>
