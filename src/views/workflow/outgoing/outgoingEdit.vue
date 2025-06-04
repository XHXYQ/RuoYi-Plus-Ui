<template>
  <div class="p-2">
    <el-card shadow="never">
      <div style="display: flex; justify-content: space-between">
        <div>
          <el-button v-if="submitButtonShow" :loading="buttonLoading" type="info" @click="submitForm('draft')">暂存</el-button>
          <el-button v-if="submitButtonShow" :loading="buttonLoading" type="primary" @click="submitForm('submit')">提 交</el-button>
          <el-button v-if="approvalButtonShow" :loading="buttonLoading" type="primary" @click="approvalVerifyOpen">审批</el-button>
          <el-button v-if="form.id && form.status && form.status !== 'draft'" type="primary" @click="handleApprovalRecord">流程进度</el-button>
        </div>
        <div>
          <el-button style="float: right" @click="goBack()">返回</el-button>
        </div>
      </div>
    </el-card>
    <el-card shadow="never" style="height: 78vh; overflow-y: auto">
      <el-form ref="outgoingFormRef" v-loading="loading" :disabled="routeParams.type === 'view'" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="form.applicant" placeholder="请输入申请人" />
        </el-form-item>
        <el-form-item label="外出时间">
          <el-date-picker
            v-model="outgoingTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            @change="changeOutgoingTime()"
          />
        </el-form-item>
        <el-form-item label="外出天数" prop="leaveDay">
          <el-input v-model="form.leaveDay" disabled type="number" placeholder="请输入外出天数" />
        </el-form-item>
        <el-form-item label="外出原因" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入外出原因" />
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 提交组件 -->
    <submitVerify ref="submitVerifyRef" :task-variables="taskVariables" @submit-callback="submitCallback" />
    <!-- 审批记录 -->
    <approvalRecord ref="approvalRecordRef" />
    <el-dialog v-model="dialogVisible.visible" :title="dialogVisible.title" :before-close="handleClose" width="500">
      <el-select v-model="flowCode" placeholder="Select" style="width: 240px">
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

<script setup name="Outgoing" lang="ts">
import { addOutgoing, getOutgoing, updateOutgoing } from '@/api/workflow/outgoing';
import { OutgoingForm, OutgoingQuery, OutgoingVO } from '@/api/workflow/outgoing/types';
import { startWorkFlow } from '@/api/workflow/task';
import SubmitVerify from '@/components/Process/submitVerify.vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
import { AxiosResponse } from 'axios';
import { StartProcessBo } from '@/api/workflow/workflowCommon/types';
import { ref, reactive, computed, onMounted, nextTick, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { ElFormInstance } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const buttonLoading = ref(false);
const loading = ref(true);
const outgoingTime = ref<Array<string>>([]);
//路由参数
const routeParams = ref<Record<string, any>>({});

const flowCodeOptions = [
  {
    value: 'outgoing1',
    label: '外出申请-普通'
  },
  {
    value: 'leave2',
    label: '外出申请-排他网关'
  },
  {
    value: 'leave3',
    label: '外出申请-并行网关'
  },
  {
    value: 'leave4',
    label: '外出申请-会签'
  },
  {
    value: 'leave5',
    label: '外出申请-并行会签网关'
  },
  {
    value: 'leave6',
    label: '外出申请-排他并行会签'
  }
];

const flowCode = ref<string>('');

interface DialogOption {
  visible: boolean;
  title: string;
}

const dialogVisible = reactive<DialogOption>({
  visible: false,
  title: '流程定义'
});
//提交组件
const submitVerifyRef = ref<InstanceType<typeof SubmitVerify>>();
//审批记录组件
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>();

const outgoingFormRef = ref<ElFormInstance>();

const submitFormData = ref<StartProcessBo>({
  businessId: '',
  flowCode: '',
  variables: {}
});
const taskVariables = ref<Record<string, any>>({});

const initFormData: OutgoingForm = {
  id: undefined,
  applicant: '',
  startTime: undefined,
  endTime: undefined,
  leaveDay: undefined,
  remark: undefined,
  status: 'draft'
};

// 使用reactive确保form对象始终存在且可以正常绑定
const form = reactive<OutgoingForm>({ ...initFormData });

const queryParams = ref<OutgoingQuery>({
  pageNum: 1,
  pageSize: 10,
  startLeaveDay: undefined,
  endLeaveDay: undefined
});

const rules = reactive({
  applicant: [{ required: true, message: '申请人不能为空', trigger: 'blur' }],
  outgoingTime: [{ required: true, message: '外出时间不能为空', trigger: 'blur' }],
  leaveDay: [{ required: true, message: '外出天数不能为空', trigger: 'blur' }]
});

const handleClose = () => {
  dialogVisible.visible = false;
  flowCode.value = '';
  buttonLoading.value = false;
};

/** 表单重置 */
const reset = () => {
  Object.assign(form, { ...initFormData });
  outgoingTime.value = [];
  outgoingFormRef.value?.resetFields();
};

const changeOutgoingTime = () => {
  const startDate = new Date(outgoingTime.value[0]).getTime();
  const endDate = new Date(outgoingTime.value[1]).getTime();
  const diffInMilliseconds = endDate - startDate;
  form.leaveDay = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)) + 1;
};

