<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="外出天数" prop="startLeaveDay">
            <el-input v-model="queryParams.startLeaveDay" placeholder="请输入外出天数" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item prop="endLeaveDay"> 至 </el-form-item>
          <el-form-item prop="endLeaveDay">
            <el-input v-model="queryParams.endLeaveDay" placeholder="请输入外出天数" clearable @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['workflow:outgoing:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['workflow:outgoing:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="outgoingList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="主键" align="center" prop="id" />
        <el-table-column label="申请人" align="center" prop="applicant" />
        <el-table-column label="开始时间" align="center" prop="startTime">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="endTime">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="外出天数" align="center" prop="leaveDay" />
        <el-table-column label="外出原因" align="center" prop="remark" />
        <el-table-column align="center" label="流程状态" min-width="70">
          <template #default="scope">
            <dict-tag :options="wf_business_status" :value="scope.row.status"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="162">
          <template #default="scope">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5" v-if="scope.row.status === 'draft' || scope.row.status === 'cancel' || scope.row.status === 'back'">
                <el-button v-hasPermi="['workflow:outgoing:edit']" size="small" type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  >修改</el-button
                >
              </el-col>
              <el-col :span="1.5" v-if="scope.row.status === 'draft' || scope.row.status === 'cancel' || scope.row.status === 'back'">
                <el-button v-hasPermi="['workflow:outgoing:remove']" size="small" type="primary" icon="Delete" @click="handleDelete(scope.row)"
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

<script setup name="Outgoing" lang="ts">
import { delOutgoing, listOutgoing } from '@/api/workflow/outgoing';
import { cancelProcessApply } from '@/api/workflow/instance';
import { OutgoingForm, OutgoingQuery, OutgoingVO } from '@/api/workflow/outgoing/types';
import { getCurrentInstance, ComponentInternalInstance, toRefs, reactive, ref, onMounted } from 'vue';
import { ElFormInstance } from 'element-plus';

// 解决 PageData 报错问题
interface PageData<T, U> {
  form: T;
  queryParams: U;
  rules: any;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_business_status } = toRefs<any>(proxy?.useDict('wf_business_status'));
const outgoingList = ref<OutgoingVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const data = reactive<PageData<OutgoingForm, OutgoingQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    startLeaveDay: undefined,
    endLeaveDay: undefined
  },
  rules: {}
});

const { queryParams } = toRefs(data);

/** 查询外出申请列表 */
const getList = async () => {
  loading.value = true;
  const res = await listOutgoing(queryParams.value);
  outgoingList.value = res.rows;
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
const handleSelectionChange = (selection: OutgoingVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/workflow/outgoingEdit/index`,
    query: {
      type: 'add'
    }
  });
};

/** 修改按钮操作 */
const handleUpdate = (row?: OutgoingVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/workflow/outgoingEdit/index`,
    query: {
      id: row.id,
      type: 'update'
    }
  });
};

/** 查看按钮操作 */
const handleView = (row?: OutgoingVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/workflow/outgoingEdit/index`,
    query: {
      id: row.id,
      type: 'view'
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: OutgoingVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除外出申请编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delOutgoing(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'workflow/outgoing/export',
    {
      ...queryParams.value
    },
    `outgoing_${new Date().getTime()}.xlsx`
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
});
</script>
