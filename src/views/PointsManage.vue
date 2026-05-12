<template>
  <div class="points-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">积分管理</h2>
      <p class="page-desc">管理用户的积分信息，查看积分来源明细</p>
    </div>

    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名或昵称"
        prefix-icon="el-icon-search"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 用户积分统计卡片 -->
    <div class="user-cards">
      <div
        v-for="user in pointsList"
        :key="user.user_id"
        class="user-card"
        :class="{
          active: selectedUser && selectedUser.user_id === user.user_id,
        }"
        @click="selectUser(user)"
      >
        <div class="user-info">
          <div class="user-avatar">
            <img
              v-if="user.avatar"
              :src="getAvatarUrl(user.avatar)"
              alt="avatar"
            />
            <span v-else class="avatar-placeholder">{{
              getNameInitial(user.nick_name || user.user_name)
            }}</span>
          </div>
          <div class="user-details">
            <div class="user-name">
              {{ user.nick_name || user.user_name || "未知用户" }}
            </div>
            <div class="user-id">ID: {{ user.user_name }}</div>
          </div>
        </div>
        <div class="user-points">
          <div class="total-points">
            <span class="points-label">总积分</span>
            <span class="points-value">{{ user.points || 0 }}</span>
          </div>
          <div class="points-breakdown">
            <span class="breakdown-item sign-in"
              >签到: {{ user.sign_in_points || 0 }}</span
            >
            <span class="breakdown-item mood"
              >情绪: {{ user.mood_points || 0 }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 选中用户的详细积分记录 -->
    <div class="detail-section" v-if="selectedUser">
      <div class="detail-header">
        <h3>
          {{ selectedUser.nick_name || selectedUser.user_name }} 的积分明细
        </h3>
        <el-button type="text" @click="selectedUser = null">关闭</el-button>
      </div>

      <!-- 统计概览 -->
      <div class="stats-overview">
        <div class="stat-card total">
          <div class="stat-icon">💎</div>
          <div class="stat-info">
            <div class="stat-label">总积分</div>
            <div class="stat-value">{{ selectedUser.points || 0 }}</div>
          </div>
        </div>
        <div class="stat-card sign-in">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-label">签到积分</div>
            <div class="stat-value">{{ selectedUser.sign_in_points || 0 }}</div>
          </div>
          <div class="stat-count">{{ selectedUser.sign_in_count || 0 }}次</div>
        </div>
        <div class="stat-card mood">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <div class="stat-label">情绪记录</div>
            <div class="stat-value">{{ selectedUser.mood_points || 0 }}</div>
          </div>
          <div class="stat-count">{{ selectedUser.mood_count || 0 }}次</div>
        </div>
        <div class="stat-card other">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <div class="stat-label">其他来源</div>
            <div class="stat-value">{{ selectedUser.other_points || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- 积分记录列表 -->
      <div class="records-section">
        <h4>积分记录明细</h4>
        <el-table :data="pointsRecords" style="width: 100%" border stripe>
          <el-table-column prop="created_at" label="时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="source" label="来源" width="120">
            <template #default="scope">
              <el-tag :type="getSourceTagType(scope.row.source)">{{
                getSourceName(scope.row.source)
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="points_change" label="积分变动" width="100">
            <template #default="scope">
              <span
                :class="scope.row.points_change >= 0 ? 'positive' : 'negative'"
              >
                {{ scope.row.points_change >= 0 ? "+" : ""
                }}{{ scope.row.points_change }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="record_date" label="记录日期" width="120" />
        </el-table>

        <div class="records-pagination">
          <el-pagination
            v-model:current-page="recordsPage"
            :page-size="10"
            layout="total, prev, pager, next"
            :total="recordsTotal"
            @current-change="loadUserRecords"
          />
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="!selectedUser">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";

// 搜索参数
const searchKeyword = ref("");

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 积分列表数据
const pointsList = ref([]);

// 选中的用户
const selectedUser = ref(null);
const pointsRecords = ref([]);
const recordsPage = ref(1);
const recordsTotal = ref(0);

// 加载积分列表
const loadPointsList = () => {
  let params = {
    pageindex: currentPage.value,
    pagesize: pageSize.value,
  };

  if (searchKeyword.value) {
    params.keyword = searchKeyword.value;
  }

  const queryString = new URLSearchParams(params).toString();

  fetch(`http://localhost:8082/api/admin/user-points?${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 0) {
        pointsList.value = data.list;
        total.value = data.total;
      } else {
        console.error("获取积分列表失败:", data.message);
        ElMessage.error("获取积分列表失败");
      }
    })
    .catch((error) => {
      console.error("网络错误:", error);
      ElMessage.error("网络错误，请稍后重试");
    });
};

// 选择用户查看详情
const selectUser = (user) => {
  selectedUser.value = user;
  recordsPage.value = 1;
  loadUserRecords();
};

// 加载用户积分记录
const loadUserRecords = () => {
  if (!selectedUser.value) return;

  fetch(
    `http://localhost:8082/api/user/${selectedUser.value.user_id}/points-records?page=${recordsPage.value}&size=10`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 0) {
        pointsRecords.value = data.list || [];
        recordsTotal.value = data.total || data.list?.length || 0;
      } else {
        pointsRecords.value = [];
      }
    })
    .catch((error) => {
      console.error("获取积分记录失败:", error);
      pointsRecords.value = [];
    });
};

// 获取头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return "";
  if (avatar.startsWith("http")) return avatar;
  return `http://localhost:8082${avatar}`;
};

// 获取名字首字母
const getNameInitial = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取来源名称
const getSourceName = (source) => {
  const sourceMap = {
    sign_in: "签到",
    daily_sign: "每日签到",
    mood_record: "情绪记录",
    post: "发帖",
    comment: "评论",
    like: "点赞",
    collect: "收藏",
    other: "其他",
  };
  return sourceMap[source] || source || "其他";
};

// 获取来源标签类型
const getSourceTagType = (source) => {
  const typeMap = {
    sign_in: "success",
    daily_sign: "success",
    mood_record: "warning",
    post: "primary",
    comment: "info",
    like: "danger",
    collect: "warning",
  };
  return typeMap[source] || "";
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  loadPointsList();
};

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadPointsList();
};

// 页码变化
const handleCurrentChange = (current) => {
  currentPage.value = current;
  loadPointsList();
};

// 页面加载时初始化数据
onMounted(() => {
  loadPointsList();
});
</script>

<style scoped>
.points-manage {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 70px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 15px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 5px 0;
  padding-bottom: 15px;
  background: rgba(90, 165, 222, 0.7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 搜索容器 */
.search-container {
  margin-bottom: 20px;
}

.search-input {
  max-width: 400px;
}

/* 用户卡片列表 */
.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.user-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.user-card.active {
  border-color: rgba(90, 165, 222, 0.7);
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
}

.user-card .user-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(90, 165, 222, 0.7),
    rgba(64, 144, 223, 0.9)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.user-points .total-points {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.points-label {
  font-size: 14px;
  color: #666;
}

.points-value {
  font-size: 24px;
  font-weight: bold;
  color: rgba(90, 165, 222, 0.9);
}

.points-breakdown {
  display: flex;
  gap: 8px;
}

.breakdown-item {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f5f7ff;
  color: #666;
}

.breakdown-item.sign-in {
  background: #e8f5e9;
  color: #2e7d32;
}

.breakdown-item.mood {
  background: #fff3e0;
  color: #e65100;
}

.breakdown-item.other {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* 详情区域 */
.detail-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f4ff 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.stat-card.total {
  background: linear-gradient(
    135deg,
    rgba(90, 165, 222, 0.15),
    rgba(64, 144, 223, 0.2)
  );
}

.stat-card.sign-in {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
}

.stat-card.mood {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
}

.stat-card.other {
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-count {
  font-size: 12px;
  color: #666;
  position: absolute;
  bottom: 12px;
  right: 16px;
}

/* 记录列表 */
.records-section {
  margin-top: 20px;
}

.records-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.positive {
  color: #67c23a;
  font-weight: bold;
}

.negative {
  color: #f56c6c;
  font-weight: bold;
}

.records-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 搜索框样式 */
.points-manage :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.points-manage :deep(.el-input__wrapper:hover) {
  border-color: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.points-manage :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
}

.points-manage :deep(.el-input__append-inner .el-button) {
  border-radius: 12px;
  font-weight: 600;
  background: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 15px rgba(66, 165, 245, 0.3);
  border: none;
  color: #fff;
  transition: all 0.3s ease;
}

.points-manage :deep(.el-input__append-inner .el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  background: rgba(90, 165, 222, 1);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