/** 获取详情 */
const getInfo = () => {
  loading.value = true;
  buttonLoading.value = false;
  nextTick(async () => {
    try {
      const res = await getOutgoing(routeParams.value.id);
      Object.assign(form, res.data);
      outgoingTime.value = [];
      outgoingTime.value.push(form.startTime);
      outgoingTime.value.push(form.endTime);
      loading.value = false;
      buttonLoading.value = false;
    } catch (error) {
      console.error('获取详情失败:', error);
      loading.value = false;
      buttonLoading.value = false;
    }
  });
};

/** 提交按钮 */
const submitForm = (status: string) => {
  if (outgoingTime.value.length === 0) {
    proxy?.$modal.msgError('外出时间不能为空');
    return;
  }
  try {
    outgoingFormRef.value?.validate(async (valid: boolean) => {
      form.startTime = outgoingTime.value[0];
      form.endTime = outgoingTime.value[1];
      if (valid) {
        buttonLoading.value = true;
        
        // 设置状态
        form.status = status;
        
        let res: AxiosResponse<OutgoingVO>;
        if (form.id) {
          res = await updateOutgoing(form);
        } else {
          res = await addOutgoing(form);
        }
        
        // 安全地更新form
        Object.assign(form, res.data);
        
        if (status === 'draft') {
          buttonLoading.value = false;
          proxy?.$modal.msgSuccess('暂存成功');
          proxy.$tab.closePage(proxy.$route);
          proxy.$router.go(-1);
        } else {
          // 检查是否需要选择流程
          if ((form.status === 'draft' && (flowCode.value === '' || flowCode.value === null)) || routeParams.value.type === 'add') {
            flowCode.value = flowCodeOptions[0].value;
            dialogVisible.visible = true;
            buttonLoading.value = false;
            return;
          }
          
          if (flowCode.value === '' || flowCode.value === null) {
            flowCode.value = 'xx';
          }
          
          if (!form.id) {
            console.error('保存后仍然没有ID:', form);
            proxy?.$modal.msgError('保存失败，无法获取业务ID');
            buttonLoading.value = false;
            return;
          }
          
          await handleStartWorkFlow(form);
        }
      } else {
        buttonLoading.value = false;
      }
    });
  } catch (error) {
    console.error('submitForm error:', error);
    proxy?.$modal.msgError('提交失败: ' + (error?.message || '未知错误'));
    buttonLoading.value = false;
  }
};

const submitFlow = async () => {
  try {
    buttonLoading.value = true;
    
    if (!form.id) {
      console.error('submitFlow: 没有业务ID');
      proxy?.$modal.msgError('业务ID不存在，请重新保存');
      return;
    }
    
    await handleStartWorkFlow(form);
    dialogVisible.visible = false;
  } catch (error) {
    console.error('submitFlow error:', error);
    proxy?.$modal.msgError('启动流程失败');
  } finally {
    buttonLoading.value = false;
  }
};

//提交申请
const handleStartWorkFlow = async (data: OutgoingForm | OutgoingVO) => {
  try {
    // 严格检查businessId
    if (!data || !data.id) {
      console.error('handleStartWorkFlow: businessId为空', data);
      proxy?.$modal.msgError('业务ID不能为空，请先保存数据');
      return;
    }
    
    submitFormData.value.flowCode = flowCode.value;
    submitFormData.value.businessId = data.id;
    //流程变量
    taskVariables.value = {
      leaveDay: data.leaveDay,
      userList: ['1', '3', '4']
    };
    submitFormData.value.variables = taskVariables.value;
    
    const resp = await startWorkFlow(submitFormData.value);
    if (submitVerifyRef.value && resp && resp.data) {
      submitVerifyRef.value.openDialog(resp.data.taskId);
    }
  } catch (error) {
    console.error('启动流程失败:', error);
    proxy?.$modal.msgError('启动流程失败: ' + (error?.message || '未知错误'));
  } finally {
    buttonLoading.value = false;
  }
};

//审批记录
const handleApprovalRecord = () => {
  if (form?.id) {
    approvalRecordRef.value?.init(form.id);
  }
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
  if (routeParams?.value?.taskId) {
    submitVerifyRef.value?.openDialog(routeParams.value.taskId);
  }
};

//校验提交按钮是否显示
const submitButtonShow = computed(() => {
  try {
    if (!routeParams.value) {
      return false;
    }
    
    const currentStatus = form.status || 'draft';
    const routeType = routeParams.value.type;
    
    if (routeType === 'add') {
      return true;
    }
    
    if (routeType === 'update') {
      return currentStatus === 'draft' || currentStatus === 'cancel' || currentStatus === 'back';
    }
    
    return false;
  } catch (error) {
    console.error('submitButtonShow error:', error);
    return false;
  }
});

//校验审批按钮是否显示
const approvalButtonShow = computed(() => {
  try {
    if (!routeParams.value) {
      return false;
    }
    
    const currentStatus = form.status || 'draft';
    const routeType = routeParams.value.type;
    
    return routeType === 'approval' && currentStatus === 'waiting';
  } catch (error) {
    console.error('approvalButtonShow error:', error);
    return false;
  }
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
