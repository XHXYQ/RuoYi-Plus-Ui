<template>
  <div class="p-2">

    <!-- 信息提示 -->
    <h2 class="text-xl font-bold mb-2">黑名单管理</h2>
    <el-alert type="info" show-icon closable class="mb-4">
      新增「黑名单」功能，帮助企业规避用工风险
      <template #description>
        <a href="#">查看如何使用</a>
      </template>
    </el-alert>

    <!-- 搜索与添加 -->
    <el-card shadow="hover" class="mb-4">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-input v-model="queryParams.userName" placeholder="搜索人员" clearable @keyup.enter="handleQuery" />
        </el-col>
        <el-col :span="6">
          <el-input v-model="queryParams.idNumber" placeholder="证件号码" clearable @keyup.enter="handleQuery" />
        </el-col>
        <el-col :span="6">
          <el-input v-model="queryParams.phonenumber" placeholder="手机号码" clearable @keyup.enter="handleQuery" />
        </el-col>
        <el-col :span="6" class="text-right">
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:blacklist:add']">添加人员</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="blacklistList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="姓名" prop="userName" align="center" />
        <el-table-column label="证件号码" prop="idNumber" align="center" />
        <el-table-column label="手机号码" prop="phonenumber" align="center" />
        <el-table-column label="加黑原因" prop="reason" align="center" />
        <el-table-column label="加黑时间" prop="blacklistedAt" align="center" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.blacklistedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:blacklist:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:blacklist:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加或修改黑名单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="blacklistFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="证件号码" prop="idNumber">
          <el-input v-model="form.idNumber" placeholder="请输入证件号码" />
        </el-form-item>
        <el-form-item label="加黑原因" prop="reason">
          <el-input v-model="form.reason" placeholder="请输入加黑原因" />
        </el-form-item>
        <el-form-item label="加黑时间" prop="blacklistedAt">
          <el-date-picker
            v-model="form.blacklistedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择加黑时间"
            clearable
          />
        </el-form-item>
        <el-form-item label="加黑备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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


<script setup name="Blacklist" lang="ts">
import { listBlacklist, getBlacklist, delBlacklist, addBlacklist, updateBlacklist } from '@/api/system/blacklist';
import { BlacklistVO, BlacklistQuery, BlacklistForm } from '@/api/system/blacklist/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const blacklistList = ref<BlacklistVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const blacklistFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});


const initFormData: BlacklistForm = {
  id: undefined,
  userName: undefined,
  idNumber: undefined,
  phonenumber: undefined,
  reason: undefined,
  blacklistedAt: undefined,
}
const data = reactive<PageData<BlacklistForm, BlacklistQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    idNumber: undefined,
    phonenumber: undefined,
    reason: undefined,
    blacklistedAt: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键ID不能为空", trigger: "blur" }
    ],
    userName: [
      { required: true, message: "姓名不能为空", trigger: "blur" }
    ],
    idNumber: [
      { required: true, message: "证件号码不能为空", trigger: "blur" }
    ],
  phonenumber: [
    { required: true, message: "手机号不能为空", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ],
  idNumber: [
    { required: true, message: "证件号码不能为空", trigger: "blur" },
    {
      pattern: /^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])([0-2][1-9]|10|20|30|31)\d{3}[\dXx]$/,
      message: "请输入合法的身份证号码",
      trigger: "blur"
    }
  ],
  reason: [
    { required: true, message: "加黑原因不能为空", trigger: "blur" }
  ],
  // 可选字段可加长度限制或不填校验
  remark: [
    { max: 200, message: "备注不能超过200字", trigger: "blur" }
  ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询系统黑名单列表 */
const getList = async () => {
  loading.value = true;
  const res = await listBlacklist(queryParams.value);
  blacklistList.value = res.rows;
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
  blacklistFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: BlacklistVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加系统黑名单";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: BlacklistVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getBlacklist(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改系统黑名单";
}

/** 提交按钮 */
const submitForm = () => {
  blacklistFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateBlacklist(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addBlacklist(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: BlacklistVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除系统黑名单编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delBlacklist(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/blacklist/export', {
    ...queryParams.value
  }, `blacklist_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
