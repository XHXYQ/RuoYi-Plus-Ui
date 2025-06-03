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
      <el-form ref="applicationFormRef" v-loading="loading" :disabled="routeParams.type === 'view'" :model="form" :rules="rules" label-width="120px">
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
            <el-option label="外包员工" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker
            v-model="form.entryDate"
            type="date"
            placeholder="请选择入职日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="试用期(月)" prop="probationPeriod">
          <el-input-number 
            v-model="form.probationPeriod" 
            :min="1" 
            :max="12" 
            placeholder="请输入试用期月数" 
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="计划转正日期" prop="planRegularDate">
          <el-date-picker
            v-model="form.planRegularDate"
            type="date"
            placeholder="请选择计划转正日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="试用期工作总结" prop="workSummary">
          <el-input v-model="form.workSummary" type="textarea" :rows="4" placeholder="请输入试用期工作总结" />
        </el-form-item>
        <el-form-item label="自我评价" prop="selfEvaluation">
          <el-input v-model="form.selfEvaluation" type="textarea" :rows="3" placeholder="请输入自我评价" />
        </el-form-item>
        <el-form-item label="转正后工作计划" prop="workPlan">
          <el-input v-model="form.workPlan" type="textarea" :rows="3" placeholder="请输入转正后工作计划" />
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

<script setup name="RegularApplication" lang="ts">
import { addRegularApplication, getRegularApplication, updateRegularApplication } from '@/api/workflow/regularApplication';
import { RegularApplicationForm, RegularApplicationQuery, RegularApplicationVO } from '@/api/workflow/regularApplication/types';
import { startWorkFlow } from '@/api/workflow/task';
import SubmitVerify from '@/components/Process/submitVerify.vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
import { AxiosResponse } from 'axios';
import { StartProcessBo } from '@/api/workflow/workflowCommon/types';
import { getCurrentInstance, ComponentInternalInstance, ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { ElFormInstance } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const buttonLoading = ref(false);
const loading = ref(true);
//路由参数
const routeParams = ref<Record<string, any>>({});

// 使用和请假申请相同的流程定义选项
const flowCodeOptions = [
  {
    value: 'application1',
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

const applicationFormRef = ref<ElFormInstance>();

const submitFormData = ref<StartProcessBo>({
  businessId: '',
  flowCode: '',
  variables: {}
});
const taskVariables = ref<Record<string, any>>({});

const initFormData: RegularApplicationForm = {
  id: undefined,
  name: '',
  department: '',
  position: '',
  employeeType: '2', // 默认试用期员工
  entryDate: '',
  probationPeriod: 3,
  planRegularDate: '',
  actualRegularDate: '',
  workSummary: '',
  selfEvaluation: '',
  workPlan: '',
  status: 'draft' // 修正：使用 status 而不是 approvalStatus
};

// 使用reactive确保form对象始终存在且可以正常绑定
const form = reactive<RegularApplicationForm>({ ...initFormData });

// 监听form的变化，确保它不会变成null
watch(form, (newVal) => {
  if (!newVal) {
    console.warn('form became null, this should not happen');
    Object.assign(form, { ...initFormData });
  }
}, { deep: true });

const queryParams = ref<RegularApplicationQuery>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  department: undefined
});

const rules = reactive({
  name: [{ required: true, message: '申请人姓名不能为空', trigger: 'blur' }],
  department: [{ required: true, message: '所在部门不能为空', trigger: 'blur' }],
  position: [{ required: true, message: '当前岗位不能为空', trigger: 'blur' }],
  employeeType: [{ required: true, message: '员工类型不能为空', trigger: 'change' }],
  entryDate: [{ required: true, message: '入职日期不能为空', trigger: 'blur' }],
  probationPeriod: [{ required: true, message: '试用期不能为空', trigger: 'blur' }],
  planRegularDate: [{ required: true, message: '计划转正日期不能为空', trigger: 'blur' }],
  workSummary: [{ required: true, message: '试用期工作总结不能为空', trigger: 'blur' }]
});

const handleClose = () => {
  dialogVisible.visible = false;
  flowCode.value = '';
  buttonLoading.value = false;
};

/** 表单重置 */
const reset = () => {
  Object.assign(form, { ...initFormData });
  applicationFormRef.value?.resetFields();
};

/** 获取详情 */
const getInfo = () => {
  loading.value = true;
  buttonLoading.value = false;
  nextTick(async () => {
    try {
      const res = await getRegularApplication(routeParams.value.id);
      Object.assign(form, res.data);
      loading.value = false;
      buttonLoading.value = false;
    } catch (error) {
      console.error('获取详情失败:', error);
      loading.value = false;
      buttonLoading.value = false;
    }
  });
};

/** 提交按钮 - 修复业务ID问题 */
const submitForm = (status: string) => {
  console.log('submitForm called with status:', status);
  console.log('current form:', form);
  
  try {
    applicationFormRef.value?.validate(async (valid: boolean) => {
      if (valid) {
        buttonLoading.value = true;
        
        // 设置状态
        form.status = status;
        
        let res: AxiosResponse<RegularApplicationVO>;
        if (form.id) {
          res = await updateRegularApplication(form);
        } else {
          res = await addRegularApplication(form);
        }
        
        // 安全地更新form
        Object.assign(form, res.data);
        console.log('保存后的form:', form);
        console.log('保存后的ID:', form.id);
        
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
    
    console.log('submitFlow: 准备启动流程，businessId:', form.id);
    await handleStartWorkFlow(form);
    dialogVisible.visible = false;
  } catch (error) {
    console.error('submitFlow error:', error);
    proxy?.$modal.msgError('启动流程失败');
  } finally {
    buttonLoading.value = false;
  }
};

//提交申请 - 确保businessId不为空
const handleStartWorkFlow = async (data: RegularApplicationForm | RegularApplicationVO) => {
  try {
    console.log('handleStartWorkFlow called with data:', data);
    
    // 严格检查businessId
    if (!data || !data.id) {
      console.error('handleStartWorkFlow: businessId为空', data);
      proxy?.$modal.msgError('业务ID不能为空，请先保存数据');
      return;
    }
    
    submitFormData.value.flowCode = flowCode.value;
    submitFormData.value.businessId = data.id;
    
    // 流程变量 - 和请假申请保持相同结构
    taskVariables.value = {
      probationPeriod: data.probationPeriod || 3,
      userList: ['1', '3', '4']
    };
    submitFormData.value.variables = taskVariables.value;
    
    console.log('最终启动流程参数:', submitFormData.value);
    console.log('businessId:', submitFormData.value.businessId);
    
    const resp = await startWorkFlow(submitFormData.value);
    console.log('启动流程响应:', resp);
    
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

//校验提交按钮是否显示 - 使用安全的访问方式
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

//校验审批按钮是否显示 - 使用安全的访问方式
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
