<template>
  <main class="page" v-if="template">
    <h1>从模板新建旅行</h1>
    <section class="band">
      <p><strong>{{ template.title }}</strong> · {{ template.destination }} · 模板共 {{ gap.templateDays }} 天</p>
      <div class="toolbar">
        <el-date-picker v-model="startDate" type="date" value-format="YYYY-MM-DD" placeholder="开始日期" />
        <el-date-picker v-model="endDate" type="date" value-format="YYYY-MM-DD" placeholder="结束日期" />
      </div>
      <el-alert v-if="!gap.matched" type="warning" :closable="false" :title="gapText" show-icon />
      <el-alert v-else type="success" :closable="false" :title="messages.templateGapOk" show-icon />
      <div class="toolbar">
        <el-button type="primary" :disabled="!gap.matched" @click="confirm">按模板创建</el-button>
        <el-button @click="router.push('/templates')">返回模板列表</el-button>
      </div>
    </section>
  </main>
  <main v-else class="page"><EmptyState title="模板不存在" /></main>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EmptyState from '../components/common/EmptyState.vue';
import { useTripTemplateStore } from '../stores/tripTemplateStore';
import { scheduleGap } from '../utils/templateSchedule';
import { messages } from '../constants/messages';
const route = useRoute();
const router = useRouter();
const templateStore = useTripTemplateStore();
const template = computed(() => templateStore.templates.find((item) => item.id === route.params.id));
const startDate = ref(new Date().toISOString().slice(0, 10));
const endDate = ref('');
const gap = computed(() => template.value
  ? scheduleGap(template.value, startDate.value, endDate.value)
  : { templateDays: 0, tripDays: 0, diff: 0, matched: false });
const gapText = computed(() => {
  if (!gap.value.tripDays) return messages.templateNeedDates;
  return gap.value.diff > 0
    ? `模板共 ${gap.value.templateDays} 天，所选日期有 ${gap.value.tripDays} 天，多出 ${gap.value.diff} 天没有安排，请先调整起止日期`
    : `模板共 ${gap.value.templateDays} 天，所选日期只有 ${gap.value.tripDays} 天，还缺 ${-gap.value.diff} 天，请先调整起止日期`;
});
function confirm() {
  if (!template.value) return;
  const tripId = templateStore.createTripFromTemplate(template.value.id, startDate.value, endDate.value);
  if (tripId) router.push('/trip/' + tripId);
}
</script>
