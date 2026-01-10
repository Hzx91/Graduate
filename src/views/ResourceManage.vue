<template>
  <div class="resource-manage" style="padding: 20px;">
    <el-card shadow="hover">
      <el-divider content="资源上传" />
      <!-- 资源上传表单 -->
      <div class="upload-form" style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 15px;">
        <!-- 资源名称 -->
        <div class="form-group">
          <label style="display: inline-block; width: 120px; text-align: right; margin-right: 10px;">资源名称</label>
          <input 
            type="text" 
            v-model="resourceName"  
            placeholder="例如：正念呼吸音乐/助眠视频" 
            style="width: 300px; padding: 8px; border: 1px solid #e6e6e6; border-radius: 4px;"
          >
        </div>
        <!-- 资源描述 -->
        <div class="form-group">
          <label style="display: inline-block; width: 120px; text-align: right; margin-right: 10px;">资源描述</label>
          <input 
            type="text" 
            v-model="resourceDesc"  
            placeholder="例如：10分钟正念呼吸放松音乐/5分钟助眠视频" 
            style="width: 300px; padding: 8px; border: 1px solid #e6e6e6; border-radius: 4px;"
          >
        </div>
        <!-- 上传组件：支持视频+20MB限制 -->
        <div class="form-group">
          <label style="display: inline-block; width: 120px; text-align: right; margin-right: 10px;">选择文件</label>
          <el-upload
            class="upload-demo"
            action="http://localhost:8082/api/admin/uploadResource"  
            name="resourceFile"  
            accept=".jpg,.png,.mp3,.mp4"  
            :limit="1"
            :data="{ name: resourceName, desc: resourceDesc }"  
            @success="handleUploadSuccess"
            @error="handleUploadError"
            :file-list="fileList"
          >
            <el-button type="primary">点击选择文件</el-button>
            <div class="el-upload__tip">支持jpg/png/mp3/mp4文件，不超过20MB</div>
          </el-upload>
        </div>
      </div>
      <!-- 资源列表表格：显示图片+完整信息 -->
      <el-table :data="tableData" border style="width: 100%" empty-text="暂无资源数据，请先上传">
          <!-- <el-table-column prop="id" label="资源ID" width="80"></el-table-column> -->
          <el-table-column prop="call_index" label="资源名称" width="200"></el-table-column>
          <el-table-column prop="zhaiyao" label="资源描述" width="300"></el-table-column>
          <!-- 修复：渲染图片，不再显示纯地址 -->
          <el-table-column label="资源预览" width="120">
            <template #default="scope">
              <el-image 
                :src="scope.row.img_url" 
                fit="cover" 
                style="width: 80px; height: 60px; border-radius: 4px;"
                :preview-src-list="[scope.row.img_url]"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column label="资源路径" width="300">
            <template #default="scope">
              <a :href="scope.row.img_url" target="_blank" style="word-break: break-all; font-size: 12px;">
                {{ scope.row.img_url }}
              </a>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="text" @click="deleteResource(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { ElCard, ElDivider, ElUpload, ElButton, ElTable, ElTableColumn, ElMessage, ElImage } from 'element-plus'

// 响应式变量
const tableData = ref([])  
const resourceName = ref('')  
const resourceDesc = ref('')  
const fileList = ref([]) // 上传文件列表

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
.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
/* 表格空数据样式优化 */
.el-table__empty-text {
  color: #666;
  font-size: 16px;
}
/* 图片预览 hover 效果 */
.el-image:hover {
  cursor: zoom-in;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>