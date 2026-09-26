<template>
  <main class="page" v-if="draft">
    <div class="toolbar">
      <RouterLink to="/templates">← 返回模板列表</RouterLink>
    </div>
    <h1>编辑模板</h1>
    <section class="band form-band">
      <h3>模板资料</h3>
      <div class="form-grid">
        <label>标题
          <el-input v-model="draft.title" placeholder="例如：杭州周末慢旅行" />
        </label>
        <label>目的地
          <el-input v-model="draft.destination" placeholder="例如：杭州" />
        </label>
        <label>预算
          <el-input-number v-model="draft.budget" :min="0" :step="100" />
        </label>
        <label>币种
          <el-select v-model="draft.currency">
            <el-option v-for="code in CURRENCY_OPTIONS" :key="code" :label="code" :value="code" />
          </el-select>
        </label>
        <label class="span-2">同行人
          <el-select v-model="draft.members" multiple filterable allow-create default-first-option placeholder="输入同行人后回车" />
        </label>
      </div>
    </section>

    <section v-for="day in draft.days" :key="day.day_index" class="band day-band">
      <div class="day-head">
        <h3>第 {{ day.day_index }} 天</h3>
        <el-button v-if="draft.days.length > 1" type="danger" plain size="small" @click="removeDay(day.day_index)">删除该天</el-button>
      </div>
      <div v-for="(item, index) in day.items" :key="index" class="item-row">
        <el-select v-model="item.spot_id" placeholder="选择景点" class="spot-select">
          <el-option v-for="spot in spotStore.spots" :key="spot.id" :label="spot.name" :value="spot.id" />
        </el-select>
        <el-time-select v-model="item.start_time" start="00:00" step="00:30" end="23:30" placeholder="开始" />
        <el-time-select v-model="item.end_time" start="00:00" step="00:30" end="23:30" placeholder="结束" />
        <el-tag type="info">{{ formatDuration(item.start_time, item.end_time) }}</el-tag>
        <el-select v-model="item.transport" class="transport-select">
          <el-option v-for="option in TRANSPORT_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-input v-model="item.note" placeholder="备注" class="note-input" />
        <el-button :disabled="index === 0" size="small" @click="moveItem(day, index, index - 1)">上移</el-button>
        <el-button :disabled="index === day.items.length - 1" size="small" @click="moveItem(day, index, index + 1)">下移</el-button>
        <el-button type="danger" plain size="small" @click="day.items.splice(index, 1)">移除</el-button>
      </div>
      <p v-if="!day.items.length" class="muted">这一天还没有景点，点击下方按钮添加。</p>
      <div class="toolbar">
        <el-button size="small" @click="addItem(day)">添加景点</el-button>
      </div>
    </section>

    <div class="toolbar">
      <el-button @click="addDay">增加一天</el-button>
      <el-button type="primary" @click="save">保存模板</el-button>
    </div>
  </main>
  <main v-else class="page"><EmptyState title="模板不存在或已被清理" description="回到模板列表重新选择。" /></main>
</template>
<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EmptyState from '../components/common/EmptyState.vue';
import { useTemplateStore } from '../stores/templateStore';
import { useSpotStore } from '../stores/spotStore';
import type { TripTemplate, TemplateDay } from '../models/tripTemplate';
import type { DayPlanItem } from '../models/dayPlan';
import { formatDuration, TRANSPORT_OPTIONS } from '../utils/formatters';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

const CURRENCY_OPTIONS = ['CNY', 'USD', 'EUR', 'JPY'];

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();
const spotStore = useSpotStore();
const templateId = String(route.params.id);

const draft = computed<TripTemplate | null>(() => {
  const template = templateStore.getById(templateId);
  return template ? reactive(structuredClone(toPlain(template))) : null;
});

function toPlain(template: TripTemplate): TripTemplate {
  return {
    ...template,
    members: [...template.members],
    days: template.days.map((day) => ({ day_index: day.day_index, items: day.items.map((item) => ({ ...item })) })),
  };
}
function newItem(): DayPlanItem {
  return { spot_id: spotStore.spots[0]?.id || '', start_time: '09:00', end_time: '11:00', note: '', transport: 'metro' };
}
function addItem(day: TemplateDay) {
  day.items.push(newItem());
}
function addDay() {
  if (!draft.value) return;
  draft.value.days.push({ day_index: draft.value.days.length + 1, items: [] });
  toast.ok(messages.templateDayAdded);
}
function removeDay(dayIndex: number) {
  if (!draft.value) return;
  draft.value.days = draft.value.days.filter((day) => day.day_index !== dayIndex);
  draft.value.days.forEach((day, index) => { day.day_index = index + 1; });
  toast.ok(messages.templateDayRemoved);
}
function moveItem(day: TemplateDay, from: number, to: number) {
  const [moved] = day.items.splice(from, 1);
  day.items.splice(to, 0, moved);
}
function save() {
  if (!draft.value) return;
  if (!draft.value.title.trim()) {
    toast.fail('模板标题不能为空');
    return;
  }
  templateStore.update(templateId, {
    title: draft.value.title.trim(),
    destination: draft.value.destination.trim(),
    members: draft.value.members,
    budget: draft.value.budget,
    currency: draft.value.currency,
    days: draft.value.days,
  });
  router.push('/templates');
}
</script>
<style scoped>
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
.form-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
.span-2 { grid-column: span 2; }
.day-band { margin-top: 14px; }
.day-head { display: flex; align-items: center; justify-content: space-between; }
.item-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 10px 0; }
.spot-select { width: 180px; }
.transport-select { width: 110px; }
.note-input { width: 160px; }
</style>
