<template>
  <div class="p-2">
    <el-card shadow="never">
      <div style="display: flex; justify-content: space-between">
        <div>
          <el-button v-if="submitButtonShow" :loading="buttonLoading" type="info" @click="submitForm('draft')">暂存</el-button>
          <el-button v-if="submitButtonShow" :loading="buttonLoading" type="primary" @click="submitForm('submit')">提 交</el-button>
          <el-button v-if="approvalButtonShow" :loading="buttonLoading" type="primary" @click="approvalVerifyOpen">审批</el-button>
          <el-button v-if="form && form.id && form.status !== 'draft'" type="primary" @click="handleApprovalRecord">流程进度</el-button>
        </div>
        <div>
          <el-button style="float: right" @click="goBack()">返回</el-button>
        </div>
      </div>
    </el-card>
    <el-card shadow="never" style="height: 78vh; overflow-y: auto">
      <el-form ref="transferFormRef" v-loading="loading" :disabled="routeParams.type === 'view'" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="入职时间" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择入职日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="原部门" prop="deptoldId">
          <el-tree-select
            v-model="form.deptoldId"
            :data="deptOptions"
            :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
            placeholder="原部门"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="原职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入原职位" />
        </el-form-item>
        <el-form-item label="原职级" prop="positionRank">
          <el-input v-model="form.positionRank" placeholder="请输入原岗位职级" />
        </el-form-item>
        <el-form-item label="转入部门" prop="deptId">
          <el-tree-select
            v-model="form.deptId"
            :data="deptOptions"
            :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
            placeholder="部门"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="转入职位" prop="positionNew">
          <el-input v-model="form.positionNew" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="新职级" prop="positionRanknew">
          <el-input v-model="form.positionRanknew" placeholder="请输入新岗位职级" />
        </el-form-item>
        <el-form-item label="生效日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择生效日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="调岗原因" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入调岗原因" />
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 提交组件 -->
    <submitVerify ref="submitVerifyRef" :task-variables="taskVariables" @submit-callback="submitCallback" />
    <!-- 审批记录 -->
    <approvalRecord ref="approvalRecordRef" />
    <el-dialog v-model="dialogVisible.visible" :title="dialogVisible.title" :before-close="handleClose" width="500">
      <el-select v-model="flowCode" placeholder="请选择流程" style="width: 240px">
        <el-option v-for="item in flowCodeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="submitFlow()"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TransferEdit" lang="ts">
import { addLeave, getLeave, updateLeave } from '@/api/system/transfer';
import { TransferForm, TransferQuery, TransferVO } from '@/api/system/transfer/types';
import { startWorkFlow } from '@/api/workflow/task';
import SubmitVerify from '@/components/Process/submitVerify.vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
import { AxiosResponse } from 'axios';
import { StartProcessBo } from '@/api/workflow/workflowCommon/types';
import { listDept } from '@/api/system/dept'

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const buttonLoading = ref(false);
const loading = ref(true);

//路由参数
const routeParams = ref<Record<string, any>>({});

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

const flowCodeOptions = [
  {
    value: 'transfer1',
    label: '调岗申请流程-普通'
  }
];

const flowCode = ref<string>('');

const dialogVisible = reactive<DialogOption>({
  visible: false,
  title: '流程定义'
});

//提交组件
const submitVerifyRef = ref<InstanceType<typeof SubmitVerify>>();
//审批记录组件
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>();

const transferFormRef = ref<ElFormInstance>();

const submitFormData = ref<StartProcessBo>({
  businessId: '',
  flowCode: '',
  variables: {}
});
const taskVariables = ref<Record<string, any>>({});

const initFormData: TransferForm = {
  id: undefined,
  name: '',
  startDate: '',
  deptoldId: undefined,
  position: '',
  positionRank: '',
  deptId: undefined,
  positionNew: '',
  positionRanknew: '',
  endDate: '',
  remark: '',
  status: undefined
};

