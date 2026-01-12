<template>
  <div class="resource-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">资源管理</h1>
      <p class="page-subtitle">管理网站资源，支持上传、搜索和删除操作</p>
    </div>
    
    <!-- 搜索和统计区域 -->
    <div class="search-stats-container">
      <!-- 搜索功能 -->
      <div class="search-container">
        <el-input
          v-model="searchText"
          placeholder="输入资源名称或描述"
          clearable
          size="large"
          prefix-icon="Search"
          style="width: 350px; margin-right: 15px;"
          @keyup.enter="searchResource"
        ></el-input>
        <el-button type="primary" size="large" @click="searchResource">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button size="large" @click="resetSearch">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
      
      <!-- 资源统计 -->
      <div class="stats-container">
        <div class="stat-item">
          <el-icon class="stat-icon"><Picture /></el-icon>
          <div class="stat-content">
            <div class="stat-number">{{ allResources.length }}</div>
            <div class="stat-label">总资源数</div>
          </div>
        </div>
        <div class="stat-item">
          <el-icon class="stat-icon"><DocumentCheck /></el-icon>
          <div class="stat-content">
            <div class="stat-number">{{ filteredResources.length }}</div>
            <div class="stat-label">当前显示</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 资源上传卡片 -->
    <el-card class="upload-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Upload /></el-icon>
          <span>资源上传</span>
        </div>
      </template>
      
      <div class="upload-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="资源名称">
              <el-input
                v-model="resourceName"
                placeholder="例如：正念呼吸音乐/助眠视频"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资源描述">
              <el-input
                v-model="resourceDesc"
                placeholder="例如：10分钟正念呼吸放松音乐/5分钟助眠视频"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资源分类">
              <el-select
                v-model="resourceCategory"
                placeholder="选择资源分类"
                size="large"
              >
                <el-option label="减压" value="减压"></el-option>
                <el-option label="音乐" value="音乐"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="24">
            <el-form-item label="选择文件">
              <el-upload
                class="upload-demo"
                action="http://localhost:8082/api/admin/uploadResource"
                name="resourceFile"
                accept=".jpg,.png,.mp3,.mp4"
                :limit="1"
                :data="{ name: resourceName, desc: resourceDesc, category: resourceCategory }"
                @success="handleUploadSuccess"
                @error="handleUploadError"
                :file-list="fileList"
              >
                <el-button type="primary" size="large">
                  <el-icon><Plus /></el-icon>
                  点击选择文件
                </el-button>
                <div class="el-upload__tip">支持jpg/png/mp3/mp4文件，不超过20MB</div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 资源列表表格 -->
    <el-card class="table-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><Grid /></el-icon>
          <span>资源列表</span>
        </div>
      </template>
      
      <el-table 
        :data="filteredResources" 
        border 
        stripe
        style="width: 100%"
        empty-text="暂无资源数据，请先上传"
        :header-cell-style="{ background: '#f7fafc', fontWeight: '600' }"
      >
        <el-table-column prop="call_index" label="资源名称" width="200" align="center"></el-table-column>
        <el-table-column prop="zhaiyao" label="资源描述" width="350" align="center"></el-table-column>
        <el-table-column prop="category" label="资源分类" width="120" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.category === '减压' ? 'primary' : scope.row.category === '音乐' ? 'success' : 'warning'"
              size="small"
            >
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="资源预览" width="120" align="center">
          <template #default="scope">
            <el-image 
              :src="scope.row.img_url" 
              fit="cover" 
              style="width: 90px; height: 60px; border-radius: 6px; cursor: pointer;"
              :preview-src-list="[scope.row.img_url]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column label="资源路径" width="300" align="center">
          <template #default="scope">
            <a 
              :href="scope.row.img_url" 
              target="_blank" 
              class="resource-link"
            >
              {{ scope.row.img_url }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteResource(scope.row.id)"
              icon="Delete"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElCard, ElDivider, ElUpload, ElButton, ElTable, ElTableColumn, ElMessage, ElImage } from 'element-plus'

