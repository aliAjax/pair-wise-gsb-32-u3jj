<template>
  <main class="page" v-if="template">
    <div class="toolbar">
      <RouterLink to="/templates">← 返回模板列表</RouterLink>
    </div>
    <h1>从模板新建：{{ template.title }}</h1>
    <section class="band">
      <p class="muted">{{ template.destination || '目的地未填' }} · 模板共 {{ template.days.length }} 天 · 同行 {{ template.members.join('、') || '暂无' }}</p>
      <div class="date-row">
        <el-date-picker v-model="startDate" type="date" value-format="YYYY-MM-DD" placeholder="开始日期" />
        <el-date-picker v-model="endDate" type="date" value-format="YYYY-MM-DD" placeholder="结束日期" />
      </div>
      <el-alert
        class="gap-alert"
        :title="check.message"
        :type="check.isInvalid ? 'warning' : check.isMatch ? 'success' : 'error'"
        :closable="false"
        show-icon
      />
      <div v-if="!check.isInvalid" class="day-lines">
        <div v-for="dayIndex in template.days.length" :key="dayIndex" class="day-line">
          <span class="day-badge">第 {{ dayIndex }} 天</span>
          <span>{{ shiftDate(startDate, dayIndex) }}</span>
          <span class="muted">
            <template v-if="template.days[dayIndex - 1].items.length">
              {{ template.days[dayIndex - 1].items.map((item) => spotName(item.spot_id)).join(' → ') }}
            </template>
            <template v-else>暂未安排景点</template>
          </span>
        </div>
      </div>
      <div v-if="!check.isMatch && !check.isInvalid" class="muted">
        模板天数和所选日期对不上，需先调整模板天数后再创建。
      </div>
      <div class="toolbar">
        <el-button type="primary" :disabled="!check.isMatch" @click="create">按此日期创建行程</el-button>
        <el-button v-if="!check.isMatch" @click="router.push('/templates/' + template.id + '/edit')">去调整模板</el-button>
      </div>
    </section>
  </main>
  <main v-else class="page"><EmptyState title="模板不存在或已被清理" description="回到模板列表重新选择。" /></main>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EmptyState from '../components/common/EmptyState.vue';
import { useTemplateStore } from '../stores/templateStore';
import { useSpotStore } from '../stores/spotStore';
import { checkDateRange, shiftDate } from '../utils/templateDate';
import { messages } from '../constants/messages';

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();
const spotStore = useSpotStore();
const templateId = String(route.params.id);
const template = computed(() => templateStore.getById(templateId));

const startDate = ref('');
const endDate = ref('');

const check = computed(() =>
  template.value
    ? checkDateRange(template.value, startDate.value, endDate.value)
    : { selectedDays: 0, templateDays: 0, gap: 0, isMatch: false, isInvalid: true, message: '模板不存在' },
);

function spotName(id: string) {
  return spotStore.spots.find((spot) => spot.id === id)?.name || messages.templateMissingSpot;
}
function create() {
  if (!template.value || !check.value.isMatch) return;
  const tripId = templateStore.instantiate(template.value.id, startDate.value, endDate.value);
  if (tripId) router.replace('/trip/' + tripId);
}
</script>
<style scoped>
.date-row { display: flex; gap: 12px; margin: 14px 0; flex-wrap: wrap; }
.gap-alert { max-width: 720px; }
.day-lines { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
.day-line { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; font-size: 14px; }
.day-badge { font-weight: 700; color: #1f3d2b; min-width: 64px; }
</style>
