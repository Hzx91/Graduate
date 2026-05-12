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
          <el-icon class="stat-icon"><Check /></el-icon>
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
                :prefix-icon="Search"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资源描述">
              <el-input
                v-model="resourceDesc"
                placeholder="例如：10分钟正念呼吸放松音乐/5分钟助眠视频"
                size="large"
                :prefix-icon="Document"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资源分类">
              <el-select
                v-model="resourceCategory"
                placeholder="选择资源分类"
                size="large"
                :prefix-icon="Grid"
              >
                <el-option label="减压" value="减压"></el-option>
                <el-option label="白噪音" value="白噪音"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        
        <el-row>
          <el-col :span="24">
            <el-form-item label="选择文件">
              <div class="upload-container">
                <el-upload
                  class="upload-demo"
                  action="http://localhost:8082/api/admin/uploadResource"
                  name="resourceFile"
                  :accept="uploadAccept"
                  :limit="1"
                  :data="{ name: resourceName, desc: resourceDesc, category: resourceCategory }"
                  @success="handleUploadSuccess"
                  @error="handleUploadError"
                  :file-list="fileList"
                  :drag="false"
                >
                  <div class="upload-area">
                    <div class="upload-icon">
                      <el-icon class="upload-icon-small"><Upload /></el-icon>
                    </div>
                    <div class="upload-text">
                      <h4>点击选择文件</h4>
                      <p>{{ uploadTips }}</p>
                    </div>
                  </div>
                </el-upload>
              </div>
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
      
      <!-- 批量操作工具栏 -->
      <div class="batch-actions" v-if="filteredResources.length > 0">
        <div class="batch-left">
          <el-checkbox 
            v-model="selectAll" 
            @change="handleSelectAll"
            :indeterminate="isIndeterminate"
          >全选</el-checkbox>
          <span class="selected-count" v-if="selectedResources.length > 0">
            已选择 {{ selectedResources.length }} 项
          </span>
        </div>
        <div class="batch-right">
          <el-button 
            type="danger" 
            :disabled="selectedResources.length === 0"
            @click="batchDelete"
            class="batch-btn"
          >
            批量删除
          </el-button>
        </div>
      </div>
      
      <el-table 
        :data="filteredResources" 
        border 
        style="width: 100%; margin-top: 15px;"
        @selection-change="handleSelectionChange"
        empty-text="暂无资源数据，请先上传"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="call_index" label="资源名称" width="150"></el-table-column>
        <el-table-column prop="zhaiyao" label="资源描述" min-width="200"></el-table-column>
        <el-table-column prop="category" label="资源分类" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.category === '减压' ? 'primary' : scope.row.category === '音乐' ? 'success' : 'warning'"
              size="small"
            >
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="资源预览" width="120">
          <template #default="scope">
            <div v-if="isVideo(scope.row.img_url)" class="video-preview">
              <video 
                :src="scope.row.img_url" 
                controls 
                style="width: 100px; height: 60px; border-radius: 4px;"
                poster="/images/video-placeholder.png"
              ></video>
            </div>
            <el-image 
              v-else
              :src="scope.row.img_url" 
              fit="cover" 
              style="width: 100px; height: 60px; border-radius: 4px; cursor: pointer;"
              :preview-src-list="[scope.row.img_url]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column label="资源路径" min-width="200">
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="editResource(scope.row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteResource(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 编辑资源弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑资源"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="100px" class="edit-form">
        <el-form-item label="资源名称">
          <el-input v-model="editForm.name" placeholder="请输入资源名称"></el-input>
        </el-form-item>
        <el-form-item label="资源描述">
          <el-input 
            v-model="editForm.desc" 
            type="textarea"
            :rows="3"
            placeholder="请输入资源描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="资源分类">
          <el-select v-model="editForm.category" placeholder="选择资源分类" style="width: 100%;">
            <el-option label="减压" value="减压"></el-option>
            <el-option label="白噪音" value="白噪音"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源预览">
          <div v-if="editForm.img_url && isVideo(editForm.img_url)" class="video-preview">
            <video 
              :src="editForm.img_url" 
              controls 
              style="width: 120px; height: 80px; border-radius: 8px;"
              poster="/images/video-placeholder.png"
            ></video>
          </div>
          <el-image 
            v-else-if="editForm.img_url"
            :src="editForm.img_url" 
            fit="cover" 
            style="width: 120px; height: 80px; border-radius: 8px;"
            :preview-src-list="[editForm.img_url]"
          ></el-image>
          <span v-else class="no-preview">暂无预览图</span>
        </el-form-item>
        <el-form-item label="替换资源文件">
          <div class="upload-container">
            <el-upload
              class="upload-demo"
              action="http://localhost:8082/api/admin/updateResource"
              name="resourceFile"
              :accept="getEditAccept()"
              :limit="1"
              :data="{ id: editForm.id, name: editForm.name, desc: editForm.desc, category: editForm.category }"
              @success="handleEditUploadSuccess"
              @error="handleEditUploadError"
              :file-list="editFileList"
              :drag="false"
            >
              <div class="upload-area">
                <div class="upload-icon">
                  <el-icon class="upload-icon-small"><Upload /></el-icon>
                </div>
                <div class="upload-text">
                  <h4>点击选择文件</h4>
                  <p>{{ getEditTips() }}</p>
                </div>
              </div>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveEditWithoutFile">保存文字修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElCard, ElDivider, ElUpload, ElButton, ElTable, ElTableColumn, ElMessage, ElImage, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus'
