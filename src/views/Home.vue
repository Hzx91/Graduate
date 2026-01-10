<template>
  <div class="home-container">
    <!-- 侧边栏 -->
    <el-container style="height: 100vh;">
      <el-aside width="200px" style="background-color: #2e3b4e;">
        <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          background-color="#2e3b4e"
          text-color="#fff"
          active-text-color="#ffd04b"
          @select="handleMenuSelect"
        >
          <el-menu-item index="1">
            <!-- 修复：图标使用方式改为正确写法 -->
            <el-icon><User /></el-icon>
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
          <el-menu-item index="4" @click="logout">
            <el-icon><SwitchButton/></el-icon>
            <template #title>退出登录</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区：渲染子路由页面 -->
      <el-container>
        <el-header style="text-align: right; font-size: 12px">
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px"></i>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>查看</el-dropdown-item>
                <el-dropdown-item>新增</el-dropdown-item>
                <el-dropdown-item>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span>管理员</span>
        </el-header>
        <el-main>
          <!-- 子路由出口：帖子/资源管理页在这里渲染 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 修复：正确导入Element Plus图标（确保已装@element-plus/icons-vue）
import { User, Document, Picture, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()

// 侧边栏菜单切换
const handleMenuSelect = (index) => {
  switch (index) {
    case '1':
      router.push('/home') // 首页（可加一个空的首页组件）
      break
    case '2':
      router.push('/home/post-manage') // 帖子管理页
      break
    case '3':
      router.push('/home/resource-manage') // 资源管理页
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
.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
}
.el-aside {
  color: #333;
}
</style>