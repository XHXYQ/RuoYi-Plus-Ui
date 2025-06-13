<template>
  <div class="app-container">
   
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 统计卡片 -->


      <!-- 操作区域 -->
      <div class="action-section">
       
        
        <div class="action-buttons">
          <el-button type="primary">导出</el-button>
          <el-button type="primary">批量修改</el-button>
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
          <el-table-column prop="deptName" label="部门" min-width="120">
            <template #default="{ row }">
              {{ getDeptNameById(row.deptId) }}
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="入职时间" min-width="120">
            <template #default="{ row }">
              {{ formatDate(row.startDate) }}
            </template>
          </el-table-column>
          <template v-for="column in holidayColumns" :key="column.prop">
            <el-table-column 
              :prop="column.prop" 
              :label="column.label" 
              :min-width="column.minWidth"
            >
              <template #default="{ row }">
                {{ column.render ? column.render(row) : row[column.prop] }}
              </template>
            </el-table-column>
          </template>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>


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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  HomeFilled, Setting, Monitor, Menu, Document, 
  List, User as UserIcon, Search, Filter, Upload, 
  Setting as SettingIcon, Plus, User 
} from '@element-plus/icons-vue'
import { listDept } from '@/api/system/dept'
import { 
  listEmployee,
  addEmployee,
  SysEmployeeQuery,
  SysEmployeeForm,
  SysEmployeeVO,
  getEmployeeStats
} from '@/api/system/employee'
import { listHoliday, getHolidayScopeUsers } from '@/api/system/holiday'

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter()
const searchTimer = ref<number>() // 防抖计时器
const holidayRules = ref<any[]>([])
const holidayColumns = ref<any[]>([])

const userHolidays = ref<any[]>([])
const getHolidayRules = async () => {
  try {
    const res = await listHoliday({
      pageNum: 1,
      pageSize: 100
    })
    
    // 获取假期规则数据
    const holidays = res.data?.rows || res.rows || []
    
    // 并行获取每个假期规则的关联用户
    const holidaysWithUsers = await Promise.all(
      holidays.map(async holiday => {
        if (holiday.scopeType === '部门/人员') {
          try {
            const usersRes = await getHolidayScopeUsers(holiday.holidayId)
            holiday.selectedUserIds = usersRes.data.map(u => u.userId)
          } catch (error) {
            console.error(`获取假期${holiday.name}的关联用户失败:`, error)
            holiday.selectedUserIds = []
          }
        } else {
          holiday.selectedUserIds = []
        }
        return holiday
      })
    )
    
    holidayRules.value = holidaysWithUsers
    generateHolidayColumns()
  } catch (error) {
    console.error('获取假期规则失败:', error)
    ElMessage.error('获取假期规则失败')
  }
}

const generateHolidayColumns = () => {
  holidayColumns.value = holidayColumns.value.filter(col => !col.isHolidayColumn);
  
  holidayRules.value.forEach(rule => {
    holidayColumns.value.push({
      prop: `holiday_${rule.holidayId}`,
      label: rule.name,
      minWidth: 120,
      isHolidayColumn: true,
      render: (row) => {
        // 优先检查用户关联表中的余额类型
        const userHoliday = userHolidays.value.find(
          uh => uh.holidayId === rule.holidayId && uh.userId === row.userId
        );
        
        if (userHoliday?.balanceType) {
          return userHoliday.balanceType === '不限额' ? '不限制余额' : userHoliday.balanceType;
        }
        
        // 默认返回假期规则的余额类型
        return rule.balanceType === '不限额' ? '不限制余额' : rule.balanceType;
      }
    });
  });
}

const goBack = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.go(-1);
};

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
  pageSize: 10
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

// 统计卡片数据
const statsData = reactive({
  total: 18,
  fullTime: 12,
  partTime: 3,
  intern: 3,
  dispatch: 0,
  noType: 0,
  probation: 0,
  formal: 18,
  pendingLeave: 0,
  noStatus: 0
})

// 当前选中的统计项
const activeStat = ref('total')


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
// 修改getList方法，根据假期规则的应用范围过滤显示
const getList = async () => {
  loading.value = true
  try {
    const res = await listEmployee(queryParams.value)
    
    // 处理员工数据
    employeeData.value = res.rows.map(employee => {
      const employeeWithHolidays = {...employee}
      
      // 为每个假期规则处理显示
      holidayRules.value.forEach(holiday => {
        const holidayKey = `holiday_${holiday.holidayId}`
        
        // 判断是否显示该假期
        if (holiday.scopeType === '全公司' || 
            (holiday.scopeType === '部门/人员' && 
             holiday.selectedUserIds && 
             holiday.selectedUserIds.includes(employee.userId))) {
          employeeWithHolidays[holidayKey] = 
            holiday.balanceType === '不限额' ? '不限制余额' : holiday.balanceType
        } else {
          employeeWithHolidays[holidayKey] = '-'
        }
      })
      
      return employeeWithHolidays
    })
    
    pagination.total = res.total || 0
  } catch (error) {
    console.error('获取员工列表失败:', error)
    ElMessage.error('获取员工列表失败')
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
      pageNum: 1
    }
    getList()
  }, 300)
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
    getList();
    loadStats();
    
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

// 分页大小改变
const handleSizeChange = (val: number) => {
  queryParams.value.pageSize = val
  getList()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  queryParams.value.pageNum = val
  getList()
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
  return phone.replace()
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

// 获取员工类型对应的标签样式
const getEmployeeTypeTag = (type: string) => {
  switch(type) {
    case '全职': return ''
    case '兼职': return 'info'
    case '实习': return 'primary'
    case '劳务派遣': return 'warning'
    default: return 'info'
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getEmployeeStats();
    Object.assign(statsData, res.data);
  } catch (error) {
    console.error('获取统计数据失败:', error);
    ElMessage.error('获取统计数据失败');
  }
};

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
  getHolidayRules()
  
  window.addEventListener('holidayRulesUpdated', () => {
    getHolidayRules()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('holidayRulesUpdated', () => {})
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
}

.sidebar {
  width: 210px;
  background-color: #304156;
  color: #bfcbd9;
  height: 100vh;
  overflow-y: auto;
}

.logo {
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  background-color: #2b2f3a;
}

.el-menu-vertical {
  border-right: none;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  height: 100vh;
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
  cursor: pointer;
  transition: all 0.3s;
}

.stat-item:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-item.active {
  background-color: #ecf5ff;
}

.stat-item.active .label,
.stat-item.active .count {
  color: #409eff;
  font-weight: bold;
}

.stat-item.warning.active {
  background-color: #fef0f0;
}

.stat-item.warning.active .label,
.stat-item.warning.active .count {
  color: #f56c6c;
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