<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="唯一业务编号" prop="code">
              <el-input v-model="queryParams.code" placeholder="请输入唯一业务编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="部门/团队名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入部门/团队名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="成员人数" prop="employeeCount">
              <el-input v-model="queryParams.employeeCount" placeholder="请输入成员人数" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="主管姓名" prop="manager">
              <el-input v-model="queryParams.manager" placeholder="请输入主管姓名" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:organization:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:organization:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:organization:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:organization:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="organizationList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="true" />
        <el-table-column label="唯一业务编号" align="center" prop="code" />
        <el-table-column label="部门/团队名称" align="center" prop="name" />
        <el-table-column label="成员人数" align="center" prop="employeeCount" />
        <el-table-column label="类型" align="center" prop="type" />
        <el-table-column label="主管姓名" align="center" prop="manager" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:organization:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:organization:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改公司组织管理对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="organizationFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="唯一业务编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入唯一业务编号" />
        </el-form-item>
        <el-form-item label="部门/团队名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门/团队名称" />
        </el-form-item>
        <el-form-item label="成员人数" prop="employeeCount">
          <el-input v-model="form.employeeCount" placeholder="请输入成员人数" />
        </el-form-item>
        <el-form-item label="主管姓名" prop="manager">
          <el-input v-model="form.manager" placeholder="请输入主管姓名" />
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

<script setup name="Organization" lang="ts">
import { listOrganization, getOrganization, delOrganization, addOrganization, updateOrganization } from '@/api/system/organization';
import { OrganizationVO, OrganizationQuery, OrganizationForm } from '@/api/system/organization/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const organizationList = ref<OrganizationVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const organizationFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: OrganizationForm = {
  id: undefined,
  code: undefined,
  name: undefined,
  employeeCount: undefined,
  type: undefined,
  manager: undefined,
}
const data = reactive<PageData<OrganizationForm, OrganizationQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    code: undefined,
    name: undefined,
    employeeCount: undefined,
    type: undefined,
    manager: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键ID不能为空", trigger: "blur" }
    ],
    code: [
      { required: true, message: "唯一业务编号不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "部门/团队名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询公司组织管理列表 */
const getList = async () => {
  loading.value = true;
  const res = await listOrganization(queryParams.value);
  organizationList.value = res.rows;
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
  organizationFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: OrganizationVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加公司组织管理";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: OrganizationVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getOrganization(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改公司组织管理";
}

/** 提交按钮 */
const submitForm = () => {
  organizationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateOrganization(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addOrganization(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: OrganizationVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除公司组织管理编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delOrganization(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/organization/export', {
    ...queryParams.value
  }, `organization_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
