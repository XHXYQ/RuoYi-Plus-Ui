<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="会话ID" prop="sessionId">
              <el-input v-model="queryParams.sessionId" placeholder="请输入会话ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="发送者ID" prop="senderId">
              <el-input v-model="queryParams.senderId" placeholder="请输入发送者ID" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:chatMessage:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:chatMessage:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:chatMessage:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:chatMessage:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="chatMessageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键" align="center" prop="id" v-if="true" />
        <el-table-column label="会话ID" align="center" prop="sessionId" />
        <el-table-column label="发送者ID" align="center" prop="senderId" />
        <el-table-column label="消息内容" align="center" prop="content" />
        <el-table-column label="消息类型" align="center" prop="messageType" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:chatMessage:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:chatMessage:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改消息：用于记录聊天内容对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="chatMessageFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会话ID" prop="sessionId">
          <el-input v-model="form.sessionId" placeholder="请输入会话ID" />
        </el-form-item>
        <el-form-item label="发送者ID" prop="senderId">
          <el-input v-model="form.senderId" placeholder="请输入发送者ID" />
        </el-form-item>
        <el-form-item label="消息内容">
          <editor v-model="form.content" :min-height="192"/>
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

<script setup name="ChatMessage" lang="ts">
import { listChatMessage, getChatMessage, delChatMessage, addChatMessage, updateChatMessage } from '@/api/system/chatMessage';
import { ChatMessageVO, ChatMessageQuery, ChatMessageForm } from '@/api/system/chatMessage/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const chatMessageList = ref<ChatMessageVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const chatMessageFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ChatMessageForm = {
  id: undefined,
  sessionId: undefined,
  senderId: undefined,
  content: undefined,
  messageType: undefined,
}
const data = reactive<PageData<ChatMessageForm, ChatMessageQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sessionId: undefined,
    senderId: undefined,
    content: undefined,
    messageType: undefined,
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
    senderId: [
      { required: true, message: "发送者ID不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "消息内容不能为空", trigger: "blur" }
    ],
    messageType: [
      { required: true, message: "消息类型不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询消息：用于记录聊天内容列表 */
const getList = async () => {
  loading.value = true;
  const res = await listChatMessage(queryParams.value);
  chatMessageList.value = res.rows;
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
  chatMessageFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ChatMessageVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加消息：用于记录聊天内容";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ChatMessageVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getChatMessage(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改消息：用于记录聊天内容";
}

/** 提交按钮 */
const submitForm = () => {
  chatMessageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateChatMessage(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addChatMessage(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ChatMessageVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除消息：用于记录聊天内容编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delChatMessage(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/chatMessage/export', {
    ...queryParams.value
  }, `chatMessage_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
