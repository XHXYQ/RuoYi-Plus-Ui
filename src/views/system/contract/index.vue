<template>
  <div class="employee-management">
    <div class="contract-filter-section">
      <div class="contract-tabs">
        <el-tabs v-model="activeContractTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部合同" name="all" />
          <el-tab-pane label="60天到期" name="expire60" />
          <el-tab-pane label="45天到期" name="expire45" />
          <el-tab-pane label="15天到期" name="expire15" />
          <el-tab-pane label="到期未续约" name="expired" />
        </el-tabs>
      </div>
    </div>

    <div class="action-section">
      <div class="filter-area">
        <el-input
          v-model="searchQuery.name"
          placeholder="搜索员工"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchQuery.jobnumber"
          placeholder="搜索工号"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><search /></el-icon>
          </template>
        </el-input>
        <el-button>
          <el-icon><filter /></el-icon>
          高级筛选
        </el-button>
      </div>
      
      <div class="action-buttons">
        <el-button>批量签署</el-button>
        <el-button @click="handleExport">导出台账</el-button>
        <el-button @click="handleImport">导入台账</el-button>
        <el-button type="primary" @click="handleAdd">新增合同</el-button>
      </div>
    </div>

    <div class="employee-table">
      <el-table 
        :data="filteredContractData" 
        style="width: 100%"
        stripe
        :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
        v-loading="loading"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="姓名" min-width="120" fixed="left" >
          <template #default="{ row }">
            <div class="name-cell">
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="jobnumber" label="工号" />
        <el-table-column prop="employeeType" label="员工类型" min-width="120" />
        <el-table-column prop="deptName" label="部门">
          <template #default="{ row }">
            {{ getDeptNameById(row.deptId) }}
          </template>
        </el-table-column>
        <el-table-column prop="contractnumber" label="合同编号" />
        <el-table-column prop="contractType" label="合同类型" min-width="120" />
        <el-table-column prop="statusType" label="签署状态" min-width="120" />
        <el-table-column prop="deadlineType" label="合同期限" min-width="120" />
        <el-table-column prop="startDate" label="开始日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="预计终止日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="statusxuType" label="续签状态" min-width="120" />
        <el-table-column prop="company" label="法人公司" />
        <el-table-column prop="signDate" label="签订日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.signDate) }}
          </template>
        </el-table-column>

        <el-table-column min-width="220" fixed="right" >
          <template #header>
            <span>操作</span>
            <el-icon class="setting-icon"><setting /></el-icon>
          </template>
          <template #default="{ row }">
            <el-button type="text" @click="handleNewSign(row)">发起新签</el-button>
            <el-button type="text" @click="handleModify(row)">变更合同</el-button>
            <el-button type="text" @click="handleMore(row)">更多</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredContractData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="addDialogVisible"
      title="新增合同"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="addForm" 
        label-width="100px"
        :rules="formRules"
        ref="addFormRef"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="工号" prop="jobnumber">
          <el-input v-model="addForm.jobnumber" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="员工类型" prop="employeeType">
          <el-select v-model="addForm.employeeType" placeholder="请选择员工类型" style="width: 100%">
            <el-option label="全职" value="全职" />
            <el-option label="兼职" value="兼职" />
            <el-option label="实习" value="实习" />
            <el-option label="劳务派遣" value="劳务派遣" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="addForm.deptId"
            :data="deptOptions"
            :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
            placeholder="选择部门"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="合同编号" prop="contractnumber">
          <el-input v-model="addForm.contractnumber" placeholder="请输入合同编号" />
        </el-form-item>
        <el-form-item label="合同类型" prop="contractType">
          <el-select v-model="addForm.contractType" placeholder="请选择合同类型" style="width: 100%">
            <el-option label="固定期限劳动合同" value="固定期限劳动合同" />
            <el-option label="无固定期限劳动合同" value="无固定期限劳动合同" />
            <el-option label="实习协议" value="实习协议" />
            <el-option label="劳务协议" value="劳务协议" />
          </el-select>
        </el-form-item>
        <el-form-item label="签署状态" prop="statusType">
          <el-select v-model="addForm.statusType" placeholder="请选择签署状态" style="width: 100%">
            <el-option label="未发起" value="未发起" />
            <el-option label="已发起" value="已发起" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同期限" prop="deadlineType">
          <el-select v-model="addForm.deadlineType" placeholder="请选择合同期限" style="width: 100%">
            <el-option label="6个月" value="6个月" />
            <el-option label="12个月" value="12个月" />
            <el-option label="24个月" value="24个月" />
            <el-option label="36个月或以上" value="36个月或以上" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="addForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="预计终止日期" prop="endDate">
          <el-date-picker
            v-model="addForm.endDate"
            type="date"
            placeholder="选择预计终止日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="续签状态" prop="statusxuType">
          <el-select v-model="addForm.statusxuType" placeholder="请选择续签状态" style="width: 100%">
            <el-option label="未续签" value="未续签" />
            <el-option label="已续签" value="已续签" />
          </el-select>
        </el-form-item>
        <el-form-item label="法人公司" prop="company">
          <el-input v-model="addForm.company" placeholder="请输入法人公司" />
        </el-form-item>
        <el-form-item label="签订日期" prop="signDate">
          <el-date-picker
            v-model="addForm.signDate"
            type="date"
            placeholder="选择签订日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmAdd" :loading="submitLoading">
            添加合同到合同管理
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入合同台账"
      width="50%"
      :close-on-click-modal="false"
    >
      <div class="import-container">
        <div class="import-step">
          <div class="step-header">
            <div class="step-number">1</div>
            <div class="step-title">下载模板</div>
          </div>
          <div class="step-tips">请先下载合同台账模板，按照模板格式填写数据</div>
          <div class="upload-actions">
            <el-button type="primary" @click="downloadTemplate">下载模板</el-button>
          </div>
        </div>

        <div class="import-step">
          <div class="step-header">
            <div class="step-number">2</div>
            <div class="step-title">上传文件</div>
          </div>
          <div class="step-tips">请上传填写好的合同台账文件（支持.xlsx格式）</div>
          <div class="upload-area">
            <el-upload
              class="upload-content"
              drag
              action=""
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="false"
            >
              <el-icon class="upload-icon"><upload /></el-icon>
              <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmImport" :loading="importLoading">
            开始导入
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Filter, Upload, Setting, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { listDept } from '@/api/system/dept'
import { 
  listContract, 
  pageContract, 
  addContract, 
  updateContract, 
  delContract 
} from '@/api/system/contract'
import type { 
  SysContractVO, 
  SysContractQuery, 
  SysContractForm 
} from '@/api/system/contract/types'

