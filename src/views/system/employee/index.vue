<template>
  <div class="employee-management">
    <!-- 统计卡片 -->
    <div class="stats-card">
      <div class="stats-container">
        <div class="stats-row">
          <div class="stat-item highlight">
            <div class="label">在职员工</div>
            <div class="count">{{ statsData.total }}</div>
          </div>
          <el-divider direction="vertical" class="divider" />
          <div class="stat-item">
            <div class="label">全职</div>
            <div class="count">{{ statsData.fullTime }}</div>
          </div>
          <div class="stat-item">
            <div class="label">兼职</div>
            <div class="count">{{ statsData.partTime }}</div>
          </div>
          <div class="stat-item">
            <div class="label">实习</div>
            <div class="count">{{ statsData.intern }}</div>
          </div>
          <div class="stat-item">
            <div class="label">劳务派遣</div>
            <div class="count">{{ statsData.dispatch }}</div>
          </div>
          <div class="stat-item warning">
            <div class="label">无类型</div>
            <div class="count">{{ statsData.noType }}</div>
          </div>
          <el-divider direction="vertical" class="divider" />
          <div class="stat-item">
            <div class="label">试用</div>
            <div class="count">{{ statsData.probation }}</div>
          </div>
          <div class="stat-item">
            <div class="label">正式</div>
            <div class="count">{{ statsData.formal }}</div>
          </div>
          <div class="stat-item">
            <div class="label">待离职</div>
            <div class="count">{{ statsData.pendingLeave }}</div>
          </div>
          <div class="stat-item">
            <div class="label">无状态</div>
            <div class="count">{{ statsData.noStatus }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="action-section">
      <div class="filter-area">
        <el-input
          v-model="searchQuery"
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

        <el-select
          v-model="filterValue"
          placeholder="实人认证"
          class="filter-select"
        >
          <el-option
            v-for="item in filterOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button>
          <el-icon><filter /></el-icon>
          高级筛选
        </el-button>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">添加员工</el-button>
        <el-button>邀请认证</el-button>
        <el-button type="primary" plain>导出</el-button>
        <el-button type="primary" @click="handleImport">导入花名册</el-button>
      </div>
    </div>

    <!-- 员工表格 -->
    <div class="employee-table">
      <el-table 
        :data="employeeData" 
        style="width: 100%"
        stripe
        :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
        v-loading="loading"
      >
        <el-table-column width="50">
          <template #default="{ row }">
            <el-checkbox v-model="row.checked" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="{ row }">
            <div class="name-cell">
              <div class="rect-avatar">
                <img v-if="row.avatar" :src="row.avatar" />
                <el-icon v-else><User /></el-icon>
              </div>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="部门">
          <template #default="{ row }">
            {{ getDeptNameById(row.deptId) }}
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职位" min-width="120" />
        <el-table-column prop="startDate" label="入职时间" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="employeeType" label="员工类型" min-width="120" />
        <el-table-column prop="statusType" label="状态" min-width="120" />
        <el-table-column prop="phonenumber" label="手机号" min-width="150">
          <template #default="{ row }">
            {{ (row.phonenumber) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #header>
            <span>操作</span>
            <el-icon class="setting-icon"><setting /></el-icon>
          </template>
          <template #default="{ row }">
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      
    </div>

    <!-- 添加员工弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加员工"
      width="50%"
      :close-on-click-modal="false"
    >
      <div class="avatar-upload">
        <el-upload
          class="avatar-uploader"
          action="/api/upload"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload">
          <img v-if="addForm.avatar" :src="addForm.avatar" class="avatar">
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="upload-tip">点击上传员工头像</div>
      </div>
      <el-form 
        :model="addForm" 
        label-width="100px"
        :rules="formRules"
        ref="addFormRef"
      >
        <el-col :span="12">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="addForm.nickName" placeholder="请输入用户昵称" maxlength="30" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="addForm.userId == undefined" label="用户名称" prop="userName">
            <el-input v-model="addForm.userName" placeholder="请输入用户名称" maxlength="30" />
          </el-form-item>
        </el-col>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入姓名" />
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
        <el-form-item label="职位" prop="position">
          <el-input v-model="addForm.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="入职时间" prop="startDate">
          <el-date-picker
            v-model="addForm.startDate"
            type="date"
            placeholder="选择入职日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="员工类型" prop="employeeType">
          <el-select v-model="addForm.employeeType" placeholder="请选择员工类型" style="width: 100%">
            <el-option label="全职" value="全职" />
            <el-option label="兼职" value="兼职" />
            <el-option label="实习" value="实习" />
            <el-option label="劳务派遣" value="劳务派遣" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="statusType">
          <el-select v-model="addForm.statusType" placeholder="请选择状态" style="width: 100%">
            <el-option label="试用" value="试用" />
            <el-option label="正式" value="正式" />
            <el-option label="待离职" value="待离职" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="addForm.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmAdd" :loading="submitLoading">
            添加员工到花名册
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入员工弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量添加新员工"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="import-container">
        <div class="import-step">
          <div class="step-header">
            <div class="step-number">1</div>
            <div class="step-title">下载模板，填写内容</div>
          </div>
          <el-button 
            type="primary" plain
            @click="downloadTemplate"
          >
            下载模板
          </el-button>
        </div>
        
        <div class="import-step">
          <div class="step-header">
            <div class="step-number">2</div>
            <div class="step-title">导入模板</div>
          </div>
          
          <div class="step-tips">
            <p>·单次最多导入2000人，超出请分批上传</p>
            <p>·若导入的花名册中有「部门」字段，导入后「部门」字段不生效</p>
          </div>
          
          <el-upload
            class="upload-area"
            drag
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <div class="upload-content">
              <el-icon class="upload-icon"><upload /></el-icon>
              <div class="upload-text">拖拽文件到这里上传</div>
              <el-button type="primary" @click="triggerUpload" style="margin-top: 10px;">选择文件</el-button>
            </div>
          </el-upload>
          
          <div class="upload-actions">
            <el-button @click="importDialogVisible = false">取消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Search, Filter, Upload, Setting, Plus, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listDept } from '@/api/system/dept'
import { 
  listEmployee,
  addEmployee,
  SysEmployeeQuery,
  SysEmployeeForm,
  SysEmployeeVO,
  getEmployeeStats
} from '@/api/system/employee'

const router = useRouter()
const searchTimer = ref<number>() // 防抖计时器

// 搜索和筛选相关
const searchQuery = ref('')
const filterValue = ref('')
const filterOptions = [
  { value: 'unauthorized', label: '未授权' },
  { value: 'failed', label: '未通过' },
  { value: 'passed', label: '已通过' }
]

// 表格相关

const employeeData = ref<SysEmployeeVO[]>([])
const loading = ref(false)
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 查询参数
const queryParams = ref<SysEmployeeQuery>({
  pageNum: 1,
  pageSize: 20
})

// 部门选项
const deptOptions = ref([])

// 弹窗控制
const addDialogVisible = ref(false)
const importDialogVisible = ref(false)
const submitLoading = ref(false)

// 表单相关
const addForm = ref<SysEmployeeForm>({
  avatar: '',
  name: '',
  deptId: undefined,
  position: '',
  phonenumber: '',
  employeeType: '',
  statusType: '',
  startDate: '',
  nickName: '',
  userName: ''
})

const statsData = reactive<EmployeeStatsVo>({
  total: 0,
  fullTime: 0,
  partTime: 0,
  intern: 0,
  dispatch: 0,
  noType: 0,
  probation: 0,
  formal: 0,
  pendingLeave: 0,
  noStatus: 0
});

const loadStats = async () => {
  try {
    const res = await getEmployeeStats();
    Object.assign(statsData, res.data);
  } catch (error) {
    console.error('获取统计数据失败:', error);
    ElMessage.error('获取统计数据失败');
  }
};

const formRules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  nickName: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
  userName: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
  phonenumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  employeeType: [{ required: true, message: '请选择员工类型', trigger: 'change' }],
  statusType: [{ required: true, message: '请选择状态', trigger: 'change' }]
})
console.log('表单验证规则:', JSON.parse(JSON.stringify(formRules)))

