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
        <el-table-column prop="username" label="用户名" width="180"></el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="220">
          <template #default="scope">
            <span>{{ formatDateTime(scope.row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button
              type="warning"
              size="small"
              @click="resetUserPassword(scope.row.id, scope.row.username)"
            >
              <el-icon><Key /></el-icon>
              重置密码
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
import { Search, Refresh, User, Key, Document } from '@element-plus/icons-vue'
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
const getUserList = () => {
  loading.value = true
  // 调用API获取用户列表
  fetch(`http://localhost:8082/api/admin/users?keyword=${encodeURIComponent(searchText.value)}&pageindex=${currentPage.value}&pagesize=${pageSize.value}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 0) {
        users.value = data.list
        totalUsers.value = data.total
      } else {
        ElMessage.error('获取用户列表失败：' + data.message)
      }
    })
    .catch(err => {
      console.error('获取用户列表出错：', err)
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

// 格式化日期时间
const formatDateTime = (dateTime) => {
  const date = new Date(dateTime)
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
.user-manage {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  margin-bottom: 25px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 搜索和统计区域 */
.search-stats-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

/* 用户列表 */
.user-list-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
