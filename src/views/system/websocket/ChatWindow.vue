<template>
  <div class="flex-1 flex flex-col h-full bg-gray-50">
    <!-- 消息列表 -->
    <div class="flex-1 overflow-y-auto p-4" ref="messageListRef">
      <div
        v-for="(msg, index) in messages"
        :key="msg.messageId || index"
        class="flex items-start mb-3"
        :class="{ 'flex-row-reverse': msg.senderId === userStore.userId }"
      >
        <img :src="msg.senderAvatar" class="w-8 h-8 rounded-full mx-2" />
        <div>
          <div class="text-xs text-gray-500 mb-1">{{ msg.senderName }}</div>
          <div
            class="px-3 py-2 rounded-xl max-w-xs break-words"
            :class="msg.senderId === userStore.userId ? 'bg-green-200' : 'bg-white'"
          >
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- 输入框区域 -->
    <div class="border-t p-3 bg-white flex items-center">
      <el-input
        v-model="inputMessage"
        placeholder="输入消息..."
        class="flex-1"
        @keyup.enter="emitSend"
        clearable
      />
      <el-button
        type="primary"
        :disabled="!inputMessage.trim()"
        @click="emitSend"
        class="ml-2"
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useUserStore } from '@/store/modules/user'

const inputMessage = ref('')
const messageListRef = ref<HTMLElement | null>(null)
const userStore = useUserStore()

const emit = defineEmits(['send'])
const props = defineProps<{ session: any, messages: any[] }>()

const emitSend = () => {
  if (!inputMessage.value.trim()) return
  emit('send', inputMessage.value)
  inputMessage.value = ''
}

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      messageListRef.value!.scrollTop = messageListRef.value!.scrollHeight
    })
  }
)
</script>