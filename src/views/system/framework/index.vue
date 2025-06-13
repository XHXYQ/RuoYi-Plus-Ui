<template>
  <div class="org-tree-container">
    <!-- 顶部公司信息 -->
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
      <!-- 左侧部门树 -->
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

      <!-- 右侧 GoJS 图表 -->
      <el-col :span="18">
        <el-card shadow="hover">
          <div v-if="selectedDept">
            <div id="gojs-container" style="width: 100%; height: 600px;"></div>
          </div>
          <div v-else class="empty-placeholder">请选择左侧部门查看结构</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as go from 'gojs';
import api from '@/api/system/user';

const companyName = ref('陈伟伦合伙人事务所');
const manager = ref('');
const totalUserCount = ref(0);
const deptOptions = ref<any[]>([]);
const selectedDept = ref<any | null>(null);
const deptTreeRef = ref();

let diagram: go.Diagram;

const getDeptTree = async () => {
  try {
    const [deptRes, userRes] = await Promise.all([
      api.deptTreeSelect(),
      api.listUser({ pageNum: 1, pageSize: 10000 })
    ]);

    const deptUserCount: Record<number, number> = {};
    userRes.rows.forEach((user: any) => {
      if (user.deptId) {
        deptUserCount[user.deptId] = (deptUserCount[user.deptId] || 0) + 1;
      }
    });
    totalUserCount.value = userRes.total;

    const processDeptTree = (depts: any[]): any[] => {
      return depts.map((dept: any) => {
        const children = dept.children ? processDeptTree(dept.children) : [];
        const totalCount = children.reduce((sum, child) => sum + (child.userCount || 0), 0) + (deptUserCount[dept.id] || 0);
        return {
          ...dept,
          userCount: totalCount,
          label: dept.label,
          children,
          leader: dept.leader || ''
        };
      });
    };

    deptOptions.value = processDeptTree(deptRes.data);
  } catch (e) {
    console.error('获取组织结构失败', e);
  }
};

const findDeptById = (list: any[], id: number): any | null => {
  for (const item of list) {
    if (item.id === id) return item;
    if (item.children) {
      const result = findDeptById(item.children, id);
      if (result) return result;
    }
  }
  return null;
};

const handleNodeClick = (node: any) => {
  const dept = findDeptById(deptOptions.value, node.id);
  selectedDept.value = dept;
  renderGoJsChart(dept);
};

const renderGoJsChart = (rootDept: any) => {
  const container = document.getElementById('gojs-container');
  if (!container) return;

  // 销毁旧图
  if (diagram) {
    diagram.div = null;
    diagram.clear();
  }

  diagram = new go.Diagram('gojs-container', {
    initialContentAlignment: go.Spot.Center,
    layout: new go.TreeLayout({
      angle: 90, // 从上到下
      arrangement: go.TreeLayout.ArrangementHorizontal,
      layerSpacing: 50,
      nodeSpacing: 30
    }),
    'undoManager.isEnabled': true
  });

  // 节点样式模板
  diagram.nodeTemplate = go.GraphObject.make(go.Node, 'Auto',
    go.GraphObject.make(go.Shape, 'RoundedRectangle', {
      fill: '#E3F2FD',
      stroke: '#2196F3',
      strokeWidth: 1.5
    }),
    go.GraphObject.make(go.Panel, 'Table',
      { margin: 6 },
      go.GraphObject.make(go.TextBlock, { row: 0, font: 'bold 14px sans-serif' },
        new go.Binding('text', 'label')),
      go.GraphObject.make(go.TextBlock, { row: 1, font: '12px sans-serif' },
        new go.Binding('text', 'leader', val => val ? `主管：${val}` : '未设置主管')),
      go.GraphObject.make(go.TextBlock, { row: 2, font: '12px sans-serif' },
        new go.Binding('text', 'userCount', val => `部门人数：${val ?? 0}`))
    )
  );

  diagram.linkTemplate = go.GraphObject.make(go.Link,
    { routing: go.Link.Orthogonal, corner: 6 },
    go.GraphObject.make(go.Shape)
  );

  // 构建节点数据
  const buildGoData = (node: any, parentId?: string, result: any[] = []): any[] => {
    const id = String(node.id);
    const item: any = {
      key: id,
      label: node.label,
      leader: node.leader || '',
      userCount: node.userCount || 0
    };
    if (parentId) item.parent = parentId; // ✅ 仅非根节点设置 parent
    result.push(item);
    (node.children || []).forEach((child: any) => buildGoData(child, id, result));
    return result;
  };

  const nodeDataArray = buildGoData(rootDept);
  diagram.model = new go.TreeModel(nodeDataArray);
};

onMounted(() => {
  getDeptTree();
});
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
.empty-placeholder {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 40px;
}
</style>
