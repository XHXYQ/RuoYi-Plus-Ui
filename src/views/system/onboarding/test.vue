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
              <el-select v-model="queryParams.registrationSubmitted" placeholder="入职登记表是否提交" clearable>
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="queryParams.certificationFlag" placeholder="实人认证" clearable>
                <el-option label="已认证" :value="1" />
                <el-option label="未认证" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="queryParams.source" placeholder="选择来源" clearable>
                <el-option label="内推" value="内推" />
                <el-option label="招聘网站" value="招聘网站" />
                <el-option label="校园招聘" value="校园招聘" />
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
        <el-table-column type="selection" width="50" />
        <el-table-column label="姓名" prop="userName" align="center" />
        <el-table-column label="部门" prop="deptName" align="center" />
        <el-table-column label="职位" prop="postName" align="center" />
        <el-table-column label="入职登记表" prop="registrationForm" align="center">
          <template #default="scope">
            <span>{{ scope.row.registrationForm ? '已提交' : '未提交' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实人认证" prop="certificationFlag" align="center">
          <template #default="scope">
            <span>{{ scope.row.certificationFlag === 1 ? '已认证' : '未认证' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预计入职日期" prop="expectedDate" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.expectedDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源" prop="source" align="center" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button type="primary" text @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button type="danger" text @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="onboardingFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="预计入职日期" prop="expectedDate">
          <el-date-picker v-model="form.expectedDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择入职日期" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="form.deptId"
            :data="deptOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            placeholder="请选择部门"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="职位" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入职位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="buttonLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, toRefs, getCurrentInstance } from 'vue';
import { listOnboarding, getOnboarding, delOnboarding, addOnboarding, updateOnboarding } from '@/api/system/onboarding';
import api from '@/api/system/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const onboardingList = ref([]);
const buttonLoading = ref(false);
const loading = ref(true);
const total = ref(0);
const deptOptions = ref([]);

const queryFormRef = ref();
const onboardingFormRef = ref();

const dialog = reactive({
  visible: false,
  title: ''
});

const initFormData = {
  onboardingId: undefined,
  userName: '',
  phonenumber: '',
  expectedDate: '',
  deptId: undefined,
  postName: '',
  registrationForm: '',
  certificationFlag: undefined,
  source: ''
};

const data = reactive({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: '',
    expectedDate: '',
    registrationSubmitted: undefined,
    certificationFlag: undefined,
    source: ''
  },
  rules: {
    userName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phonenumber: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
    expectedDate: [{ required: true, message: '请选择预计入职日期', trigger: 'change' }],
    deptId: [{ required: true, message: '请选择部门', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  const res = await listOnboarding(queryParams.value);
  onboardingList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const getTreeSelect = async () => {
  const res = await api.deptTreeSelect();
  deptOptions.value = res.data;
};

const handleAdd = () => {
  Object.assign(form.value, initFormData);
  dialog.title = '办理入职';
  dialog.visible = true;
};

const handleUpdate = async (row) => {
  const res = await getOnboarding(row.onboardingId);
  Object.assign(form.value, res.data);
  dialog.title = '编辑入职信息';
  dialog.visible = true;
};

const submitForm = () => {
  onboardingFormRef.value?.validate(async (valid) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.onboardingId) {
        await updateOnboarding(form.value);
      } else {
        await addOnboarding(form.value);
      }
      buttonLoading.value = false;
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      getList();
    }
  });
};

const handleDelete = async (row) => {
  await proxy?.$modal.confirm(`确认删除 ${row.userName} 的入职记录吗？`);
  await delOnboarding(row.onboardingId);
  proxy?.$modal.msgSuccess('删除成功');
  getList();
};

const cancel = () => {
  dialog.visible = false;
};

const handleSelectionChange = () => {};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

onMounted(() => {
  getTreeSelect();
  getList();
});
</script>
