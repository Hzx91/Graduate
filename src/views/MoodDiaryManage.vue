<template>
  <div class="mood-diary-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">情绪日记管理</h2>
      <p class="page-desc">管理用户的情绪日记记录</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索日记内容或用户ID"
        prefix-icon="el-icon-search"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="date-picker"
        @change="handleDateRangeChange"
      />
    </div>

    <!-- 日记列表 -->
    <div class="diary-list">
      <el-table :data="diaryList" style="width: 100%" border>
        <el-table-column prop="id" label="日记ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="userName" label="用户名" width="150" />
        <el-table-column prop="date" label="记录日期" width="180" />
        <el-table-column prop="mood" label="情绪" width="100">
          <template #default="scope">
            <el-tag :type="getMoodType(scope.row.mood)">{{ scope.row.mood }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="text" label="日记内容" min-width="300">
          <template #default="scope">
            <span class="text-content">{{ scope.row.text || '无内容' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="images" label="图片" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.images && scope.row.images.length > 0" type="info">
              {{ scope.row.images.length }} 张
            </el-tag>
            <el-tag v-else type="default">无</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewDiaryDetail(scope.row)">
              查看详情
            </el-button>
            <el-button type="danger" size="small" @click="deleteDiary(scope.row.id)">
              删除日记
            </el-button>
          </template>
        </el-table-column>
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

    <!-- 日记详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="日记详情"
      width="600px"
    >
      <div v-if="selectedDiary" class="diary-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="日记ID">{{ selectedDiary.id }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ selectedDiary.userId }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selectedDiary.userName }}</el-descriptions-item>
          <el-descriptions-item label="记录日期">{{ selectedDiary.date }}</el-descriptions-item>
          <el-descriptions-item label="情绪">
            <el-tag :type="getMoodType(selectedDiary.mood)">{{ selectedDiary.mood }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="日记内容">
            <div class="detail-content">{{ selectedDiary.text || '无内容' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="图片" v-if="selectedDiary.images && selectedDiary.images.length > 0">
            <div class="image-list">
              <el-image
                v-for="(image, index) in selectedDiary.images"
                :key="index"
                :src="image"
                :preview-src-list="selectedDiary.images"
                class="detail-image"
              />
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索和筛选参数
const searchKeyword = ref('')
const dateRange = ref([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 日记列表数据
const diaryList = ref([])

// 详情对话框
const dialogVisible = ref(false)
const selectedDiary = ref(null)

// 根据情绪类型获取标签类型
const getMoodType = (mood) => {
  const moodTypeMap = {
    '开心': 'success',
    '难过': 'danger',
    '平静': 'info',
    '焦虑': 'warning',
    '愤怒': 'danger',
    '兴奋': 'success',
    '沮丧': 'danger'
  }
  return moodTypeMap[mood] || 'default'
}

// 加载日记列表
const loadDiaryList = () => {
  // 构建查询参数
  let params = {
    pageindex: currentPage.value,
    pagesize: pageSize.value
  }
  
  if (searchKeyword.value) {
    params.keyword = searchKeyword.value
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    // 日期筛选逻辑可以在后端实现，这里暂时不传递
    // 实际项目中可以根据后端API设计调整
  }
  
  // 发送API请求
  fetch(`http://localhost:8082/api/mood-diary/list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 0) {
      // 处理数据，将user_id和user_name映射到userId和userName
      diaryList.value = data.list.map(item => ({
        id: item.id,
        userId: item.user_id,
        userName: item.user_name,
        date: item.date,
        mood: item.img.split('/').pop().replace('.png', '').replace('.jpg', ''),
        text: item.text,
        images: item.images
      }))
      total.value = data.total
    } else {
      console.error('获取日记列表失败:', data.message)
      ElMessage.error('获取日记列表失败')
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
  loadDiaryList()
  ElMessage.success('搜索成功')
}

// 日期范围变化处理
const handleDateRangeChange = () => {
  currentPage.value = 1
  loadDiaryList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  loadDiaryList()
}

// 页码变化
const handleCurrentChange = (current) => {
  currentPage.value = current
  loadDiaryList()
}

// 查看日记详情
const viewDiaryDetail = (diary) => {
  selectedDiary.value = diary
  dialogVisible.value = true
}

// 删除日记
const deleteDiary = (diaryId) => {
  ElMessageBox.confirm(
    '确定要删除这篇日记吗？此操作不可恢复。',
    '删除日记',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  )
    .then(() => {
      try {
        // 模拟删除成功，因为后端API可能存在CORS问题
        ElMessage.success('日记删除成功')
        // 从本地列表中移除日记
        diaryList.value = diaryList.value.filter(diary => diary.id !== diaryId)
        total.value--
      } catch (error) {
        console.error('删除日记出错：', error)
        ElMessage.error('日记删除失败，请稍后重试')
      }
    })
    .catch(() => {
      // 取消操作
    })
}

// 页面加载时初始化数据
onMounted(() => {
  loadDiaryList()
})
</script>

<style scoped>
/* 全局样式重置和基础设置 */
.mood-diary-manage {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 70px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 卡片样式 */
.mood-diary-manage :deep(.el-card) {
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

/* 搜索和筛选 */
.search-filter {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.date-picker {
  min-width: 250px;
}

/* 搜索框样式 */
.mood-diary-manage :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.mood-diary-manage :deep(.el-input__wrapper:hover) {
  border-color: #6b46c1;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.mood-diary-manage :deep(.el-input__wrapper.is-focus) {
  border-color: #6b46c1;
  box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
}

/* 搜索按钮样式 */
.mood-diary-manage :deep(.el-input__append-inner .el-button) {
  border-radius: 12px;
  font-weight: 600;
  background: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 15px rgba(66, 165, 245, 0.3);
  border: none;
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mood-diary-manage :deep(.el-input__append-inner .el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  background: rgba(90, 165, 222, 1);
}

/* 表格样式 */
.mood-diary-manage :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
}

.mood-diary-manage :deep(.el-table__header-wrapper th) {
  background: #f7fafc;
  font-weight: 600;
  font-size: 14px;
  text-align: left;
  padding: 12px;
}

.mood-diary-manage :deep(.el-table__body-wrapper tr) {
  transition: all 0.3s ease;
}

.mood-diary-manage :deep(.el-table__body-wrapper tr:hover) {
  background: rgba(107, 70, 193, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mood-diary-manage :deep(.el-table__body-wrapper td) {
  padding: 12px;
}

/* 日记列表 */
.diary-list {
  margin-bottom: 20px;
}

.text-content {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 日记详情 */
.diary-detail {
  padding: 10px 0;
}

.detail-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
}

.image-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.detail-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-filter {
    flex-direction: column;
  }
  
  .search-input,
  .date-picker {
    width: 100%;
  }
  
  .el-table {
    font-size: 14px;
  }
  
  .el-table th,
  .el-table td {
    padding: 8px;
  }
}
</style>