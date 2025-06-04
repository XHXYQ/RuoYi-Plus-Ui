<template>
  <div class="p-4">
    <el-card shadow="never" class="mb-4">
      <el-row :gutter="10" justify="space-between" align="middle">
        <el-col :span="20">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item>
              <el-input v-model="queryParams.userName" placeholder="搜索员工" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-date-picker v-model="queryParams.expectedDate" type="date" placeholder="预计入职日期" value-format="YYYY-MM-DD" clearable />
            </el-form-item>
            <el-form-item>
              <el-select v-model="queryParams.certificationFlag" placeholder="认证状态" clearable>
                <el-option label="已认证" :value="1" />
                <el-option label="未认证" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" class="text-right">
          <el-button type="primary" @click="handleAdd">办理入职</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="onboardingList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="姓名" align="center" prop="userName" />
        <el-table-column label="部门" align="center">
          <template #default="scope">
            <span>{{ getDeptNameById(scope.row.deptId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="职位" align="center" prop="postId" />
        <el-table-column label="预计入职日期" align="center" prop="expectedDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.expectedDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="来源" align="center" prop="source" />
        <el-table-column label="认证状态" align="center" prop="certificationFlag">
          <template #default="scope">
            <span>{{ scope.row.certificationFlag === 1 ? '已认证' : '未认证' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="登记表" align="center" prop="registrationForm">
          <template #default="scope">
            <span>{{ scope.row.registrationForm ? '已提交' : '未提交' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:onboarding:edit']"></el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:onboarding:remove']"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="onboardingFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="预计入职日期" prop="expectedDate">
          <el-date-picker v-model="form.expectedDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择预计入职日期" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="form.deptId"
            :data="deptOptions"
            :props="treeProps"
            placeholder="请选择部门"
            check-strictly
            node-key="deptId"
            default-expand-all
          />
        </el-form-item>
        <el-form-item label="职位" prop="postId">
          <el-input v-model="form.postId" placeholder="请输入入职职位ID" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="buttonLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Onboarding" lang="ts">
import { listOnboarding, getOnboarding, delOnboarding, addOnboarding, updateOnboarding } from '@/api/system/onboarding';
import { OnboardingVO, OnboardingQuery, OnboardingForm } from '@/api/system/onboarding/types';
import api from '@/api/system/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const onboardingList = ref<OnboardingVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const onboardingFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: OnboardingForm = {
  onboardingId: undefined,
  userId: undefined,
  userName: undefined,
  deptId: undefined,
  postId: undefined,
  expectedDate: undefined,
  actualDate: undefined,
  probationMonths: undefined,
  salary: undefined,
  contractStart: undefined,
  contractEnd: undefined,
  source: undefined,
  status: undefined,
  certificationFlag: undefined,
  registrationForm: undefined,
  remark: undefined,
}
const data = reactive<PageData<OnboardingForm, OnboardingQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    userName: undefined,
    deptId: undefined,
    postId: undefined,
    expectedDate: undefined,
    actualDate: undefined,
    probationMonths: undefined,
    salary: undefined,
    contractStart: undefined,
    contractEnd: undefined,
    source: undefined,
    status: undefined,
    certificationFlag: undefined,
    registrationForm: undefined,
    params: {
    }
  },
  rules: {
    onboardingId: [
      { required: true, message: "入职记录ID不能为空", trigger: "blur" }
    ],
    userId: [
      { required: true, message: "用户ID不能为空", trigger: "blur" }
    ],
    deptId: [
      { required: true, message: "入职部门ID不能为空", trigger: "blur" }
    ],
    postId: [
      { required: true, message: "入职职位ID不能为空", trigger: "blur" }
    ],
    expectedDate: [
      { required: true, message: "预计入职日期不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询员工入职申请列表 */
const getList = async () => {
  loading.value = true;
  const res = await listOnboarding(queryParams.value);
  onboardingList.value = res.rows;
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
  onboardingFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: OnboardingVO[]) => {
  ids.value = selection.map(item => item.onboardingId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加员工入职申请";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: OnboardingVO) => {
  reset();
  const _onboardingId = row?.onboardingId || ids.value[0]
  const res = await getOnboarding(_onboardingId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改员工入职申请";
}

/** 提交按钮 */
const submitForm = () => {
  onboardingFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.onboardingId) {
        await updateOnboarding(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addOnboarding(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: OnboardingVO) => {
  const _onboardingIds = row?.onboardingId || ids.value;
  await proxy?.$modal.confirm('是否确认删除员工入职申请编号为"' + _onboardingIds + '"的数据项？').finally(() => loading.value = false);
  await delOnboarding(_onboardingIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/onboarding/export', {
    ...queryParams.value
  }, `onboarding_${new Date().getTime()}.xlsx`)
}

const deptOptions = ref([]);

const treeProps = {
  value: 'deptId',
  label: 'deptName',
  children: 'children',
};

const deptMap = ref<Record<string, string>>({});

const getTreeSelect = async () => {
  const res = await api.deptTreeSelect();
  const normalize = (nodes) => {
    return nodes.map(node => {
      const item = {
        ...node,
        deptId: node.deptId ?? node.id,
        deptName: node.deptName ?? node.label,
        children: node.children ? normalize(node.children) : []
      };
      return item;
    });
  };
  deptOptions.value = normalize(res.data || []);
  const flatten = (list: any[]) => list.flatMap(item => [item, ...(item.children ? flatten(item.children) : [])]);
  deptMap.value = Object.fromEntries(flatten(deptOptions.value).map(item => [item.deptId, item.deptName]));
};

const getDeptNameById = (id: string | number) => {
  return deptMap.value?.[id] || id;
};
onMounted(() => {
  getTreeSelect();
  getList();
});
</script>