import { Search, Document, Grid, Upload, Plus, Refresh, Picture, Check, Edit } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

// 响应式变量
const tableData = ref([])  
const allResources = ref([]) // 存储所有资源，用于全局搜索
const resourceName = ref('')  
const resourceDesc = ref('')  
const resourceCategory = ref('减压') // 默认分类为减压
const resourceTags = ref('') // 适用场景
const fileList = ref([]) // 上传文件列表

// 根据分类动态生成上传接受类型
const uploadAccept = computed(() => {
  switch (resourceCategory.value) {
    case '白噪音':
      return '.mp3,.wav,.ogg,.flac,.aac,.wma'
    case '减压':
      return '.jpg,.png'
    case '其他':
    default:
      return '.jpg,.png,.mp4,.webm,.avi,.mov'
  }
})

// 根据分类动态生成上传提示
const uploadTips = computed(() => {
  switch (resourceCategory.value) {
    case '白噪音':
      return '支持mp3/wav/ogg/flac/aac/wma音频文件，不超过20MB'
    case '减压':
      return '支持jpg/png图片文件，不超过20MB'
    case '其他':
    default:
      return '支持jpg/png图片和mp4/webm/avi/mov视频文件，不超过50MB'
  }
})

// 判断是否是视频文件
const isVideo = (url) => {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv']
  const lowerUrl = url.toLowerCase()
  return videoExtensions.some(ext => lowerUrl.includes(ext))
}

// 编辑时获取文件上传接受类型
const getEditAccept = () => {
  switch (editForm.value.category) {
    case '白噪音':
      return '.mp3,.wav,.ogg,.flac,.aac,.wma'
    case '减压':
      return '.jpg,.png'
    case '其他':
    default:
      return '.jpg,.png,.mp4,.webm,.avi,.mov'
  }
}

// 编辑时获取文件上传提示
const getEditTips = () => {
  switch (editForm.value.category) {
    case '白噪音':
      return '支持mp3/wav/ogg/flac/aac/wma音频文件'
    case '减压':
      return '支持jpg/png图片文件'
    case '其他':
    default:
      return '支持jpg/png图片和mp4/webm/avi/mov视频文件'
  }
}
const searchText = ref('') // 搜索关键字
const route = useRoute() // 获取当前路由

// 批量选择相关
const selectedResources = ref([])
const selectAll = ref(false)
const isIndeterminate = ref(false)

// 编辑资源相关
const editDialogVisible = ref(false)
const editForm = ref({
  id: '',
  name: '',
  desc: '',
  category: '',
  img_url: ''
})
const editFileList = ref([]) // 编辑时的文件列表

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
      resourceCategory.value = '减压'
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
      // 更新选择状态
      updateSelectionAfterDelete(id)
    } else {
      ElMessage.error('删除失败：' + res.data.message)
    }
  } catch (err) {
    ElMessage.error('删除出错：' + err.message)
    console.log('删除错误：', err)
  }
}

// ==================== 批量操作相关函数 ====================

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedResources.value = selection
  // 更新全选状态
  if (selection.length === 0) {
    selectAll.value = false
    isIndeterminate.value = false
  } else if (selection.length === filteredResources.value.length) {
    selectAll.value = true
    isIndeterminate.value = false
  } else {
    selectAll.value = false
    isIndeterminate.value = true
  }
}

