<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import {
  getLoginLogList,
  deleteLoginLog,
  clearLoginLog,
  type LoginLogInfo
} from "@/api/system";
import { ElMessageBox } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ri/search-line";
import DeleteIcon from "~icons/ri/delete-bin-line";
import RefreshIcon from "~icons/ri/refresh-line";

defineOptions({
  name: "LoginLog"
});

const loading = ref(false);
const dataList = ref<LoginLogInfo[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

const searchForm = reactive({
  username: "",
  status: undefined as number | undefined,
  startTime: "",
  endTime: ""
});

const columns = [
  { label: "ID", prop: "id", width: 80 },
  { label: "用户名", prop: "username", minWidth: 100 },
  { label: "IP地址", prop: "ip", width: 130 },
  { label: "登录地点", prop: "location", minWidth: 120 },
  { label: "浏览器", prop: "browser", minWidth: 150 },
  { label: "操作系统", prop: "os", minWidth: 120 },
  { label: "状态", prop: "status", width: 80, slot: "status" },
  { label: "消息", prop: "message", minWidth: 150 },
  { label: "登录时间", prop: "createdAt", minWidth: 160 },
  { label: "操作", fixed: "right", width: 120, slot: "operation" }
];

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getLoginLogList({
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.username || undefined,
      status: searchForm.status,
      startTime: searchForm.startTime || undefined,
      endTime: searchForm.endTime || undefined
    });
    if (res.code === 200) {
      dataList.value = res.data.list;
      total.value = res.data.total;
    } else {
      message(res.message, { type: "error" });
    }
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.username = "";
  searchForm.status = undefined;
  searchForm.startTime = "";
  searchForm.endTime = "";
  currentPage.value = 1;
  fetchData();
};

const handleDelete = (row: LoginLogInfo) => {
  ElMessageBox.confirm(`确定删除该登录日志吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const res = await deleteLoginLog(row.id);
    if (res.code === 200) {
      message("删除成功", { type: "success" });
      fetchData();
    } else {
      message(res.message, { type: "error" });
    }
  });
};

const handleClear = () => {
  ElMessageBox.confirm(`确定清空所有登录日志吗？此操作不可恢复！`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const res = await clearLoginLog();
    if (res.code === 200) {
      message("清空成功", { type: "success" });
      fetchData();
    } else {
      message(res.message, { type: "error" });
    }
  });
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">登录日志</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="成功" :value="1" />
              <el-option label="失败" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="searchForm.startTime"
              type="date"
              placeholder="选择开始时间"
              value-format="YYYY-MM-DD"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="searchForm.endTime"
              type="date"
              placeholder="选择结束时间"
              value-format="YYYY-MM-DD"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :icon="useRenderIcon(SearchIcon)"
              @click="handleSearch"
            >
              搜索
            </el-button>
            <el-button :icon="useRenderIcon(RefreshIcon)" @click="handleReset"
              >重置</el-button
            >
          </el-form-item>
        </el-form>

        <!-- 清空日志按钮 -->
        <el-button
          type="danger"
          :icon="useRenderIcon(DeleteIcon)"
          @click="handleClear"
        >
          清空日志
        </el-button>
      </div>

      <!-- 数据表格 -->
      <pure-table
        :data="dataList"
        :columns="columns"
        :loading="loading"
        row-key="id"
      >
        <template #status="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? "成功" : "失败" }}
          </el-tag>
        </template>
        <template #operation="{ row }">
          <el-button link type="danger" @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </pure-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-form {
  flex: 1;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
