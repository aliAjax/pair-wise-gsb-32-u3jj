<template>
  <main class="page">
    <div class="toolbar">
      <RouterLink to="/trips">← 返回我的旅行</RouterLink>
    </div>
    <h1>旅行模板</h1>
    <p class="muted">把走完的路线存成模板，下次只需填起止日期，日程自动按天数平移。</p>
    <div class="toolbar">
      <el-button type="primary" @click="createBlank">新建空白模板</el-button>
    </div>
    <EmptyState v-if="!templateStore.templates.length" title="还没有旅行模板" :description="messages.emptyTemplates" />
    <section class="tpl-grid">
      <article v-for="template in templateStore.templates" :key="template.id" class="tpl-card band">
        <div class="tpl-head">
          <strong>{{ template.title }}</strong>
          <el-tag>{{ template.days.length }} 天</el-tag>
        </div>
        <p class="muted">{{ template.destination || '目的地未填' }} · 同行 {{ template.members.length ? template.members.join('、') : '暂无' }}</p>
        <p>
          模板预算 {{ formatCurrency(template.budget, template.currency) }}
          · 景点门票合计 {{ formatCurrency(calcTemplateCost(template, spotStore.spots), template.currency) }}
        </p>
        <div class="day-lines">
          <div v-for="day in template.days" :key="day.day_index" class="day-line">
            <span class="day-badge">D{{ day.day_index }}</span>
            <span v-if="day.items.length" class="muted">
              <template v-for="(item, index) in day.items" :key="index">
                {{ spotName(item.spot_id) }}（{{ formatDuration(item.start_time, item.end_time) }}）<template v-if="index < day.items.length - 1"> → </template>
              </template>
            </span>
            <span v-else class="muted">暂未安排景点</span>
          </div>
        </div>
        <div class="toolbar">
          <el-button type="primary" @click="router.push('/templates/' + template.id + '/create')">从此模板新建</el-button>
          <el-button @click="router.push('/templates/' + template.id + '/edit')">编辑模板</el-button>
          <el-popconfirm title="确定清掉这个模板吗？已建行程不受影响。" @confirm="templateStore.remove(template.id)">
            <template #reference><el-button type="danger" plain>清理</el-button></template>
          </el-popconfirm>
        </div>
      </article>
    </section>
  </main>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import EmptyState from '../components/common/EmptyState.vue';
import { useTemplateStore } from '../stores/templateStore';
import { useSpotStore } from '../stores/spotStore';
import { calcTemplateCost } from '../utils/budgetCalculator';
import { formatCurrency, formatDuration } from '../utils/formatters';
import { messages } from '../constants/messages';

const router = useRouter();
const templateStore = useTemplateStore();
const spotStore = useSpotStore();

function createBlank() {
  router.push('/templates/' + templateStore.createBlank() + '/edit');
}
function spotName(id: string) {
  return spotStore.spots.find((spot) => spot.id === id)?.name || messages.templateMissingSpot;
}
</script>
<style scoped>
.tpl-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }
.tpl-card { display: flex; flex-direction: column; gap: 8px; }
.tpl-head { display: flex; align-items: center; justify-content: space-between; }
.day-lines { display: flex; flex-direction: column; gap: 6px; margin: 8px 0; }
.day-line { display: flex; gap: 8px; align-items: baseline; font-size: 13px; }
.day-badge { flex: none; font-weight: 700; color: #1f3d2b; }
</style>
