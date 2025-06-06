<template>
  <div class="resign-management">
    <!-- 搜索和操作区域 -->
    <div class="action-section">
      <div class="filter-area">
        <el-input
          v-model="queryParams.name"
          placeholder="搜索员工姓名"
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
          v-model="queryParams.deptId"
          placeholder="选择部门"
          clearable
          style="width: 200px; margin-left: 10px"
          @change="handleDeptChange"
        >
          <el-option
            v-for="dept in deptOptions"
            :key="dept.deptId"
            :label="dept.deptName"
            :value="dept.deptId"
          />
        </el-select>

        <el-date-picker
          v-model="queryParams.endDate"
          type="date"
          placeholder="选择离职日期"
          value-format="YYYY-MM-DD"
          style="width: 200px; margin-left: 10px"
        />
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" plain @click="handleExport">导出</el-button>
        <el-button v-hasPermi="['system:resign:add']" type="primary"  @click="handleAdd">办理离职</el-button>
      </div>
    </div>

    <!-- 离职员工表格 -->
    <div class="resign-table">
      <el-table 
        :data="tableData" 
        style="width: 100%"
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        
        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="{ row }">
            <div class="name-cell">
              <div class="rect-avatar">
                <el-icon><User /></el-icon>
              </div>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="部门" min-width="120" />
        <el-table-column prop="position" label="职位" min-width="120" />
        <el-table-column prop="employeeType" label="员工类型" min-width="120" />
        <el-table-column prop="startDate" label="入职时间" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="预计离职日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="离职原因" min-width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="handleConfirmResign(row)">确认离职</el-button>
            <el-button type="text" @click="handleCancelResign(row)">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 办理离职弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select
            v-model="formData.deptId"
            placeholder="选择部门"
            style="width: 100%"
          >
            <el-option
              v-for="dept in deptOptions"
              :key="dept.deptId"
              :label="dept.deptName"
              :value="dept.deptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="员工类型" prop="employeeType">
          <el-select v-model="formData.employeeType" placeholder="请选择员工类型" style="width: 100%">
            <el-option label="全职" value="全职" />
            <el-option label="兼职" value="兼职" />
            <el-option label="实习" value="实习" />
            <el-option label="劳务派遣" value="劳务派遣" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职时间" prop="startDate">
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            placeholder="选择入职日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预计离职时间" prop="endDate">
          <el-date-picker
            v-model="formData.endDate"
            type="date"
            placeholder="选择预计离职日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="离职原因" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入离职原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User } from '@element-plus/icons-vue'
import { 
  pageResign, 
  addResign, 
  updateResign, 
  delResign
} from '@/api/system/resign'
import { listDept } from '@/api/system/dept'
import type { SysResignQuery, SysResignForm, SysResignVO } from '@/api/system/resign/types'

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 查询参数
const queryParams = reactive<SysResignQuery>({
  pageNum: 1,
  pageSize: 10,
  name: '',
  deptId: undefined,
  endDate: ''
})

// 表格数据
const tableData = ref<SysResignVO[]>([])
const total = ref(0)
const loading = ref(false)
const multipleSelection = ref<SysResignVO[]>([])

// 部门选项
const deptOptions = ref<any[]>([])

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)

// 表单数据
const formData = reactive<SysResignForm>({
  userId: undefined,
  name: '',
  deptId: undefined,
  position: '',
  employeeType: '',
  startDate: '',
  endDate: '',
  remark: '',
  status: undefined,
})

// 表单验证
const formRules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  employeeType: [{ required: true, message: '请选择员工类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择入职时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择预计离职时间', trigger: 'change' }]
})

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

// 添加部门选择变化处理函数
const handleDeptChange = (deptId: string | number) => {
  queryParams.deptId = deptId;
  queryParams.pageNum = 1; // 重置到第一页
  getList(); // 重新获取数据
};

// 获取离职员工列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await pageResign(queryParams);
    if (res.code === 0 || res.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
      
      // 如果选择了部门，确保表格中只显示该部门的员工
      if (queryParams.deptId) {
        tableData.value = tableData.value.filter(
          item => item.deptId === queryParams.deptId
        );
      }
    } else {
      ElMessage.error(res.msg || '数据获取失败');
    }
  } catch (error) {
    console.error('接口请求异常:', error);
    ElMessage.error('请求失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1
  getList()
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
}

// 表格多选
const handleSelectionChange = (val: SysResignVO[]) => {
  multipleSelection.value = val
}

// 打开添加弹窗
const handleAdd = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/system/resignEdit/index`,
    query: {
      type: 'add'
    }
  });
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    userId: undefined,
    name: '',
    deptId: undefined,
    position: '',
    employeeType: '',
    startDate: '',
    endDate: '',
    remark: ''
  })
}

const formRef = ref<FormInstance>()
// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate() // 确保先通过前端验证
    submitLoading.value = true
    
    const res = formData.userId 
      ? await updateResign(formData)
      : await addResign(formData)
    
    // 明确判断成功状态码（根据您的后端约定）
    if ([200, 0].includes(res.code)) {
      ElMessage.success(res.msg || '操作成功')
      dialogVisible.value = false
      getList()
    } else {
      throw new Error(res.msg || '操作失败')
    }
  } catch (error: any) {
    // 更友好的错误提示
    const msg = error.response?.data?.msg || error.message
    ElMessage.error(msg || '操作失败，请检查数据')
  } finally {
    submitLoading.value = false
  }
}

// 确认离职
const handleConfirmResign = (row: SysResignVO) => {
  ElMessageBox.confirm('确认该员工已离职?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 这里调用确认离职的API
    ElMessage.success('操作成功')
    getList()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 撤销离职
const handleCancelResign = (row: SysResignVO) => {
  ElMessageBox.confirm('确认撤销该员工的离职申请?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 这里调用撤销离职的API
    ElMessage.success('操作成功')
    getList()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 导出
const handleExport = async () => {
  try {
    await exportResign(queryParams)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

// 初始化
onMounted(() => {
  getDeptList()
  getList()
})
</script>

<style scoped>
.resign-management {
  padding: 20px;
  background-color: #f5f7fa;
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
  width: 300px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resign-table {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rect-avatar {
  height: 30px;
  width: 30px;
  border-radius: 4px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.rect-avatar .el-icon {
  font-size: 16px;
  color: #909399;
}
</style>