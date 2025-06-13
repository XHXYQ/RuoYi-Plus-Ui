<template>
  <div class="chat-page flex h-screen">
    <ChatSidebar
      :sessions="chatSessions"
      :active-session-id="activeSessionId"
      @select="handleSelectSession"
    />
    <ChatWindow
      v-if="activeSession"
      :session="activeSession"
      :messages="messageMap[activeSessionId] || []"
      @send="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import ChatSidebar from './ChatSidebar.vue'
import ChatWindow from './ChatWindow.vue'
import { useUserStore } from '@/store/modules/user'
import { listChatSession } from '@/api/system/chatSession'

const userStore = useUserStore()
const chatSessions = ref<any[]>([])
const activeSessionId = ref<number | null>(null)
const messageMap = reactive<Record<number, any[]>>({})

const activeSession = computed(() =>
  chatSessions.value.find(s => s.id === activeSessionId.value)
)

const socket = ref<WebSocket | null>(null)
const isConnected = ref(false)
let pingTimer: ReturnType<typeof setInterval> | null = null
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5

const initWebSocket = () => {
  const token = userStore.token
  const clientId = import.meta.env.VITE_APP_CLIENT_ID
  const wsUrl = `ws://localhost:8080/resource/websocket?clientid=${clientId}&Authorization=Bearer%20${encodeURIComponent(token)}`
  socket.value = new WebSocket(wsUrl)

  socket.value.onopen = () => {
    isConnected.value = true
    reconnectAttempts.value = 0
    const registerMessage = JSON.stringify({
      type: 'register',
      userId: userStore.userId,
      token: token
    })
    socket.value?.send(registerMessage)

    pingTimer = setInterval(() => {
      if (isConnected.value) {
        socket.value?.send(JSON.stringify({ type: 'ping' }))
      }
    }, 15000)
  }

  socket.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.code === 200 && data.data) {
        const msg = data.data
        const sid = msg.sessionId
        if (!messageMap[sid]) messageMap[sid] = []
        messageMap[sid].push(msg)
        if (sid === activeSessionId.value) scrollToBottom()
      }
    } catch (e) {
      console.error('WebSocket 消息解析失败:', e)
    }
  }

  socket.value.onerror = () => reconnect()
  socket.value.onclose = () => reconnect()
}

const reconnect = () => {
  isConnected.value = false
  if (pingTimer) clearInterval(pingTimer)
  if (reconnectAttempts.value < maxReconnectAttempts) {
    reconnectAttempts.value++
    setTimeout(initWebSocket, 3000 * reconnectAttempts.value)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    const list = document.querySelector('.message-list')
    if (list) list.scrollTop = list.scrollHeight
  })
}

const loadSessions = async () => {
  const res = await listChatSession()
  chatSessions.value = res.rows || []
  if (chatSessions.value.length > 0) {
    activeSessionId.value = chatSessions.value[0].id
    await handleSelectSession(activeSessionId.value)
  }
}

const handleSelectSession = async (sessionId: number) => {
  activeSessionId.value = sessionId
  if (!messageMap[sessionId]) {
    const res = await fetch(`/system/chatMessage/list?sessionId=${sessionId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    messageMap[sessionId] = data.rows || []
  }
}

const handleSendMessage = async (content: string) => {
  if (!activeSessionId.value) return
  if (!messageMap[activeSessionId.value]) messageMap[activeSessionId.value] = []

await fetch('http://localhost:8080/system/chatMessage/send/group', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'satoken': userStore.token   // ✅ 替换 Authorization
  },
  body: JSON.stringify({
    sessionId: activeSessionId.value,
    message: content
  })
})


  messageMap[activeSessionId.value].push({
    senderId: userStore.userId,
    senderName: '我',
    senderAvatar: userStore.avatar,
    content,
    timestamp: Date.now()
  })
  scrollToBottom()
}

onMounted(() => {
  initWebSocket()
  loadSessions()
})

onUnmounted(() => {
  socket.value?.close()
  if (pingTimer) clearInterval(pingTimer)
})
</script>

<style scoped>
.chat-page {
  background-color: #f9f9f9;
}
</style>