// 响应式变量
const tableData = ref([])  
const allResources = ref([]) // 存储所有资源，用于全局搜索
const resourceName = ref('')  
const resourceDesc = ref('')  
const resourceCategory = ref('减压') // 默认分类为减压
const fileList = ref([]) // 上传文件列表
const searchText = ref('') // 搜索关键字
const route = useRoute() // 获取当前路由

// 根据当前路由的category过滤资源
const filteredResources = computed(() => {
  // 获取当前路由的分类
  const currentCategory = route.meta.category
  
  // 如果没有指定分类，返回所有资源
  if (!currentCategory) {
    return tableData.value
  }
  
  // 根据分类过滤资源
  return tableData.value.filter(item => item.category === currentCategory)
})

// 页面加载时获取数据
onMounted(() => {
  getResourceList()
})

// 获取资源列表：确保前端能拿到完整数据
const getResourceList = async () => {
  try {
    const res = await axios.get('http://localhost:8082/api/getnewslist')
    console.log('后端返回数据：', res.data) 
    
    if (res.data.status === 0) {
      tableData.value = res.data.message // 直接使用后端返回的格式化数据
      allResources.value = res.data.message // 存储所有资源，用于全局搜索
      
      if (tableData.value.length === 0) {
        ElMessage.info('当前没有放松资源，请上传测试～')
      }
    } else {
      ElMessage.error('获取列表失败：' + res.data.message)
    }
  } catch (err) {
    ElMessage.error('获取列表失败：' + err.message)
    console.log('列表请求错误：', err)
  }
}

// 上传成功回调：即时添加到列表（不用等刷新）
const handleUploadSuccess = async (res) => {
  try {
    if (res.status === 0) {
      ElMessage.success('上传成功！')
      // 1. 清空输入框和文件列表
      resourceName.value = ''
      resourceDesc.value = ''
      fileList.value = []
      // 2. 把新上传的资源即时添加到表格（前端同步显示）
      tableData.value.unshift(res.data)
      // 3. 同步刷新前端页面数据（确保用户端也能看到）
      await getResourceList()
    } else {
      ElMessage.error('上传失败：' + res.message)
    }
  } catch (err) {
    ElMessage.error('上传回调出错：' + err.message)
  }
}

// 上传失败回调：精准提示错误
const handleUploadError = (err) => {
  let errorMsg = '上传失败：'
  if (err.message.includes('Unexpected field')) {
    errorMsg += '文件字段名称不匹配（前端name需为resourceFile）'
  } else if (err.message === '只能上传jpg/png/mp3/mp4文件！') {
    errorMsg += '文件类型错误，仅支持jpg/png/mp3/mp4'
  } else if (err.message.includes('File too large')) {
    errorMsg += '文件超过20MB，请压缩后上传'
  } else {
    errorMsg += err.message
  }
  ElMessage.error(errorMsg)
  console.log('上传错误详情：', err)
}

// 搜索资源
const searchResource = () => {
  if (!searchText.value.trim()) {
    // 搜索关键字为空，重新获取所有资源
    getResourceList()
    return
  }
  
  // 根据关键字在所有资源中进行全局搜索
  const keyword = searchText.value.trim().toLowerCase()
  const filteredData = allResources.value.filter(item => {
    // 检查资源名称和描述是否包含关键字
    const name = item.call_index?.toLowerCase() || ''
    const desc = item.zhaiyao?.toLowerCase() || ''
    return name.includes(keyword) || desc.includes(keyword)
  })
  
  // 更新表格数据
  if (filteredData.length === 0) {
    ElMessage.info('未找到匹配的资源')
  }
  
  // 这里应该直接调用后端搜索接口，我先模拟一下前端过滤
  // 实际应该调用：axios.get('/api/searchResource', { params: { keyword } })
  tableData.value = filteredData
}

// 删除资源：同步删除前端列表
const deleteResource = async (id) => {
  try {
    const res = await axios.post('http://localhost:8082/api/admin/deleteResource', { id })
    if (res.data.status === 0) {
      ElMessage.success('删除成功！')
      // 即时从表格中移除删除的资源
      tableData.value = tableData.value.filter(item => item.id !== id)
      // 同步刷新列表
      await getResourceList()
    } else {
      ElMessage.error('删除失败：' + res.data.message)
    }
  } catch (err) {
    ElMessage.error('删除出错：' + err.message)
    console.log('删除错误：', err)
  }
}
</script>

