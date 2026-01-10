<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">管理端登录</h2>
      <el-form :model="loginForm" label-width="80px" class="login-form">
        <el-form-item label="账号">
          <el-input v-model="loginForm.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 路由实例
const router = useRouter()
// 登录表单
const loginForm = ref({
  username: 'admin',
  password: '123456'
})

// 登录方法
const login = () => {
  if (loginForm.value.username && loginForm.value.password) {
    // 模拟登录：存token到本地
    localStorage.setItem('adminToken', 'admin-token-123')
    ElMessage.success('登录成功！')
    // 跳转到首页
    router.push('/home')
  } else {
    ElMessage.error('账号或密码不能为空！')
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  width: 400px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1989fa;
}
.login-form {
  margin-top: 20px;
}
.login-btn {
  width: 100%;
}
</style>