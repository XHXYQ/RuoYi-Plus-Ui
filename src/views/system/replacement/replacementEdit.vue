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
      <el-form ref="replacementFormRef" v-loading="loading" :disabled="routeParams.type === 'view'" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="补卡日期" prop="replacementDate">
          <el-date-picker
            v-model="form.replacementDate"
            type="datetime"
            placeholder="选择补卡日期"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="补卡原因" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入补卡原因" />
        </el-form-item>
        <el-form-item label="文件上传" prop="fileUpload">
          <el-button type="primary" @click="triggerUpload" style="margin-top: 10px;">选择文件</el-button>
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

<script setup name="ReplacementEdit" lang="ts">
import { addLeave, getLeave, updateLeave } from '@/api/system/replacement';
import { ReplacementForm, ReplacementQuery, ReplacementVO } from '@/api/system/replacement/types';
import { startWorkFlow } from '@/api/workflow/task';
import SubmitVerify from '@/components/Process/submitVerify.vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
import { AxiosResponse } from 'axios';
import { StartProcessBo } from '@/api/workflow/workflowCommon/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const buttonLoading = ref(false);
const loading = ref(true);

//路由参数
const routeParams = ref<Record<string, any>>({});

const flowCodeOptions = [
  {
    value: 'replacement1',
    label: '补卡申请流程-普通'
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

const replacementFormRef = ref<ElFormInstance>();

const submitFormData = ref<StartProcessBo>({
  businessId: '',
  flowCode: '',
  variables: {}
});
const taskVariables = ref<Record<string, any>>({});

const initFormData: ReplacementForm = {
  id: undefined,
  replacementDate: undefined,
  remark: undefined,
  status: undefined
};

const data = reactive<PageData<ReplacementForm, ReplacementQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10
  },
  rules: {
    replacementDate: [{ required: true, message: '补卡日期不能为空', trigger: 'blur' }],
    remark: [{ required: true, message: '补卡原因不能为空', trigger: 'blur' }]
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
  replacementFormRef.value?.resetFields();
};

/** 获取详情 */
const getInfo = () => {
  loading.value = true;
  buttonLoading.value = false;
  nextTick(async () => {
    const res = await getLeave(routeParams.value.id);
    // 如果后端返回的是不带时间的日期，手动添加时间部分
    const responseData = res.data;
    if (responseData.replacementDate && responseData.replacementDate.length === 10) {
      responseData.replacementDate = `${responseData.replacementDate} 00:00:00`;
    }
    Object.assign(form.value, responseData);
    loading.value = false;
    buttonLoading.value = false;
  });
};

/** 提交按钮 */
const submitForm = (status: string) => {
  replacementFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      
      // 确保日期格式正确
      const submitData = {
        ...form.value,
        replacementDate: form.value.replacementDate || null
      };

      let res: AxiosResponse<ReplacementVO>;
      if (submitData.id) {
        res = await updateLeave(submitData);
      } else {
        res = await addLeave(submitData);
      }
      
      // 处理返回数据
      const responseData = res.data;
      if (responseData.replacementDate && responseData.replacementDate.length === 10) {
        responseData.replacementDate = `${responseData.replacementDate} 00:00:00`;
      }
      form.value = responseData;
      
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
          flowCode.value = 'replacement';
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
const handleStartWorkFlow = async (data: ReplacementForm) => {
  try {
    submitFormData.value.flowCode = flowCode.value;
    submitFormData.value.businessId = data.id;
    //流程变量
    taskVariables.value = {
      replacementDate: data.replacementDate,
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

//文件上传
const triggerUpload = () => {
  // 实现文件上传逻辑
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