// 全选/取消全选
const handleSelectAll = (checked) => {
  if (checked) {
    selectedResources.value = [...filteredResources.value]
  } else {
    selectedResources.value = []
  }
  isIndeterminate.value = false
}

// 批量删除
const batchDelete = async () => {
  if (selectedResources.value.length === 0) {
    ElMessage.warning('请先选择要删除的资源')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedResources.value.length} 个资源吗？此操作不可恢复！`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 获取所有要删除的资源ID
    const idsToDelete = selectedResources.value.map(item => item.id)
    
    // 使用循环单个删除（如果后端没有批量API）
    const deletePromises = idsToDelete.map(id => 
      axios.post('http://localhost:8082/api/admin/deleteResource', { id })
    )
    
    const results = await Promise.all(deletePromises)
    const successCount = results.filter(r => r.data.status === 0).length
    
    ElMessage.success(`成功删除 ${successCount} 个资源`)
    
    // 清空选择
    clearSelection()
    
    // 刷新列表
    await getResourceList()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量删除失败:', err)
      ElMessage.error('批量删除失败')
    }
  }
}

// 更新删除后的选择状态
const updateSelectionAfterDelete = (deletedId) => {
  selectedResources.value = selectedResources.value.filter(item => item.id !== deletedId)
  // 重新检查全选状态
  if (selectedResources.value.length === 0) {
    selectAll.value = false
    isIndeterminate.value = false
  } else if (selectedResources.value.length === filteredResources.value.length) {
    selectAll.value = true
    isIndeterminate.value = false
  } else {
    selectAll.value = false
    isIndeterminate.value = true
  }
}

// 清空选择状态
const clearSelection = () => {
  selectedResources.value = []
  selectAll.value = false
  isIndeterminate.value = false
}

// ==================== 编辑资源相关函数 ====================

// 打开编辑弹窗
const editResource = (row) => {
  editForm.value = {
    id: row.id,
    name: row.call_index || '',
    desc: row.zhaiyao || '',
    category: row.category || '减压',
    img_url: row.img_url || ''
  }
  editFileList.value = []
  editDialogVisible.value = true
}

// 取消编辑
const cancelEdit = () => {
  editDialogVisible.value = false
  editFileList.value = []
}

// 保存编辑（仅文字修改）
const saveEditWithoutFile = async () => {
  if (!editForm.value.name.trim()) {
    ElMessage.warning('请输入资源名称')
    return
  }
  
  if (!editForm.value.desc.trim()) {
    ElMessage.warning('请输入资源描述')
    return
  }
  
  try {
    const res = await axios.post('http://localhost:8082/api/admin/updateResource', {
      id: editForm.value.id,
      name: editForm.value.name,
      desc: editForm.value.desc,
      category: editForm.value.category
    })
    
    if (res.data.status === 0) {
      ElMessage.success('编辑成功！')
      editDialogVisible.value = false
      editFileList.value = []
      // 刷新列表
      await getResourceList()
    } else {
      ElMessage.error('编辑失败：' + res.data.message)
    }
  } catch (err) {
    console.error('编辑失败:', err)
    ElMessage.error('编辑失败')
  }
}

// 编辑上传成功回调
const handleEditUploadSuccess = async (res) => {
  try {
    if (res.status === 0) {
      ElMessage.success('资源文件替换成功！')
      editDialogVisible.value = false
      editFileList.value = []
      // 刷新列表
      await getResourceList()
    } else {
      ElMessage.error('替换失败：' + res.message)
    }
  } catch (err) {
    ElMessage.error('替换回调出错：' + err.message)
  }
}

// 编辑上传失败回调
const handleEditUploadError = (err) => {
  let errorMsg = '替换失败：'
  if (err.message.includes('Unexpected field')) {
    errorMsg += '文件字段名称不匹配（前端name需为resourceFile）'
  } else if (err.message.includes('File too large')) {
    errorMsg += '文件超过20MB，请压缩后上传'
  } else {
    errorMsg += err.message
  }
  ElMessage.error(errorMsg)
  console.log('替换错误详情：', err)
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
  background: rgba(90, 165, 222, 0.7);
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
  border-color:rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.search-container :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 16px rgba(90, 165, 222, 0.4);
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
  background: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 15px rgba(66, 165, 245, 0.3);
  border: none;
}

.search-container :deep(.el-button--primary:hover) {
  background: rgba(90, 165, 222, 1);
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
  color: rgba(90, 165, 222, 0.7);
  
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
  border-color: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 16px rgba(90, 165, 222, 0.3);
}

.upload-form :deep(.el-input__wrapper.is-focus),
.upload-form :deep(.el-select__wrapper.is-focus) {
  border-color: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 16px rgba(90, 165, 222, 0.4);
}

/* 上传容器 */
.upload-container {
  margin-top: 20px;
}

/* 上传区域 */
.upload-form :deep(.el-upload) {
  width: 100%;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  border: 2px dashed rgba(90, 165, 222, 0.3);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(247, 250, 252, 0.8) 0%, rgba(237, 242, 247, 0.8) 100%);
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 120px;
}

.upload-area:hover {
  border-color: rgba(90, 165, 222, 0.7);
  background: linear-gradient(135deg, rgba(247, 250, 252, 1) 0%, rgba(237, 242, 247, 1) 100%);
  box-shadow: 0 4px 16px rgba(90, 165, 222, 0.2);
  transform: translateY(-1px);
}

/* 上传图标 */
.upload-icon {
  margin-bottom: 10px;
  animation: pulse 2s infinite;
}

.upload-icon-small {
  font-size: 24px;
  color: rgba(90, 165, 222, 0.7);
  transition: all 0.3s ease;
}

.upload-area:hover .upload-icon-small {
  color: rgba(90, 165, 222, 1);
  transform: scale(1.1);
}

/* 上传文本 */
.upload-text {
  text-align: center;
}

.upload-text h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  transition: all 0.3s ease;
}

.upload-text p {
  margin: 0;
  font-size: 12px;
  color: #718096;
  transition: all 0.3s ease;
}

.upload-area:hover .upload-text h4 {
  color: #2d3748;
}

.upload-area:hover .upload-text p {
  color: #4a5568;
}

/* 上传提示 */
.upload-form :deep(.el-upload__tip) {
  color: #8bc0e8;
  font-size: 13px;
  text-align: center;
  margin-top: 15px;
  font-weight: 500;
}

/* 已上传文件列表 */
.upload-form :deep(.el-upload-list) {
  margin-top: 15px;
}

.upload-form :deep(.el-upload-list__item) {
  border-radius: 8px;
  border: 1px solid rgba(90, 165, 222, 0.3);
  transition: all 0.3s ease;
}

.upload-form :deep(.el-upload-list__item:hover) {
  border-color: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 12px rgba(90, 165, 222, 0.2);
}

.upload-form :deep(.el-upload-list__item-name) {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.upload-form :deep(.el-upload-list__item-status-label) {
  font-size: 12px;
  font-weight: 500;
}

.upload-form :deep(.el-upload-list__item-actions) {
  opacity: 0;
  transition: all 0.3s ease;
}

.upload-form :deep(.el-upload-list__item:hover .el-upload-list__item-actions) {
  opacity: 1;
}

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 文件类型图标 */
.upload-form :deep(.el-upload-list__item-icon) {
  font-size: 24px;
  color: rgba(90, 165, 222, 0.7);
}

.upload-form :deep(.el-upload-list__item-icon.el-icon-picture) {
  color: #38a169;
}

.upload-form :deep(.el-upload-list__item-icon.el-icon-music) {
  color: #805ad5;
}

.upload-form :deep(.el-upload-list__item-icon.el-icon-video-camera) {
  color: #dd6b20;
}

/* 表格样式 */
.table-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table__header-wrapper th) {
  background: #f7fafc;
  font-weight: 600;
  font-size: 14px;
  text-align: left;
  padding: 12px;
}

.table-card :deep(.el-table__body-wrapper tr) {
  transition: all 0.3s ease;
}

.table-card :deep(.el-table__body-wrapper tr:hover) {
  background: rgba(90, 165, 222, 0.05);
}

.table-card :deep(.el-table__body-wrapper td) {
  padding: 12px;
  text-align: left;
  color: #4a5568;
  font-size: 14px;
}

.table-card :deep(.el-table__body-wrapper tr.el-table__row--striped) {
  background: rgba(247, 250, 252, 0.8);
}

/* 资源链接样式 */
.resource-link {
  color: rgba(90, 165, 222, 0.7);
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
  color: rgba(90, 165, 222, 0.7);
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
  
  /* 移动端批量操作工具栏 */
  .batch-actions {
    flex-direction: column;
    gap: 12px;
    padding: 12px 15px;
  }
  
  .batch-left {
    width: 100%;
    justify-content: space-between;
  }
  
  .batch-right {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .batch-btn {
    flex: 1;
    max-width: 200px;
  }
}

/* 批量操作工具栏样式 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(180deg,
		  rgba(173, 216, 255, 0.9) 0%,    /* 浅冰蓝 */
		  rgba(135, 206, 235, 0.9) 50%,  /* 中冰蓝 */
		  rgba(96, 168, 230, 0.9) 100%   /* 深冰蓝 */
		);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.batch-actions:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.batch-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.batch-left :deep(.el-checkbox) {
  color: #fff;
  font-weight: 600;
}

.batch-left :deep(.el-checkbox__label) {
  color: #fff !important;
  font-weight: 600;
  font-size: 14px;
}

.batch-left :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #fff;
  border-color: #fff;
}

.batch-left :deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #667eea;
}

.batch-left :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #fff;
  border-color: #fff;
}

.batch-left :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner::before) {
  background-color: #667eea;
  border-color: #667eea;
}

.selected-count {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.batch-right {
  display: flex;
  gap: 10px;
}

.batch-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 16px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.batch-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.batch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.batch-right :deep(.el-button--danger) {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  border: none;
}

.batch-right :deep(.el-button--danger):not(:disabled):hover {
  background: linear-gradient(135deg, #e6395c 0%, #e64425 100%);
}

/* 编辑表单样式 */
.edit-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.edit-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #4a5568;
}

.edit-form :deep(.el-input__wrapper),
.edit-form :deep(.el-select__wrapper),
.edit-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.edit-form :deep(.el-input__wrapper:hover),
.edit-form :deep(.el-select__wrapper:hover),
.edit-form :deep(.el-textarea__inner:hover) {
  border-color: rgba(90, 165, 222, 0.7);
}

.edit-form :deep(.el-input__wrapper.is-focus),
.edit-form :deep(.el-select__wrapper.is-focus),
.edit-form :deep(.el-textarea__inner:focus) {
  border-color: rgba(90, 165, 222, 0.7);
  box-shadow: 0 0 0 3px rgba(90, 165, 222, 0.1);
}

.no-preview {
  color: #a0aec0;
  font-size: 14px;
}

/* 编辑弹窗样式 */
.resource-manage :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
}

.resource-manage :deep(.el-dialog__header) {
  background: linear-gradient(180deg, rgba(173, 216, 255, 0.9) 0%, /* 浅冰蓝 */ rgba(135, 206, 235, 0.9) 50%, /* 中冰蓝 */ rgba(96, 168, 230, 0.9) 100% /* 深冰蓝 */);
  color: #fff;
  padding: 20px;
}

.resource-manage :deep(.el-dialog__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.resource-manage :deep(.el-dialog__headerbtn) {
  color: #fff;
}

.resource-manage :deep(.el-dialog__headerbtn:hover) {
  color: rgba(255, 255, 255, 0.8);
}

.resource-manage :deep(.el-dialog__body) {
  padding: 30px;
  background: #fff;
}

.resource-manage :deep(.el-dialog__footer) {
  background: #f7fafc;
  padding: 20px 30px;
  border-top: 1px solid #e2e8f0;
}

.resource-manage :deep(.dialog-footer .el-button) {
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 20px;
}

.resource-manage :deep(.dialog-footer .el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.resource-manage :deep(.dialog-footer .el-button--primary) {
  background: rgba(90, 165, 222, 0.7);
  border: none;
}

.resource-manage :deep(.dialog-footer .el-button--primary:hover) {
  background: rgba(90, 165, 222, 1);
}

/* 表格编辑按钮样式 */
.table-card :deep(.el-button--primary) {
  background: rgba(90, 165, 222, 0.7);
  border: none;
}

.table-card :deep(.el-button--primary):hover {
  background: rgba(90, 165, 222, 0.7);
}

.table-card :deep(.el-button .el-icon) {
  margin-right: 4px;
}
</style>