<template>
  <div class="p-2">
    <el-card shadow="never">
      <div style="display: flex; justify-content: space-between">
        <div>
          <el-button v-if="submitButtonShow" :loading="buttonLoading" type="info" @click="submitForm('draft')">暂存</el-button>
          <el-button v-if="submitButtonShow" :loading="buttonLoading" type="primary" @click="submitForm('submit')">提 交</el-button>
          <el-button v-if="approvalButtonShow" :loading="buttonLoading" type="primary" @click="approvalVerifyOpen">审批</el-button>
          <el-button v-if="form && form.id && form.approvalStatus !== 'draft'" type="primary" @click="handleApprovalRecord">流程进度</el-button>
        </div>
        <div>
          <el-button style="float: right" @click="goBack()">返回</el-button>
        </div>
      </div>
    </el-card>
    <el-card shadow="never" style="height: 78vh; overflow-y: auto">
      <el-form
  v-if="form"
  ref="regularApplicationFormRef"
  :disabled="routeParams.type === 'view'"
  :model="form"
  :rules="rules"
  label-width="100px"
>

        <el-form-item label="申请人姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入申请人姓名" />
        </el-form-item>
        <el-form-item label="所在部门" prop="department">
          <el-input v-model="form.department" placeholder="请输入所在部门" />
        </el-form-item>
        <el-form-item label="当前岗位" prop="position">
          <el-input v-model="form.position" placeholder="请输入当前岗位" />
        </el-form-item>
        <el-form-item label="员工类型" prop="employeeType">
          <el-select v-model="form.employeeType" placeholder="请选择员工类型" style="width: 100%">
            <el-option label="正式员工" value="1" />
            <el-option label="试用期员工" value="2" />
            <el-option label="实习生" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker
            v-model="form.entryDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择入职日期"
          />
        </el-form-item>
        <el-form-item label="试用期(月)" prop="probationPeriod">
          <el-input-number v-model="form.probationPeriod" :min="1" :max="6" />
        </el-form-item>
        <el-form-item label="计划转正日期" prop="planRegularDate">
          <el-date-picker
            v-model="form.planRegularDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择计划转正日期"
          />
        </el-form-item>
        <el-form-item label="转正自评" prop="selfEvaluation">
          <el-input v-model="form.selfEvaluation" type="textarea" :rows="3" placeholder="请填写试用期工作总结和自我评价" />
        </el-form-item>
        <el-form-item label="附件上传" prop="fileUrl">
          <el-upload
            action="/api/system/upload"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :limit="3"
            :file-list="fileList"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">请上传转正相关材料，支持pdf/doc/xls格式</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提交组件 -->
    <submit-verify ref="submitVerifyRef" :task-variables="taskVariables" @submit-callback="submitCallback" />
    <!-- 审批记录 -->
    <approval-record ref="approvalRecordRef" />
    <el-dialog v-model="dialogVisible.visible" :title="dialogVisible.title" :before-close="handleClose" width="500">
      <el-select v-model="flowCode" placeholder="请选择流程类型" style="width: 100%">
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

<script setup name="RegularApplicationEdit" lang="ts">
import { addRegularApplication, getRegularApplication, updateRegularApplication } from '@/api/workflow/regularApplication';
import { startWorkFlow } from '@/api/workflow/task';
import SubmitVerify from '@/components/Process/submitVerify.vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
import { RegularApplicationForm } from '@/api/workflow/regularApplication/types';
import { StartProcessBo } from '@/api/workflow/workflowCommon/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const buttonLoading = ref(false);
const loading = ref(true);
const routeParams = ref<Record<string, any>>({});
const fileList = ref<any[]>([]);

