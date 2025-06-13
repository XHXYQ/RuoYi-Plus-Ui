<template>
  <div class="w-64 border-r bg-white overflow-y-auto">
    <div
      v-for="session in sessions"
      :key="session.id"
      @click="$emit('select', session.id)"
      class="p-4 cursor-pointer hover:bg-gray-100"
      :class="{ 'bg-gray-100 font-bold': session.id === activeSessionId }"
    >
      {{ session.name || '会话1' }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sessions: any[]
  activeSessionId: number | null
}>()
</script>