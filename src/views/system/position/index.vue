<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="职位编号" prop="code">
              <el-input v-model="queryParams.code" placeholder="请输入职位编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="职位名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入职位名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="职位描述" prop="description">
              <el-input v-model="queryParams.description" placeholder="请输入职位描述" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="创建时间" prop="createdAt">
              <el-date-picker clearable
                v-model="queryParams.createdAt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择创建时间"
              />
            </el-form-item>
            <el-form-item label="更新时间" prop="updatedAt">
              <el-date-picker clearable
                v-model="queryParams.updatedAt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择更新时间"
              />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:position:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:position:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:position:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:position:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="positionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="自增主键ID" align="center" prop="id" v-if="true" />
        <el-table-column label="职位编号" align="center" prop="code" />
        <el-table-column label="职位名称" align="center" prop="name" />
        <el-table-column label="职位描述" align="center" prop="description" />
        <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:position:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:position:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改系统职位管理对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="positionFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="职位编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入职位编号" />
        </el-form-item>
        <el-form-item label="职位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入职位名称" />
        </el-form-item>
        <el-form-item label="职位描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createdAt">
          <el-date-picker clearable
            v-model="form.createdAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="更新时间" prop="updatedAt">
          <el-date-picker clearable
            v-model="form.updatedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择更新时间">
          </el-date-picker>
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

<script setup name="Position" lang="ts">
import { listPosition, getPosition, delPosition, addPosition, updatePosition } from '@/api/system/position';
import { PositionVO, PositionQuery, PositionForm } from '@/api/system/position/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const positionList = ref<PositionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const positionFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PositionForm = {
  id: undefined,
  code: undefined,
  name: undefined,
  description: undefined,
  createdAt: undefined,
  updatedAt: undefined
}
const data = reactive<PageData<PositionForm, PositionQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    code: undefined,
    name: undefined,
    description: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "自增主键ID不能为空", trigger: "blur" }
    ],
    code: [
      { required: true, message: "职位编号不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "职位名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询系统职位管理列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPosition(queryParams.value);
  positionList.value = res.rows;
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
  positionFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PositionVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加系统职位管理";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: PositionVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getPosition(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改系统职位管理";
}

/** 提交按钮 */
const submitForm = () => {
  positionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updatePosition(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPosition(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: PositionVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除系统职位管理编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delPosition(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/position/export', {
    ...queryParams.value
  }, `position_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