const flowCodeOptions = [
  // { value: 'regular1', label: '普通转正流程' },
  // { value: 'regular2', label: '部门负责人审批流程' },
  // { value: 'regular3', label: 'HR审批流程' }
    {
    value: 'leave1',
    label: '转正申请-普通'
  },
  {
    value: 'leave2',
    label: '转正申请-排他网关'
  },
  {
    value: 'leave3',
    label: '转正申请-并行网关'
  },
  {
    value: 'leave4',
    label: '转正申请-会签'
  },
  {
    value: 'leave5',
    label: '转正申请-并行会签网关'
  },
  {
    value: 'leave6',
    label: '转正申请-排他并行会签'
  }
];

const flowCode = ref<string>('regular1');

const dialogVisible = reactive({
  visible: false,
  title: '选择审批流程'
});

const submitVerifyRef = ref<InstanceType<typeof SubmitVerify>>();
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>();
const regularApplicationFormRef = ref<ElFormInstance>();

const submitFormData = ref<StartProcessBo>({
  businessId: '',
  flowCode: '',
  variables: {}
});

const taskVariables = ref<Record<string, any>>({
  department: '',
  position: ''
});

const initFormData: RegularApplicationForm = {
  id: undefined,
  name: '',
  department: '',
  position: '',
  employeeType: '2',
  entryDate: '',
  probationPeriod: 3,
  planRegularDate: '',
  actualRegularDate: '',
  approvalStatus: 'draft',
  flowInstanceId: '',
  selfEvaluation: '',
  fileUrl: ''
};

const data = reactive({
  form: { ...initFormData },
  rules: {
    name: [{ required: true, message: '申请人姓名不能为空', trigger: 'blur' }],
    department: [{ required: true, message: '所在部门不能为空', trigger: 'blur' }],
    position: [{ required: true, message: '当前岗位不能为空', trigger: 'blur' }],
    entryDate: [{ required: true, message: '入职日期不能为空', trigger: 'change' }],
    planRegularDate: [{ required: true, message: '计划转正日期不能为空', trigger: 'change' }],
    selfEvaluation: [{ required: true, message: '转正自评不能为空', trigger: 'blur' }]
  }
});

const { form, rules } = toRefs(data);

/** 表单重置 */
// const reset = () => {
//   // form.value = { ...initFormData };
//   Object.assign(form.value, initFormData);

//   fileList.value = [];
//   regularApplicationFormRef.value?.resetFields();
// };
const reset = () => {
  Object.assign(form.value, initFormData);
  fileList.value = [];
  regularApplicationFormRef.value?.resetFields();
};


/** 获取详情 */
// const getInfo = () => {
//   loading.value = true;
//   nextTick(async () => {
//     const res = await getRegularApplication(routeParams.value.id);
//     Object.assign(form.value, res.data);
//     if (form.value.fileUrl) {
//       fileList.value = form.value.fileUrl.split(',').map(url => ({ name: url.substring(url.lastIndexOf('/') + 1), url }));
//     }
//     loading.value = false;
//   });
// };
const getInfo = () => {
  loading.value = true;
  nextTick(async () => {
    const res = await getRegularApplication(routeParams.value.id);
    if (res?.data) {
      Object.assign(form.value, res.data);
      if (form.value.fileUrl) {
        fileList.value = form.value.fileUrl
          .split(',')
          .map(url => ({ name: url.substring(url.lastIndexOf('/') + 1), url }));
      }
    }
    loading.value = false;
  });
};


/** 文件上传成功处理 */
const handleUploadSuccess = (response: any, file: any) => {
  if (response.code === 200) {
    const urls = fileList.value.map(f => f.url || f.response.url);
    if (form.value.fileUrl) {
      urls.push(...form.value.fileUrl.split(','));
    }
    form.value.fileUrl = urls.join(',');
    proxy?.$modal.msgSuccess('上传成功');
  }
};

/** 文件上传前校验 */
const beforeUpload = (file: any) => {
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    proxy?.$modal.msgError('上传文件大小不能超过 10MB!');
    return false;
  }
  return true;
};

