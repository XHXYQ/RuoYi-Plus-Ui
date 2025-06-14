<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="姓名" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入姓名"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="部门" prop="deptId">
            <el-select
              v-model="queryParams.deptId"
              placeholder="请选择部门"
              clearable
            >
              <el-option
                v-for="dept in deptOptions"
                :key="dept.deptId"
                :label="dept.deptName"
                :value="dept.deptId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
            >
              <el-option
                v-for="dict in wf_business_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="调岗日期" prop="startDate">
            <el-date-picker
              v-model="queryParams.startDate"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:transfer:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:transfer:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="transferList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="主键" align="center" prop="id" />
        <el-table-column prop="name" label="姓名" align="center">
          <template #default="{ row }">
            <div class="name-cell">
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deptoldName" label="原部门" align="center">
          <template #default="{ row }">
            {{ getDeptNameById(row.deptoldId) }}
          </template>
        </el-table-column>
        <el-table-column prop="position" label="原职位" align="center" />
        <el-table-column prop="positionRank" label="原职级" align="center" />
        <el-table-column prop="startDate" label="入职日期" align="center">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="转入部门" align="center">
          <template #default="{ row }">
            {{ getDeptNameById(row.deptId) }}
          </template>
        </el-table-column>
        <el-table-column prop="positionNew" label="转入职位" align="center" />
        <el-table-column prop="positionRanknew" label="转入职级" align="center" />
        <el-table-column prop="endDate" label="生效日期" align="center">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="调岗原因" align="center" prop="remark" />
        <el-table-column align="center" label="流程状态" min-width="70">
          <template #default="scope">
            <dict-tag :options="wf_business_status" :value="scope.row.status"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="162">
          <template #default="scope">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5" v-if="scope.row.status === 'draft' || scope.row.status === 'cancel' || scope.row.status === 'back'">
                <el-button v-hasPermi="['system:transfer:edit']" size="small" type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  >修改</el-button
                >
              </el-col>
              <el-col :span="1.5" v-if="scope.row.status === 'draft' || scope.row.status === 'cancel' || scope.row.status === 'back'">
                <el-button v-hasPermi="['system:transfer:remove']" size="small" type="primary" icon="Delete" @click="handleDelete(scope.row)"
                  >删除</el-button
                >
              </el-col>
            </el-row>
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" size="small" icon="View" @click="handleView(scope.row)">查看</el-button>
              </el-col>
              <el-col :span="1.5" v-if="scope.row.status === 'waiting'">
                <el-button size="small" type="primary" icon="Notification" @click="handleCancelProcessApply(scope.row.id)">撤销</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="Transfer" lang="ts">
import { delLeave, listLeave } from '@/api/system/transfer';
import { cancelProcessApply } from '@/api/workflow/instance';
import { TransferForm, TransferQuery, TransferVO } from '@/api/system/transfer/types';
import { listDept } from '@/api/system/dept'

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_business_status } = toRefs<any>(proxy?.useDict('wf_business_status'));
const transferList = ref<TransferVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const data = reactive<PageData<TransferForm, TransferQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    deptId: undefined,
    status: undefined,
    startDate: undefined
  },
  rules: {}
});

const { queryParams } = toRefs(data);

const deptOptions = ref([])

const getDeptList = async () => {
  try {
    const res = await listDept()
    deptOptions.value = res.data || []
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
  }
}

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

/** 查询调岗列表 */
const getList = async () => {
  loading.value = true;
  const res = await listLeave(queryParams.value);
  transferList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: TransferVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/system/transferEdit/index`,
    query: {
      type: 'add'
    }
  });
};

/** 修改按钮操作 */
const handleUpdate = (row?: TransferVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/system/transferEdit/index`,
    query: {
      id: row.id,
      type: 'update'
    }
  });
};

/** 查看按钮操作 */
const handleView = (row?: TransferVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/system/transferEdit/index`,
    query: {
      id: row.id,
      type: 'view'
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: TransferVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除调岗编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delLeave(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/transfer/export',
    {
      ...queryParams.value
    },
    `transfer_${new Date().getTime()}.xlsx`
  );
};

/** 撤销按钮操作 */
const handleCancelProcessApply = async (id: string) => {
  await proxy?.$modal.confirm('是否确认撤销当前单据？');
  loading.value = true;
  let data = {
    businessId: id,
    message: '申请人撤销流程！'
  };
  await cancelProcessApply(data).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('撤销成功');
};

onMounted(() => {
  getList();
  getDeptList();
});
</script>