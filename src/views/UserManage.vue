<template>
  <div class="user-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <p class="page-subtitle">管理系统用户，支持查看、搜索和重置密码操作</p>
    </div>
    
    <!-- 搜索和统计区域 -->
    <div class="search-stats-container">
      <!-- 搜索功能 -->
      <div class="search-container">
        <el-input
          v-model="searchText"
          placeholder="输入用户名或昵称"
          clearable
          size="large"
          prefix-icon="Search"
          style="width: 350px; margin-right: 15px;"
          @keyup.enter="searchUser"
        ></el-input>
        <el-button type="primary" size="large" @click="searchUser">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button size="large" @click="resetSearch">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
      
      <!-- 用户统计 -->
      <div class="stats-container">
        <div class="stat-item">
          <el-icon class="stat-icon"><User /></el-icon>
          <div class="stat-content">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
        <div class="stat-item">
          <el-icon class="stat-icon"><Document /></el-icon>
          <div class="stat-content">
            <div class="stat-number">{{ users.length }}</div>
            <div class="stat-label">当前显示</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <div class="user-list-container">
      <el-table
        v-loading="loading"
        :data="users"
        border
        style="width: 100%"
        class="user-table"
      >
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="nickname" label="昵称" width="180"></el-table-column>
        <el-table-column prop="username" label="ID" width="180"></el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="220">
          <template #default="scope">
            <span>{{ formatDateTime(scope.row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template #default="scope">
            <el-button
              type="warning"
              size="small"
              @click="resetUserPassword(scope.row.id, scope.row.username)"
            >
              <el-icon><Key /></el-icon>
              重置密码
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteUser(scope.row.id, scope.row.username)"
            >
              <el-icon><Delete /></el-icon>
              删除用户
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalUsers"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Search, Refresh, User, Key, Document, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 数据
const users = ref([])
const totalUsers = ref(0)
const searchText = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// WebSocket连接
const ws = ref(null)
const wsConnected = ref(false)

// 获取用户列表
// 获取用户列表
const getUserList = () => {
  loading.value = true
  // 打印要传的搜索值，排查有没有拿到
  console.log('当前搜索关键词：', searchText.value)
  
  // 先用你原来后端接收的 keyword，很多后端是 keyword
  let url = `http://localhost:8082/api/admin/users?keyword=${encodeURIComponent(searchText.value)}&pageindex=${currentPage.value}&pagesize=${pageSize.value}`
  console.log('请求地址：', url)

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log('后端返回结果：', data) // 关键日志
      if (data.status === 0) {
        users.value = data.list || []
        totalUsers.value = data.total || 0
      } else {
        ElMessage.error('获取用户列表失败：' + (data.message || ''))
      }
    })
    .catch(err => {
      console.error('请求报错：', err)
      ElMessage.error('获取用户列表失败，请稍后重试')
    })
    .finally(() => {
      loading.value = false
    })
}
// 搜索用户
const searchUser = () => {
  currentPage.value = 1
  getUserList()
}

// 重置搜索
const resetSearch = () => {
  searchText.value = ''
  currentPage.value = 1
  getUserList()
}

// 重置用户密码
const resetUserPassword = (userId, username) => {
  ElMessageBox.confirm(
    `确定要将用户「${username}」的密码重置为「123456」吗？`,
    '重置密码',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 调用API重置密码
      let url, options;
      if (userId && userId !== null && userId !== 'null') {
        // 使用ID重置密码
        url = `http://localhost:8082/api/admin/user/${userId}/reset-password`;
        options = {
          method: 'PUT'
        };
      } else {
        // 使用用户名重置密码
        url = `http://localhost:8082/api/admin/user/null/reset-password`;
        options = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username })
        };
      }
      
      fetch(url, options)
        .then(res => res.json())
        .then(data => {
          if (data.status === 0) {
            ElMessage.success('密码重置成功')
          } else {
            ElMessage.error('密码重置失败：' + data.message)
          }
        })
        .catch(err => {
          console.error('重置密码出错：', err)
          ElMessage.error('密码重置失败，请稍后重试')
        })
    })
    .catch(() => {
      // 取消操作
    })
}

