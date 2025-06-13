<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="会话ID" prop="sessionId">
              <el-input v-model="queryParams.sessionId" placeholder="请输入会话ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="加入时间" prop="joinTime">
              <el-date-picker clearable
                v-model="queryParams.joinTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择加入时间"
              />
            </el-form-item>
            <el-form-item label="是否被禁言" prop="isMuted">
              <el-input v-model="queryParams.isMuted" placeholder="请输入是否被禁言" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:chatSessionUser:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:chatSessionUser:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:chatSessionUser:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:chatSessionUser:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="chatSessionUserList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键" align="center" prop="id" v-if="true" />
        <el-table-column label="会话ID" align="center" prop="sessionId" />
        <el-table-column label="用户ID" align="center" prop="userId" />
        <el-table-column label="加入时间" align="center" prop="joinTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.joinTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否被禁言" align="center" prop="isMuted" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:chatSessionUser:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:chatSessionUser:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改会话参与人：记录会话中参与的用户，支持多用户加入群聊对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="chatSessionUserFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会话ID" prop="sessionId">
          <el-input v-model="form.sessionId" placeholder="请输入会话ID" />
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="加入时间" prop="joinTime">
          <el-date-picker clearable
            v-model="form.joinTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择加入时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否被禁言" prop="isMuted">
          <el-input v-model="form.isMuted" placeholder="请输入是否被禁言" />
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

<script setup name="ChatSessionUser" lang="ts">
import { listChatSessionUser, getChatSessionUser, delChatSessionUser, addChatSessionUser, updateChatSessionUser } from '@/api/system/chatSessionUser';
import { ChatSessionUserVO, ChatSessionUserQuery, ChatSessionUserForm } from '@/api/system/chatSessionUser/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const chatSessionUserList = ref<ChatSessionUserVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const chatSessionUserFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ChatSessionUserForm = {
  id: undefined,
  sessionId: undefined,
  userId: undefined,
  joinTime: undefined,
  isMuted: undefined
}
const data = reactive<PageData<ChatSessionUserForm, ChatSessionUserQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sessionId: undefined,
    userId: undefined,
    joinTime: undefined,
    isMuted: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    sessionId: [
      { required: true, message: "会话ID不能为空", trigger: "blur" }
    ],
    userId: [
      { required: true, message: "用户ID不能为空", trigger: "blur" }
    ],
    joinTime: [
      { required: true, message: "加入时间不能为空", trigger: "blur" }
    ],
    isMuted: [
      { required: true, message: "是否被禁言不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询会话参与人：记录会话中参与的用户，支持多用户加入群聊列表 */
const getList = async () => {
  loading.value = true;
  const res = await listChatSessionUser(queryParams.value);
  chatSessionUserList.value = res.rows;
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
  chatSessionUserFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ChatSessionUserVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加会话参与人：记录会话中参与的用户，支持多用户加入群聊";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ChatSessionUserVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getChatSessionUser(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改会话参与人：记录会话中参与的用户，支持多用户加入群聊";
}

/** 提交按钮 */
const submitForm = () => {
  chatSessionUserFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateChatSessionUser(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addChatSessionUser(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ChatSessionUserVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除会话参与人：记录会话中参与的用户，支持多用户加入群聊编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delChatSessionUser(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/chatSessionUser/export', {
    ...queryParams.value
  }, `chatSessionUser_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