const addFormRef = ref<FormInstance>();
const router = useRouter()
const activeContractTab = ref('all')
const loading = ref(false)
const importLoading = ref(false)
const submitLoading = ref(false)
const importDialogVisible = ref(false)
const addDialogVisible = ref(false)

// 搜索条件
const searchQuery = reactive({
  name: '',
  jobnumber: ''
})

// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 合同数据
const contractData = ref<SysContractVO[]>([])

// 部门选项
const deptOptions = ref([])

// 新增表单
const addForm = reactive<SysContractForm>({
  name: '',
  jobnumber: '',
  deptId: undefined,
  employeeType: '',
  contractnumber: '',
  contractType: '',
  statusType: '',
  deadlineType: '',
  startDate: '',
  endDate: '',
  statusxuType: '',
  company: '',
  signDate: ''
})

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  jobnumber: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  employeeType: [{ required: true, message: '请选择员工类型', trigger: 'change' }],
  contractnumber: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  contractType: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  statusType: [{ required: true, message: '请选择签署状态', trigger: 'change' }],
  deadlineType: [{ required: true, message: '请选择合同期限', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择预计终止日期', trigger: 'change' }]
})

// 计算日期差
const getDaysDiff = (dateStr: string) => {
  if (!dateStr) return Infinity;
  const today = new Date();
  const endDate = new Date(dateStr);
  const diffTime = endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 筛选后的合同数据
const filteredContractData = computed(() => {
  let data = [...contractData.value];
  
  // 应用搜索条件
  if (searchQuery.name) {
    data = data.filter(item => item.name?.includes(searchQuery.name));
  }
  if (searchQuery.jobnumber) {
    data = data.filter(item => item.jobnumber?.includes(searchQuery.jobnumber));
  }
  
  // 应用标签筛选条件
  switch (activeContractTab.value) {
    case 'expire60':
      data = data.filter(item => {
        const daysDiff = getDaysDiff(item.endDate || '');
        return daysDiff > 0 && daysDiff <= 60;
      });
      break;
    case 'expire45':
      data = data.filter(item => {
        const daysDiff = getDaysDiff(item.endDate || '');
        return daysDiff > 0 && daysDiff <= 45;
      });
      break;
    case 'expire15':
      data = data.filter(item => {
        const daysDiff = getDaysDiff(item.endDate || '');
        return daysDiff > 0 && daysDiff <= 15;
      });
      break;
    case 'expired':
      data = data.filter(item => {
        const daysDiff = getDaysDiff(item.endDate || '');
        return daysDiff <= 0 && item.statusxuType === '未续签';
      });
      break;
    default:
      // 全部合同，不做额外筛选
      break;
  }
  
  // 应用分页
  const start = (pagination.pageNum - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return data.slice(start, end);
});

// 获取部门列表
const getDeptList = async () => {
  try {
    const res = await listDept()
    deptOptions.value = res.data || []
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
  }
}

// 获取合同列表
const getContractList = async () => {
  loading.value = true;
  try {
    const res = await pageContract({
      ...searchQuery,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    });

    const data = res.rows || [];
    const total = res.total || 0;


    contractData.value = data.map(item => ({
      ...item,
      jobnumber: item.jobnumber,
      checked: false,
      startDate: formatDate(item.startDate),
      endDate: formatDate(item.endDate),
      signDate: formatDate(item.signDate)
    }));
    
    pagination.total = total;
  } catch (error) {
    console.error('获取合同列表失败:', error);
    ElMessage.error('获取合同列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  pagination.pageNum = 1; // 重置到第一页
};

// 处理搜索
const handleSearch = () => {
  pagination.pageNum = 1 // 重置到第一页
  getContractList()
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.pageNum = 1 // 重置到第一页
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
}

// 打开新增合同对话框
const handleAdd = () => {
  Object.assign(addForm, {
    name: '',
    jobnumber: '',
    deptId: undefined,
    employeeType: '',
    contractnumber: '',
    contractType: '',
    statusType: '',
    deadlineType: '',
    startDate: '',
    endDate: '',
    statusxuType: '',
    company: '',
    signDate: ''
  })
  addDialogVisible.value = true
}

// 确认新增合同
const handleConfirmAdd = async () => {
  try {
    await addFormRef.value?.validate();
    
    const submitData: SysContractForm = {
      ...addForm,
      deptId: Number(addForm.deptId),
      startDate: formatDate(addForm.startDate),
      endDate: formatDate(addForm.endDate),
      signDate: formatDate(addForm.signDate)
    };
    
    const res = await addContract(submitData);
    
    if (res.code === 200) {
      ElMessage.success('新增成功');
      addDialogVisible.value = false;
      getContractList();
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error(error.response?.data?.msg || '提交失败');
  }
};

// 处理导入
const handleImport = () => {
  importDialogVisible.value = true
}

// 下载模板
const downloadTemplate = () => {
  ElMessage.info('模板下载功能待实现')
}

// 处理文件变化
const handleFileChange = (file: any) => {
  console.log('选择的文件:', file)
}

// 确认导入
const handleConfirmImport = async () => {
  importLoading.value = true
  try {
    ElMessage.success('导入成功')
    importDialogVisible.value = false
    getContractList()
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  } finally {
    importLoading.value = false
  }
}

// 处理导出
const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

// 发起新签
const handleNewSign = (row: SysContractVO) => {
  ElMessage.info(`发起新签: ${row.name}`)
}

// 变更合同
const handleModify = (row: SysContractVO) => {
  ElMessage.info(`变更合同: ${row.name}`)
}

// 更多操作
const handleMore = (row: SysContractVO) => {
  ElMessage.info(`更多操作: ${row.name}`)
}

// 格式化日期
const formatDate = (date: string | Date | undefined) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 根据部门ID获取部门名称
const getDeptNameById = (id: number | undefined) => {
  if (!id) return ''
  
  const findDept = (depts: any[]): string | undefined => {
    for (const dept of depts) {
      if (dept.deptId === id) return dept.deptName
      if (dept.children) {
        const result = findDept(dept.children)
        if (result) return result
      }
    }
  }
  
  return findDept(deptOptions.value) || '未知部门'
}

// 初始化数据
onMounted(() => {
  getDeptList()
  getContractList()
})
</script>

<style scoped>
/* 保持原有的样式不变 */
.contract-filter-section {
  background-color: white;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.contract-tabs {
  margin-bottom: 16px;
}

.contract-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.contract-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e4e7ed;
}

.contract-search {
  display: flex;
  align-items: center;
}

.contract-search .search-input {
  width: 200px;
  margin-right: 12px;
}

.employee-management {
  padding: 20px;
  background-color: #f5f7fa;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.filter-area {
  display: flex;
  align-items: center;
}

.search-input {
  width: 200px;
  margin-right: 12px;
}

.filter-select {
  width: 120px;
  margin-right: 12px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-table {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.el-table {
  flex: 1;
  overflow: auto;
}

.el-table::before {
  height: 0;
}

.el-table th.el-table__cell {
  background-color: #f5f7fa !important;
}

.el-table--border::after, .el-table--group::after {
  width: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.import-container {
  padding: 0 20px;
}

.import-step {
  margin-bottom: 30px;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.step-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #909399;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 10px;
}

.step-title {
  font-size: 16px;
  font-weight: 500;
  color: #909399;
}

.step-tips {
  margin-left: 30px;
  margin-bottom: 16px;
  color: black;
  font-size: 14px;
  line-height: 1.5;
}

.upload-area {
  margin-left: 30px;
  margin-bottom: 16px;
}

.upload-content {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  font-size: 40px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  color: black;
  font-size: 14px;
}

.upload-actions {
  margin-left: 30px;
  display: flex;
  gap: 12px;
  display: flex;
  justify-content: center;
}

/* 长方形头像样式 */
.rect-avatar {
  height: 30px;
  width: 30px;
  border-radius: 4px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 10px;
}

.rect-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rect-avatar .el-icon {
  font-size: 16px;
  color: #909399;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-icon {
  margin-left: 150px;
  cursor: pointer;
  color: #606266;
}
</style>