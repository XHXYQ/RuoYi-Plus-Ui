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
            <el-form-item label="当前岗位" prop="position">
              <el-input v-model="queryParams.position" placeholder="请输入当前岗位" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="入职日期" prop="entryDate">
              <el-date-picker clearable
                v-model="queryParams.entryDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择入职日期"
              />
            </el-form-item>
            <el-form-item label="试用期" prop="probationPeriod">
              <el-input v-model="queryParams.probationPeriod" placeholder="请输入试用期" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="计划转正日期" prop="planRegularDate">
              <el-date-picker clearable
                v-model="queryParams.planRegularDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择计划转正日期"
              />
            </el-form-item>
            <el-form-item label="实际转正日期" prop="actualRegularDate">
              <el-date-picker clearable
                v-model="queryParams.actualRegularDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择实际转正日期"
              />
            </el-form-item>
            <el-form-item label="关联的流程实例ID" prop="flowInstanceId">
              <el-input v-model="queryParams.flowInstanceId" placeholder="请输入关联的流程实例ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="审批意见" prop="approvalOpinion">
              <el-input v-model="queryParams.approvalOpinion" placeholder="请输入审批意见" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="附件地址" prop="fileUrl">
              <el-input v-model="queryParams.fileUrl" placeholder="请输入附件地址" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:regularApplication:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:regularApplication:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:regularApplication:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:regularApplication:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="regularApplicationList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="true" />
        <el-table-column label="申请人姓名" align="center" prop="name" />
        <el-table-column label="所在部门" align="center" prop="department" />
        <el-table-column label="当前岗位" align="center" prop="position" />
        <el-table-column label="员工类型" align="center" prop="employeeType" />
        <el-table-column label="入职日期" align="center" prop="entryDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.entryDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="试用期" align="center" prop="probationPeriod" />
        <el-table-column label="计划转正日期" align="center" prop="planRegularDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.planRegularDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实际转正日期" align="center" prop="actualRegularDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.actualRegularDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审批状态" align="center" prop="approvalStatus" />
        <el-table-column label="关联的流程实例ID" align="center" prop="flowInstanceId" />
        <el-table-column label="审批意见" align="center" prop="approvalOpinion" />
        <el-table-column label="附件地址" align="center" prop="fileUrl" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:regularApplication:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:regularApplication:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改转正申请对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="regularApplicationFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="申请人姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入申请人姓名" />
        </el-form-item>
        <el-form-item label="所在部门" prop="department">
          <el-input v-model="form.department" placeholder="请输入所在部门" />
        </el-form-item>
        <el-form-item label="当前岗位" prop="position">
          <el-input v-model="form.position" placeholder="请输入当前岗位" />
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker clearable
            v-model="form.entryDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择入职日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="试用期" prop="probationPeriod">
          <el-input v-model="form.probationPeriod" placeholder="请输入试用期" />
        </el-form-item>
        <el-form-item label="计划转正日期" prop="planRegularDate">
          <el-date-picker clearable
            v-model="form.planRegularDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择计划转正日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际转正日期" prop="actualRegularDate">
          <el-date-picker clearable
            v-model="form.actualRegularDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择实际转正日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="关联的流程实例ID" prop="flowInstanceId">
          <el-input v-model="form.flowInstanceId" placeholder="请输入关联的流程实例ID" />
        </el-form-item>
        <el-form-item label="审批意见" prop="approvalOpinion">
            <el-input v-model="form.approvalOpinion" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="附件地址" prop="fileUrl">
          <el-input v-model="form.fileUrl" placeholder="请输入附件地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RegularApplication" lang="ts">
import { listRegularApplication, getRegularApplication, delRegularApplication, addRegularApplication, updateRegularApplication } from '@/api/workflow/regularApplication';
import { RegularApplicationVO, RegularApplicationQuery, RegularApplicationForm } from '@/api/workflow/regularApplication/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const regularApplicationList = ref<RegularApplicationVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const regularApplicationFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RegularApplicationForm = {
  id: undefined,
  name: undefined,
  department: undefined,
  position: undefined,
  employeeType: undefined,
  entryDate: undefined,
  probationPeriod: undefined,
  planRegularDate: undefined,
  actualRegularDate: undefined,
  approvalStatus: undefined,
  flowInstanceId: undefined,
  approvalOpinion: undefined,
  fileUrl: undefined,
}
const data = reactive<PageData<RegularApplicationForm, RegularApplicationQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    department: undefined,
    position: undefined,
    employeeType: undefined,
    entryDate: undefined,
    probationPeriod: undefined,
    planRegularDate: undefined,
    actualRegularDate: undefined,
    approvalStatus: undefined,
    flowInstanceId: undefined,
    approvalOpinion: undefined,
    fileUrl: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键ID不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "申请人姓名不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询转正申请列表 */
const getList = async () => {
  loading.value = true;
  const res = await listRegularApplication(queryParams.value);
  regularApplicationList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  regularApplicationFormRef.value?.resetFields();
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
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加转正申请";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: RegularApplicationVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getRegularApplication(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改转正申请";
}

/** 提交按钮 */
const submitForm = () => {
  regularApplicationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateRegularApplication(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addRegularApplication(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
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
