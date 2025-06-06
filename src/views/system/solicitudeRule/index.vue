<template>
  <div class="p-4">
    <!-- 顶部 Tab 切换 -->
    <el-tabs v-model="categoryId" @tab-change="getList">
      <el-tab-pane label="生日关怀" :name="1" />
      <el-tab-pane label="入职周年关怀" :name="2" />
    </el-tabs>

    <!-- 月份 + 部门选择器 -->
    <el-row :gutter="10" class="mb-4 items-center">
      <el-col :span="4">
        <el-date-picker v-model="filterMonth" type="month" placeholder="选择月份" style="width: 100%;" />
      </el-col>
      <el-col :span="6">
        <el-tree-select
          v-model="filterDept"
          :data="deptOptions"
          :props="treeProps"
          placeholder="选择部门"
          clearable
          check-strictly
          node-key="deptId"
          default-expand-all
          style="width: 100%;"
        />
      </el-col>
      <el-col :span="14" class="text-right">
        <el-button @click="handleExport">导出</el-button>
        <el-button type="primary" @click="handleSetRule">
          设置{{ categoryId === 1 ? '生日' : '入职周年' }}祝福
        </el-button>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <div class="mb-2 font-bold text-base">
        2025年{{ currentMonth }}月{{ categoryId === 1 ? '生日' : '入职周年' }}的员工（共{{ total }}人）
      </div>

      <el-table v-loading="loading" :data="solicitudeList" empty-text="最近一个月无人{{ categoryId === 1 ? '生日' : '入职周年' }}">
        <el-table-column label="姓名" prop="userName" align="center" />
        <el-table-column label="部门" prop="deptName" align="center" />
        <el-table-column label="职位" prop="postName" align="center" />
        <el-table-column label="员工类型" prop="userType" align="center" />

        <el-table-column v-if="categoryId === 1" label="生日时间" prop="date" align="center" />
        <el-table-column v-else label="入职时间" prop="date" align="center" />

        <el-table-column v-if="categoryId === 1" label="系统祝福" prop="enableSystemRemind" align="center">
          <template #default="scope">
            <span>{{ scope.row.enableSystemRemind ? '开启' : '关闭' }}</span>
          </template>
        </el-table-column>

        <el-table-column v-if="categoryId === 1" label="全员祝福" prop="enableAllRemind" align="center">
          <template #default="scope">
            <span>{{ scope.row.enableAllRemind ? '开启' : '关闭（管理员关闭）' }}</span>
          </template>
        </el-table-column>

        <el-table-column v-if="categoryId === 1" label="提醒给同事" prop="enableColleagueRemind" align="center">
          <template #default="scope">
            <span>{{ scope.row.enableColleagueRemind ? '开启' : '关闭' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="SolicitudeRule" lang="ts">
import { listSolicitudeRule, getSolicitudeRule, delSolicitudeRule, addSolicitudeRule, updateSolicitudeRule } from '@/api/system/solicitudeRule';
import { SolicitudeRuleVO, SolicitudeRuleQuery, SolicitudeRuleForm } from '@/api/system/solicitudeRule/types';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api/system/user';

const route = useRoute();
const categoryId = Number(route.query.categoryId || 1);
const month = new Date().getMonth() + 1;
const monthLabel = computed(() => `${month}月`);
const filterMonth = ref(new Date());
const filterDept = ref('');

const solicitudeList = ref<any[]>([]);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const solicitudeRuleList = ref<SolicitudeRuleVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const solicitudeRuleFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});


const initFormData: SolicitudeRuleForm = {
  id: undefined,
  categoryId: undefined,
  enableSystemRemind: undefined,
  enableAllRemind: undefined,
  enableColleagueRemind: undefined,
  remindDaysBefore: undefined,
  remindTime: undefined,
  messageTemplate: undefined,
  createdBy: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  deletedAt: undefined
}
const data = reactive<PageData<SolicitudeRuleForm, SolicitudeRuleQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    categoryId: undefined,
    enableSystemRemind: undefined,
    enableAllRemind: undefined,
    enableColleagueRemind: undefined,
    remindDaysBefore: undefined,
    remindTime: undefined,
    messageTemplate: undefined,
    createdBy: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键ID不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "关怀类型ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询员工关怀规则配置列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSolicitudeRule(queryParams.value);
  solicitudeRuleList.value = res.rows;
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
  solicitudeRuleFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: SolicitudeRuleVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加员工关怀规则配置";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: SolicitudeRuleVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getSolicitudeRule(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改员工关怀规则配置";
}

/** 提交按钮 */
const submitForm = () => {
  solicitudeRuleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateSolicitudeRule(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addSolicitudeRule(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: SolicitudeRuleVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除员工关怀规则配置编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delSolicitudeRule(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/solicitudeRule/export', {
    ...queryParams.value
  }, `solicitudeRule_${new Date().getTime()}.xlsx`)
}

const deptOptions = ref([]);
const treeProps = {
  value: 'deptId',
  label: 'deptName',
  children: 'children'
};

const getTreeSelect = async () => {
  const res = await api.deptTreeSelect();
  const normalize = (nodes: any[]) => {
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
};

onMounted(() => {
    getTreeSelect();
    getList();
});

async function fakeApiFetch(cat: number) {
  return {
    total: cat === 1 ? 1 : 0,
    rows: cat === 1
      ? [{
          userName: 'Sevia',
          deptName: 'Test',
          postName: '设计',
          userType: '全职',
          date: '05月19日',
          enableSystemRemind: 1,
          enableAllRemind: 0,
          enableColleagueRemind: 1,
        }]
      : []
  };
}
</script>
