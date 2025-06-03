<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="申请人姓名" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入申请人姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="所在部门" prop="department">
              <el-input v-model="queryParams.department" placeholder="请输入所在部门" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="审批状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择审批状态" clearable>
                <el-option
                  v-for="dict in wf_business_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:application:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:application:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="regularApplicationList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="申请人姓名" align="center" prop="name" />
        <el-table-column label="所在部门" align="center" prop="department" />
        <el-table-column label="当前岗位" align="center" prop="position" />
        <el-table-column label="入职日期" align="center" prop="entryDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.entryDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="计划转正日期" align="center" prop="planRegularDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.planRegularDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审批状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="wf_business_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" icon="View" @click="handleView(scope.row)">查看</el-button>
            <el-button 
              v-if="scope.row.status === 'draft' || scope.row.status === 'back'" 
              size="small" 
              type="primary" 
              icon="Edit" 
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:application:edit']"
            >修改</el-button>
            <el-button 
              v-if="scope.row.status === 'draft' || scope.row.status === 'back'" 
              size="small" 
              type="danger" 
              icon="Delete" 
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:application:remove']"
            >删除</el-button>
            <el-button 
              v-if="scope.row.status === 'waiting'" 
              size="small" 
              type="warning" 
              icon="Notification" 
              @click="handleCancelProcessApply(scope.row.id)"
            >撤销</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="RegularApplication" lang="ts">
import { listRegularApplication, delRegularApplication } from '@/api/workflow/regularApplication';
import { cancelProcessApply } from '@/api/workflow/instance';
import { RegularApplicationVO, RegularApplicationQuery } from '@/api/workflow/regularApplication/types';
import { getCurrentInstance, ComponentInternalInstance, toRefs, reactive, ref, onMounted } from 'vue';
import { ElFormInstance } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_business_status } = toRefs<any>(proxy?.useDict('wf_business_status'));

const regularApplicationList = ref<RegularApplicationVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

interface PageData<T, U> {
  queryParams: U;
  [key: string]: any;
}

const data = reactive<PageData<any, RegularApplicationQuery>>({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    department: undefined,
    status: undefined
  }
});

const { queryParams } = toRefs(data);

/** 查询转正申请列表 */
const getList = async () => {
  loading.value = true;
  const res = await listRegularApplication(queryParams.value);
  regularApplicationList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: RegularApplicationVO[]) => {
  ids.value = selection.map(item => item.id);
}

/** 新增按钮操作 */
const handleAdd = () => {
  loading.value = false;
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/workflow/applicationEdit/index`,
    query: {
      type: 'add'
    }
  });
};

/** 修改按钮操作 */
const handleUpdate = (row?: RegularApplicationVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/workflow/application/applicationEdit`,
    query: {
      id: row?.id || ids.value[0],
      type: 'update'
    }
  });
}

/** 查看按钮操作 */
const handleView = (row?: RegularApplicationVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/workflow/application/applicationEdit`,
    query: {
      id: row?.id || ids.value[0],
      type: 'view'
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: RegularApplicationVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除转正申请编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delRegularApplication(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/regularApplication/export', {
    ...queryParams.value
  }, `regularApplication_${new Date().getTime()}.xlsx`)
}

/** 撤销流程申请 */
const handleCancelProcessApply = async (id: string) => {
  await proxy?.$modal.confirm('是否确认撤销当前转正申请？');
  loading.value = true;
  const data = {
    businessId: id,
    message: '申请人撤销流程！'
  };
  await cancelProcessApply(data).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('撤销成功');
}

onMounted(() => {
  getList();
});
</script>