/** 提交按钮 */
const submitForm = (status: string) => {
  regularApplicationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        form.value.approvalStatus = status;
        let res: any;
        
        if (form.value.id) {
          res = await updateRegularApplication(form.value);
        } else {
          res = await addRegularApplication(form.value);
        }
        
        form.value = res.data;
        
        if (status === 'draft') {
          proxy?.$modal.msgSuccess('暂存成功');
          goBack();
        } else {
          if (routeParams.value.type === 'add' || (form.value.approvalStatus === 'draft' && !flowCode.value)) {
            dialogVisible.visible = true;
            return;
          }
          await handleStartWorkFlow(res.data);
        }
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

const submitFlow = async () => {
  await handleStartWorkFlow(form.value);
  dialogVisible.visible = false;
};

/** 启动工作流 */
// const handleStartWorkFlow = async (data: RegularApplicationForm) => {
//   try {
//     submitFormData.value.flowCode = flowCode.value;
//     submitFormData.value.businessId = data.id;
//     taskVariables.value = {
//       department: data.department,
//       position: data.position,
//       employeeType: data.employeeType
//     };
//     submitFormData.value.variables = taskVariables.value;
    
//     const resp = await startWorkFlow(submitFormData.value);
//     if (submitVerifyRef.value) {
//       submitVerifyRef.value.openDialog(resp.data.taskId);
//     }
//   } catch (error) {
//     console.error('启动流程失败:', error);
//     proxy?.$modal.msgError('启动流程失败');
//   }
// };
const handleStartWorkFlow = async (data: RegularApplicationForm) => {
  if (!data || !data.id) {
    proxy?.$modal.msgError('启动流程失败：数据未保存或缺少 ID');
    return;
  }
  try {
    submitFormData.value.flowCode = flowCode.value;
    submitFormData.value.businessId = data.id;
    taskVariables.value = {
      department: data.department,
      position: data.position,
      employeeType: data.employeeType
    };
    submitFormData.value.variables = taskVariables.value;

    const resp = await startWorkFlow(submitFormData.value);
    submitVerifyRef.value?.openDialog(resp.data.taskId);
  } catch (error) {
    console.error('启动流程失败:', error);
    proxy?.$modal.msgError('启动流程失败');
  }
};


/** 审批记录 */
const handleApprovalRecord = () => {
  approvalRecordRef.value.init(form.value.id);
};

/** 审批操作 */
const approvalVerifyOpen = async () => {
  submitVerifyRef.value.openDialog(routeParams.value.taskId);
};

// /** 提交回调 */
// const submitCallback = async () => {
//   await proxy.$tab.closePage(proxy.$route);
//   proxy.$router.go(-1);
// };

// /** 返回 */
// const goBack = () => {
//   proxy.$tab.closePage(proxy.$route);
//   proxy.$router.go(-1);
// };
/** 提交回调 */
const submitCallback = async () => {
  await proxy.$tab.closePage(proxy.$route);
  // 明确跳转到转正申请列表页
  proxy.$router.push('/workflow/application');
};

/** 返回 */
const goBack = () => {
  proxy.$tab.closePage(proxy.$route);
  // 统一也跳转到列表页
  proxy.$router.push('/workflow/application');
};

/** 校验提交按钮是否显示 */
const submitButtonShow = computed(() => {
  return (
    routeParams.value.type === 'add' ||
    (routeParams.value.type === 'update' &&
      form.value.approvalStatus &&
      (form.value.approvalStatus === 'draft' || form.value.approvalStatus === 'back'))
  );
});

/** 校验审批按钮是否显示 */
const approvalButtonShow = computed(() => {
  return routeParams.value.type === 'approval' && form.value.approvalStatus === 'waiting';
});

onMounted(() => {
  routeParams.value = proxy.$route.query;
  reset();
  if (routeParams.value.type === 'update' || routeParams.value.type === 'view' || routeParams.value.type === 'approval') {
    getInfo();
  }
});
</script>