const addFormRef = ref()

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

// 获取员工列表
const getList = async () => {
  loading.value = true
  try {
    const res = await listEmployee(queryParams.value)
    console.log('API响应数据:', res)
    
    // 处理分页格式的响应 { total, rows, code, msg }
    if (res && typeof res === 'object' && 'rows' in res) {
      employeeData.value = res.rows.map(item => ({
        ...item,
        checked: false
      }))
      pagination.total = res.total || 0
    } 
    // 处理其他可能的格式
    else if (Array.isArray(res)) {
      employeeData.value = res.map(item => ({
        ...item,
        checked: false
      }))
      pagination.total = res.length
    } 
    // 处理 { data } 格式
    else if (res?.data) {
      const data = Array.isArray(res.data) ? res.data : []
      employeeData.value = data.map(item => ({
        ...item,
        checked: false
      }))
      pagination.total = res.total || data.length
    }
    else {
      console.warn('意外的API响应格式:', res)
      employeeData.value = []
      pagination.total = 0
    }
    
  } catch (error) {
    console.error('获取员工列表失败:', error)
    ElMessage.error('获取员工列表失败: ' + (error as Error).message)
  } finally {
    loading.value = false
  }
}

// 搜索员工
const handleSearch = () => {
  clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(() => {
    queryParams.value = {
      ...queryParams.value,
      name: searchQuery.value,
      pageNum: 1 // 重置到第一页
    }
    getList() // 重新获取列表
  }, 300) // 300ms防抖延迟
}

