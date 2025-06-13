<template>
  <div class="org-tree-container">
    <div class="company-header">
      <div class="company-label">公司：</div>
      <el-input v-model="companyName" class="company-input" placeholder="请输入公司名称" />
    </div>

    <div class="org-info-card">
      <div class="org-logo">
        <el-avatar :size="40" icon="el-icon-office-building" />
      </div>
      <div class="org-text">
        <div class="org-title">{{ companyName }}</div>
        <div class="org-sub">主管：{{ manager || '—' }} ｜ 人员：{{ totalUserCount }}人</div>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-tree
            ref="deptTreeRef"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' }"
            node-key="id"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card shadow="hover">
          <div id="g6-container" style="width: 100%; height: 600px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import G6 from '@antv/g6'
import api from '@/api/system/user'

const companyName = ref('陈伟伦合伙人事务所')
const manager = ref('')
const totalUserCount = ref(0)
const deptOptions = ref<any[]>([])
const deptTreeRef = ref()
const selectedDept = ref<any | null>(null)
let graph: any = null

// 获取组织结构树 + 计算人数
const getDeptTree = async () => {
  try {
    const [deptRes, userRes] = await Promise.all([
      api.deptTreeSelect(),
      api.listUser({ pageNum: 1, pageSize: 10000 })
    ])

    const deptUserCount: Record<number, number> = {}
    userRes.rows.forEach((user: any) => {
      if (user.deptId) {
        deptUserCount[user.deptId] = (deptUserCount[user.deptId] || 0) + 1
      }
    })
    totalUserCount.value = userRes.total

    const processTree = (depts: any[]): any[] => {
      return depts.map(dept => {
        const children = dept.children ? processTree(dept.children) : []
        const total = children.reduce((sum, c) => sum + (c.userCount || 0), 0) + (deptUserCount[dept.id] || 0)
        return {
          ...dept,
          userCount: total,
          label: dept.label,
          leader: dept.leader || '',
          children
        }
      })
    }

    deptOptions.value = processTree(deptRes.data)
  } catch (err) {
    console.error('组织结构获取失败', err)
  }
}

// 构建 G6 所需格式结构（从任意节点）
const buildSubTree = (node: any): any => {
  return {
    id: String(node.id),
    label: `${node.label}\n主管：${node.leader || '未设置'}\n部门人数：${node.userCount ?? 0}`,
    children: (node.children || []).map(buildSubTree)
  }
}

// 使用真实组织结构首个节点为 root
const getInitialRootNode = (): any => {
  if (!deptOptions.value.length) return null
  return deptOptions.value[0] // ✅ 不再人为包装 root
}

// 渲染图表
const renderG6ChartFromNode = (rootNode: any) => {
  const container = document.getElementById('g6-container')
  if (!container || !rootNode) return

  if (graph) {
    graph.destroy()
    graph = null
  }

  const data = buildSubTree(rootNode)

  graph = new G6.TreeGraph({
    container: 'g6-container',
    width: container.clientWidth,
    height: container.clientHeight,
    modes: {
      default: ['drag-canvas', 'zoom-canvas']
    },
    defaultNode: {
      type: 'rect',
      size: [200, 60],
      anchorPoints: [
        [0.5, 0],
        [0.5, 1]
      ],
      style: {
        fill: '#E3F2FD',
        stroke: '#2196F3',
        radius: 6
      },
      labelCfg: {
        style: {
          fill: '#333',
          fontSize: 12,
          textAlign: 'center',
          lineHeight: 16
        }
      }
    },
    defaultEdge: {
      type: 'cubic-vertical',
      sourceAnchor: 1,
      targetAnchor: 0,
      style: {
        stroke: '#999'
      }
    },
    layout: {
      type: 'compactBox',
      direction: 'TB',
      getId: d => d.id,
      getHeight: () => 60,
      getWidth: () => 200,
      getVGap: () => 50,
      getHGap: () => 40
    }
  })

  graph.data(data)
  graph.render()
  graph.fitCenter() // ✅ 居中
}

// 点击左侧节点
const handleNodeClick = (node: any) => {
  selectedDept.value = node
  nextTick(() => renderG6ChartFromNode(node))
}

// 初始化加载
onMounted(async () => {
  await getDeptTree()
  nextTick(() => {
    const root = getInitialRootNode()
    if (root) renderG6ChartFromNode(root)
  })
})
</script>

<style scoped>
.org-tree-container {
  padding: 20px;
  background: #f9f9f9;
}
.company-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.company-label {
  font-weight: bold;
  margin-right: 10px;
}
.company-input {
  width: 300px;
}
.org-info-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.org-logo {
  margin-right: 12px;
}
.org-text {
  display: flex;
  flex-direction: column;
}
.org-title {
  font-size: 18px;
  font-weight: 600;
}
.org-sub {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}
</style>