// 删除用户（真正删除数据库）
const deleteUser = (userId, username) => {
  ElMessageBox.confirm(
    `确定要删除用户「${username}」吗？此操作不可恢复。`,
    '删除用户',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  )
  .then(() => {
    // 调用真正删除接口
    fetch(`http://localhost:8082/api/admin/user/${userId}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 0) {
        ElMessage.success('用户删除成功')
        getUserList() // 刷新列表
      } else {
        ElMessage.error('删除失败：' + data.message)
      }
    })
    .catch(err => {
      console.error(err)
      ElMessage.error('删除失败')
    })
  })
  .catch(() => {})
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  
  // 检查是否是有效的日期字符串
  const date = new Date(dateTime)
  
  // 如果日期无效（返回1970年或1900年等），使用当前日期
  if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 分页大小变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  getUserList()
}

// 当前页变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  getUserList()
}

// WebSocket初始化
const initWebSocket = () => {
  try {
    // 创建WebSocket连接
    const wsUrl = 'ws://localhost:8082?type=admin'
    ws.value = new WebSocket(wsUrl)
    
    // 监听连接打开
    ws.value.onopen = () => {
      console.log('管理端WebSocket连接已打开')
      wsConnected.value = true
    }
    
    // 监听接收消息
    ws.value.onmessage = (event) => {
      console.log('管理端WebSocket收到消息:', event.data)
      try {
        const message = JSON.parse(event.data)
        handleWebSocketMessage(message)
      } catch (e) {
        console.error('解析WebSocket消息失败:', e)
      }
    }
    
    // 监听连接关闭
    ws.value.onclose = () => {
      console.log('管理端WebSocket连接已关闭')
      wsConnected.value = false
    }
    
    // 监听连接错误
    ws.value.onerror = (error) => {
      console.error('管理端WebSocket连接错误:', error)
      wsConnected.value = false
    }
  } catch (e) {
    console.error('初始化管理端WebSocket失败:', e)
  }
}

// 处理WebSocket消息
const handleWebSocketMessage = (message) => {
  switch (message.type) {
    case 'reset_password_request':
      // 显示重置密码请求弹窗
      ElMessageBox.confirm(
        `请帮用户「${message.username}」重置密码吗？`,
        '重置密码请求',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 调用重置密码函数
        resetUserPassword(null, message.username)
      }).catch(() => {
        // 取消操作
        ElMessage.info('已取消重置密码操作')
      })
      break
    default:
      console.log('未知的WebSocket消息类型:', message.type)
  }
}

// 关闭WebSocket连接
const closeWebSocket = () => {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.close()
    wsConnected.value = false
  }
}

// 页面加载时获取用户列表
onMounted(() => {
  getUserList()
  // 初始化WebSocket连接
  initWebSocket()
})

// 页面卸载时关闭WebSocket连接
onUnmounted(() => {
  closeWebSocket()
})
</script>

<style scoped>
/* 全局样式重置和基础设置 */
.user-manage {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 70px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 卡片样式 */
.user-manage :deep(.el-card) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* 页面标题 */
.page-header {
  margin-bottom: 25px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 15px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  padding-bottom: 15px;
  background: rgba(90, 165, 222, 0.7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 搜索和统计区域 */
.search-stats-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.search-container {
  display: flex;
  align-items: center;
}

/* 搜索框样式 */
.user-manage :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.user-manage :deep(.el-input__wrapper:hover) {
   border-color:rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.user-manage :deep(.el-input__wrapper.is-focus) {
   border-color:rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
}

/* 搜索按钮样式 */
.user-manage :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-manage :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.user-manage :deep(.el-button--primary) {
  background: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 15px rgba(66, 165, 245, 0.3);
  border: none;
}

.user-manage :deep(.el-button--primary:hover) {
  background: rgba(90, 165, 222, 1);
}

.stats-container {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  font-size: 24px;
  color: #409eff;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 表格样式 */
.user-manage :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
}

.user-manage :deep(.el-table__header-wrapper th) {
  background: #f7fafc;
  font-weight: 600;
  font-size: 14px;
  text-align: left;
  padding: 12px;
}

.user-manage :deep(.el-table__body-wrapper tr) {
  transition: all 0.3s ease;
}

.user-manage :deep(.el-table__body-wrapper tr:hover) {
  background: rgba(107, 70, 193, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-manage :deep(.el-table__body-wrapper td) {
  padding: 12px;
}

/* 用户列表 */
.user-list-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.user-table {
  margin-bottom: 20px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
}
</style>