// 打开添加员工弹窗
const handleAdd = () => {
  addForm.value = {
    avatar: '',
    name: '',
    deptId: undefined,
    position: '',
    phonenumber: '',
    employeeType: '',
    statusType: '',
    startDate: '',
    nickName: '',
    userName: ''
  }
  addDialogVisible.value = true
}

// 确认添加员工
const handleConfirmAdd = async () => {
  submitLoading.value = true;
  try {
    await addFormRef.value.validate();
    await addEmployee({
      ...addForm.value,
      nickName: addForm.value.nickName,
      userName: addForm.value.userName
    });
    
    ElMessage.success('添加成功');
    addDialogVisible.value = false;
    
    // 同时刷新列表和统计数据
    await Promise.all([
      getList(), 
      loadStats()  // 新增这行
    ]);
    
  } catch (error) {
    console.error('添加失败', error);
  } finally {
    submitLoading.value = false;
  }
};

// 编辑员工
const handleEdit = (row: SysEmployeeVO) => {
  router.push({
    path: '/system/employee/edit',
    query: {
      id: row.userId
    }
  })
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化手机号
const formatPhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 根据ID获取部门名称
const getDeptNameById = (id: number) => {
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

// 导入相关方法
const handleImport = () => {
  importDialogVisible.value = true
}

const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/path/to/template.xlsx'
  link.download = '员工花名册模板.xlsx'
  link.click()
}

const handleFileChange = (file: any) => {
  console.log('选择的文件:', file)
}

const triggerUpload = () => {
  document.querySelector('.upload-area .el-upload__input')?.click()
}

// 头像上传相关
const handleAvatarSuccess = (response: any, file: any) => {
  addForm.value.avatar = URL.createObjectURL(file.raw)
}

const beforeAvatarUpload = (file: any) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 初始化数据
onMounted(() => {
  getDeptList()
  getList()
  loadStats()
  // getEmployeeStats()
})
</script>

<style scoped>
.employee-management {
  padding: 20px;
  background-color: #f5f7fa;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.stats-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px 20px;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.stats-container {
  width: 100%;
  overflow-x: auto;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  min-width: 80px;
  flex: 1;
}

.stat-item .label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
  white-space: nowrap;
}

.stat-item .count {
  font-size: 16px;
  font-weight: bold;
}

.highlight .label {
  color: #409eff;
}

.highlight .count {
  color: #409eff;
}

.warning .label {
  color: #f56c6c;
}

.warning .count {
  color: #f56c6c;
}

.divider {
  height: 40px;
  margin: 0 4px;
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

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-icon {
  margin-left: 30px;
  cursor: pointer;
  color: #606266;
}
</style>