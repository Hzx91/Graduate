<template>
  <div class="points-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">积分管理</h2>
      <p class="page-desc">管理用户的积分信息</p>
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

    <!-- 积分列表 -->
    <div class="points-list">
      <el-table :data="pointsList" style="width: 100%" border>
        <el-table-column prop="user_name" label="用户ID" width="150" />
        <el-table-column prop="nick_name" label="昵称" width="150" />
        <el-table-column prop="points" label="积分" width="100">
          <template #default="scope">
            <el-tag type="success">{{ scope.row.points }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_update" label="最后更新时间" width="200" />
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索参数
const searchKeyword = ref('')

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 积分列表数据
const pointsList = ref([])

// 加载积分列表
const loadPointsList = () => {
  // 构建查询参数
  let params = {
    pageindex: currentPage.value,
    pagesize: pageSize.value
  }
  
  if (searchKeyword.value) {
    params.keyword = searchKeyword.value
  }
  
  // 发送API请求
  fetch(`http://localhost:8082/api/admin/user-points`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 0) {
      pointsList.value = data.list
      total.value = data.total
    } else {
      console.error('获取积分列表失败:', data.message)
      ElMessage.error('获取积分列表失败')
    }
  })
  .catch(error => {
    console.error('网络错误:', error)
    ElMessage.error('网络错误，请稍后重试')
  })
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadPointsList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  loadPointsList()
}

// 页码变化
const handleCurrentChange = (current) => {
  currentPage.value = current
  loadPointsList()
}

// 页面加载时初始化数据
onMounted(() => {
  loadPointsList()
})
</script>

<style scoped>
/* 全局样式重置和基础设置 */
.points-manage {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 70px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 卡片样式 */
.points-manage :deep(.el-card) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
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

/* 搜索框样式 */
.points-manage :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.points-manage :deep(.el-input__wrapper:hover) {
  border-color: #6b46c1;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.points-manage :deep(.el-input__wrapper.is-focus) {
  border-color: #6b46c1;
  box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
}

/* 搜索按钮样式 */
.points-manage :deep(.el-input__append-inner .el-button) {
  border-radius: 12px;
  font-weight: 600;
  background: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 15px rgba(66, 165, 245, 0.3);
  border: none;
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.points-manage :deep(.el-input__append-inner .el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  background: rgba(90, 165, 222, 1);
}

/* 表格样式 */
.points-manage :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
}

.points-manage :deep(.el-table__header-wrapper th) {
  background: #f7fafc;
  font-weight: 600;
  font-size: 14px;
  text-align: left;
  padding: 12px;
}

.points-manage :deep(.el-table__body-wrapper tr) {
  transition: all 0.3s ease;
}

.points-manage :deep(.el-table__body-wrapper tr:hover) {
  background: rgba(107, 70, 193, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.points-manage :deep(.el-table__body-wrapper td) {
  padding: 12px;
}

/* 积分列表 */
.points-list {
  margin-bottom: 20px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }
  
  .el-table {
    font-size: 14px;
  }
  
  .el-table-column {
    min-width: 100px;
  }
}
</style>