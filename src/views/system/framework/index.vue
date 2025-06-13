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

      <!-- 右侧组织结构 -->
      <el-col :span="18">
        <el-card shadow="hover">
          <div v-if="selectedDept">
            <div class="org-chart">
              <el-tree
                :data="[selectedDept]"
                :props="{ label: 'label', children: 'children' }"
                node-key="id"
                default-expand-all
                class="org-tree"
              >
                <template #default="{ node, data }">
                  <div class="org-node">
                    <div class="dept-name">{{ data.label }}</div>
                    <div class="dept-meta">部门人数 {{ data.userCount || 0 }}</div>
                    <div class="dept-meta">{{ data.leader ? `主管 ${data.leader}` : '未设置主管' }}</div>
                  </div>
                </template>
              </el-tree>
            </div>
          </div>
          <div v-else class="empty-placeholder">请选择左侧部门查看结构</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElAvatar, ElInput, ElTree, ElRow, ElCol, ElCard } from 'element-plus';
import api from '@/api/system/user';

const companyName = ref('陈伟伦合伙人事务所');
const manager = ref('');
const totalUserCount = ref(0);
const deptOptions = ref<any[]>([]);
const selectedDept = ref<any | null>(null);
const deptTreeRef = ref();

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
  selectedDept.value = findDeptById(deptOptions.value, node.id);
};

onMounted(() => {
  getDeptTree();
});
</script>

<style scoped>
.org-tree-container {
  padding: 20px;
  background: #f9f9f9;
  font-family: 'Helvetica Neue', sans-serif;
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

.org-chart {
  background: white;
  padding: 16px;
  border-radius: 6px;
}

.org-node {
  padding: 8px 12px;
  background: #f6f9fc;
  border-radius: 6px;
  text-align: center;
  width: 150px;
}

.dept-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.dept-meta {
  font-size: 12px;
  color: #666;
}

.empty-placeholder {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 40px;
}
</style>
