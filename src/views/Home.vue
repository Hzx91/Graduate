<template>
  <div class="home-container">
    <!-- 顶部导航栏布局 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="top-header">
        <div class="header-content">
          <!-- 左侧logo -->
          <div class="logo">
            <el-icon class="logo-icon"><User /></el-icon>
            <span class="logo-text">快乐心球管理后台</span>
          </div>
          
          <!-- 中间导航菜单 -->
          <el-menu
            :default-active="activeIndex"
            mode="horizontal"
            class="nav-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="1">
              <el-icon><House /></el-icon>
              <template #title>首页</template>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><Document /></el-icon>
              <template #title>帖子管理</template>
            </el-menu-item>
            <el-menu-item index="3">
              <el-icon><Picture /></el-icon>
              <template #title>资源管理</template>
            </el-menu-item>
            <!-- 资源分类子菜单 -->
            <el-sub-menu index="4">
              <template #title>
                <el-icon><Grid /></el-icon>
                <span>资源分类</span>
              </template>
              <el-menu-item index="4-1">减压</el-menu-item>
              <el-menu-item index="4-2">音乐</el-menu-item>
              <el-menu-item index="4-3">其他</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="5">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
          </el-menu>
          
          <!-- 右侧用户信息 -->
          <div class="user-info">
            <el-dropdown>
              <span class="user-dropdown">
                <el-avatar :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
                <span class="admin-text">管理员</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>设置</el-dropdown-item>
                  <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <!-- 主内容区：渲染子路由页面 -->
      <el-main class="main-content">
        <!-- 子路由出口：帖子/资源管理页在这里渲染 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// 导入Element Plus图标
import { User, Document, Picture, SwitchButton, House, Grid, ArrowDown } from '@element-plus/icons-vue'

// WebSocket连接
const ws = ref(null)
const wsConnected = ref(false)

const router = useRouter()
const route = useRoute()

// 活跃菜单索引
const activeIndex = ref('1')

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
      ElMessage.success('WebSocket连接已建立，可接收实时通知')
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
      ElMessage.info('WebSocket连接已关闭')
    }
    
    // 监听连接错误
    ws.value.onerror = (error) => {
      console.error('管理端WebSocket连接错误:', error)
      wsConnected.value = false
      ElMessage.error('WebSocket连接错误')
    }
  } catch (e) {
    console.error('初始化管理端WebSocket失败:', e)
    ElMessage.error('初始化WebSocket失败')
  }
}

// 处理WebSocket消息
const handleWebSocketMessage = (message) => {
  switch (message.type) {
    case 'new_post':
      // 显示新帖子审核通知
      ElMessageBox.confirm(
        `用户${message.user_name || '匿名用户'}发布了新帖子，需要审核：\n\n标题：${message.postTitle || '无标题帖子'}\n\n是否立即前往审核？`,
        '新帖子审核通知',
        {
          confirmButtonText: '立即审核',
          cancelButtonText: '稍后处理',
          type: 'warning'
        }
      ).then(() => {
        // 跳转到帖子管理页面
        router.push('/home/post-manage')
      }).catch(() => {
        // 取消操作
        ElMessage.info('已取消审核操作，可稍后在帖子管理页面处理')
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

// 页面加载时设置活跃菜单
onMounted(() => {
  // 根据当前路由设置活跃菜单
  if (route.path === '/home') {
    activeIndex.value = '1'
  } else if (route.path === '/home/post-manage') {
    activeIndex.value = '2'
  } else if (route.path === '/home/resource-manage') {
    activeIndex.value = '3'
  } else if (route.path.includes('/home/resource-')) {
    activeIndex.value = '4'
  } else if (route.path === '/home/user-manage') {
    activeIndex.value = '5'
  }
  
  // 初始化WebSocket连接
  initWebSocket()
})

// 页面卸载时关闭WebSocket连接
onUnmounted(() => {
  closeWebSocket()
})

// 顶部导航菜单切换
const handleMenuSelect = (index) => {
  switch (index) {
    case '1':
      router.push('/home') // 首页
      break
    case '2':
      router.push('/home/post-manage') // 帖子管理页
      break
    case '3':
      router.push('/home/resource-manage') // 资源管理页
      break
    case '4-1':
      router.push('/home/resource-relief') // 减压资源页
      break
    case '4-2':
      router.push('/home/resource-music') // 音乐资源页
      break
    case '4-3':
      router.push('/home/resource-other') // 其他资源页
      break
    case '5':
      router.push('/home/user-manage') // 用户管理页
      break
  }
}

// 退出登录
const logout = () => {
  localStorage.removeItem('adminToken')
  ElMessage.success('退出成功！')
  router.push('/login')
}
</script>

<style scoped>
/* 全局容器样式 */
.home-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏样式 */
.top-header {
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  box-shadow: 0 2px 12px rgba(107, 70, 193, 0.15);
  padding: 0;
  height: 70px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 30px;
}

/* Logo样式 */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  color: #fff;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

/* 导航菜单样式 */
.nav-menu {
  background-color: transparent;
  border-bottom: none;
  flex: 1;
  margin: 0 40px;
}

.nav-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  height: 70px;
  line-height: 70px;
  padding: 0 25px;
}

.nav-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-bottom: 3px solid #fff;
}

.nav-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  height: 70px;
  line-height: 70px;
  padding: 0 25px;
}

.nav-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-menu :deep(.el-sub-menu .el-menu-item) {
  background-color: #fff;
  color: #333;
  height: 50px;
  line-height: 50px;
  padding: 0 30px;
}

.nav-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #f5f7fa;
  color: #6b46c1;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #fff;
}

.admin-text {
  font-size: 14px;
  font-weight: 500;
}

.user-dropdown:hover {
  color: #fff;
}

.user-dropdown :deep(.el-icon-arrow-down) {
  color: #fff;
  font-size: 14px;
}

/* 主内容区样式 */
.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  min-height: calc(100vh - 70px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-content {
    padding: 0 20px;
  }
  
  .nav-menu {
    margin: 0 20px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .nav-menu :deep(.el-menu-item),
  .nav-menu :deep(.el-sub-menu__title) {
    padding: 0 20px;
    font-size: 14px;
  }
}
</style>