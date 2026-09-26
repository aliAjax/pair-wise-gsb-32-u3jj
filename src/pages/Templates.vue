<template>
  <main class="page">
    <h1>旅行模板</h1>
    <EmptyState v-if="!templateStore.templates.length" title="还没有旅行模板" :description="messages.emptyTemplates" />
    <section class="grid">
      <TemplateCard
        v-for="template in templateStore.templates"
        :key="template.id"
        :template="template"
        :spots="spotStore.spots"
        @use="useTemplate"
        @remove="templateStore.removeTemplate"
      />
    </section>
  </main>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import TemplateCard from '../components/common/TemplateCard.vue';
import EmptyState from '../components/common/EmptyState.vue';
import { useTripTemplateStore } from '../stores/tripTemplateStore';
import { useSpotStore } from '../stores/spotStore';
import { messages } from '../constants/messages';
const router = useRouter();
const templateStore = useTripTemplateStore();
const spotStore = useSpotStore();
function useTemplate(id: string) { router.push('/templates/' + id + '/new'); }
</script>