<style scoped>
/* 全局样式重置和基础设置 */
.resource-manage {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 70px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 页面标题样式 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #4a5568;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0;
}

/* 搜索和统计区域 */
.search-stats-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 25px;
}

/* 搜索容器 */
.search-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.search-container :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.search-container :deep(.el-input__wrapper:hover) {
  border-color: #6b46c1;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.search-container :deep(.el-input__wrapper.is-focus) {
  border-color: #6b46c1;
  box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
}

/* 按钮样式 */
.search-container :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-container :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.search-container :deep(.el-button--primary) {
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  border: none;
}

.search-container :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #553c9a 0%, #6b46c1 100%);
}

/* 统计区域 */
.stats-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  min-width: 200px;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 36px;
  color: #6b46c1;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #4a5568;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-top: 5px;
}

/* 卡片样式 */
.upload-card, .table-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.upload-card:hover, .table-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #4a5568;
}

/* 表单样式 */
.upload-form :deep(.el-form-item) {
  margin-bottom: 25px;
}

.upload-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.upload-form :deep(.el-input__wrapper),
.upload-form :deep(.el-select__wrapper) {
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.upload-form :deep(.el-input__wrapper:hover),
.upload-form :deep(.el-select__wrapper:hover) {
  border-color: #6b46c1;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.upload-form :deep(.el-input__wrapper.is-focus),
.upload-form :deep(.el-select__wrapper.is-focus) {
  border-color: #6b46c1;
  box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
}

/* 上传组件 */
.upload-form :deep(.el-upload__tip) {
  color: #718096;
  font-size: 13px;
}

/* 表格样式 */
.table-card :deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
}

.table-card :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
}

.table-card :deep(.el-table__header-wrapper th) {
  background: transparent;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  padding: 16px;
}

.table-card :deep(.el-table__body-wrapper tr) {
  transition: all 0.3s ease;
}

.table-card :deep(.el-table__body-wrapper tr:hover) {
  background: rgba(107, 70, 193, 0.05);
}

.table-card :deep(.el-table__body-wrapper td) {
  padding: 16px;
  text-align: center;
  color: #4a5568;
  font-size: 14px;
}

.table-card :deep(.el-table__body-wrapper tr.el-table__row--striped) {
  background: rgba(247, 250, 252, 0.8);
}

/* 资源链接样式 */
.resource-link {
  color: #6b46c1;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s ease;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(107, 70, 193, 0.05);
}

.resource-link:hover {
  color: #553c9a;
  background: rgba(107, 70, 193, 0.1);
  transform: translateY(-1px);
}

/* 操作按钮样式 */
.table-card :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 6px 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-card :deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.table-card :deep(.el-button--danger) {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  border: none;
}

.table-card :deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
}

/* 标签样式 */
.table-card :deep(.el-tag) {
  font-weight: 500;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 12px;
}

/* 图片预览样式 */
.table-card :deep(.el-image) {
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: zoom-in;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.table-card :deep(.el-image:hover) {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

/* 表格空数据样式 */
.table-card :deep(.el-table__empty-block) {
  padding: 60px 20px;
}

.table-card :deep(.el-table__empty-text) {
  color: #a0aec0;
  font-size: 16px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .resource-manage {
    padding: 15px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .page-title {
    font-size: 26px;
  }
  
  .stats-container {
    gap: 20px;
  }
  
  .stat-item {
    min-width: 160px;
    padding: 15px;
  }
  
  .search-container :deep(.el-input) {
    width: 280px !important;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container :deep(.el-input) {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
  
  .stats-container {
    flex-direction: column;
  }
  
  .stat-item {
    min-width: auto;
    justify-content: center;
  }
  
  .table-card :deep(.el-table) {
    font-size: 13px;
  }
  
  .table-card :deep(.el-table__body-wrapper td) {
    padding: 12px 8px;
  }
}
</style>