const data = reactive<PageData<TransferForm, TransferQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10
  },
  rules: {
    name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
    startDate: [{ required: true, message: '入职日期不能为空', trigger: 'blur' }],
    deptoldId: [{ required: true, message: '原部门不能为空', trigger: 'blur' }],
    position: [{ required: true, message: '原职位不能为空', trigger: 'blur' }],
    deptId: [{ required: true, message: '转入部门不能为空', trigger: 'blur' }],
    positionNew: [{ required: true, message: '转入职位不能为空', trigger: 'blur' }],
    endDate: [{ required: true, message: '生效日期不能为空', trigger: 'blur' }],
    remark: [{ required: true, message: '调岗原因不能为空', trigger: 'blur' }]
  }
});

const handleClose = () => {
  dialogVisible.visible = false;
  flowCode.value = '';
  buttonLoading.value = false;
};

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  transferFormRef.value?.resetFields();
};

/** 获取详情 */
const getInfo = () => {
  loading.value = true;
  buttonLoading.value = false;
  nextTick(async () => {
    const res = await getLeave(routeParams.value.id);
    Object.assign(form.value, res.data);
    loading.value = false;
    buttonLoading.value = false;
  });
};

/** 提交按钮 */
const submitForm = (status: string) => {
  transferFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      
      let res: AxiosResponse<TransferVO>;
      if (form.value.id) {
        res = await updateLeave(form.value);
      } else {
        res = await addLeave(form.value);
      }
      
      form.value = res.data;
      
      if (status === 'draft') {
        buttonLoading.value = false;
        proxy?.$modal.msgSuccess('暂存成功');
        proxy.$tab.closePage(proxy.$route);
        proxy.$router.go(-1);
      } else {
        if ((form.value.status === 'draft' && (flowCode.value === '' || flowCode.value === null)) || routeParams.value.type === 'add') {
          flowCode.value = flowCodeOptions[0].value;
          dialogVisible.visible = true;
          return;
        }
        if (flowCode.value === '' || flowCode.value === null) {
          flowCode.value = 'transfer';
        }
        await handleStartWorkFlow(res.data);
      }
    }
  });
};

const submitFlow = async () => {
  handleStartWorkFlow(form.value);
  dialogVisible.visible = false;
};

//提交申请
const handleStartWorkFlow = async (data: TransferForm) => {
  try {
    submitFormData.value.flowCode = flowCode.value;
    submitFormData.value.businessId = data.id;
    //流程变量
    taskVariables.value = {
      name: data.name,
      deptoldId: data.deptoldId,
      position: data.position,
      deptId: data.deptId,
      positionNew: data.positionNew,
      endDate: data.endDate,
      remark: data.remark
    };
    submitFormData.value.variables = taskVariables.value;
    const resp = await startWorkFlow(submitFormData.value);
    if (submitVerifyRef.value) {
      buttonLoading.value = false;
      submitVerifyRef.value.openDialog(resp.data.taskId);
    }
  } finally {
    buttonLoading.value = false;
  }
};

//审批记录
const handleApprovalRecord = () => {
  approvalRecordRef.value.init(form.value.id);
};

//提交回调
const submitCallback = async () => {
  await proxy.$tab.closePage(proxy.$route);
  proxy.$router.go(-1);
};

//返回
const goBack = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.go(-1);
};

//审批
const approvalVerifyOpen = async () => {
  submitVerifyRef.value.openDialog(routeParams.value.taskId);
};

//校验提交按钮是否显示
const submitButtonShow = computed(() => {
  return (
    routeParams.value.type === 'add' ||
    (routeParams.value.type === 'update' &&
      form.value.status &&
      (form.value.status === 'draft' || form.value.status === 'cancel' || form.value.status === 'back'))
  );
});

//校验审批按钮是否显示
const approvalButtonShow = computed(() => {
  return routeParams.value.type === 'approval' && form.value.status && form.value.status === 'waiting';
});

onMounted(() => {
  getDeptList();
  nextTick(async () => {
    routeParams.value = proxy.$route.query;
    reset();
    loading.value = false;
    if (routeParams.value.type === 'update' || routeParams.value.type === 'view' || routeParams.value.type === 'approval') {
      getInfo();
    }
  });
});
</script>