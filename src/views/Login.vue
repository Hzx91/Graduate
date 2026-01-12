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
/* 登录页面容器 */
.login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 50%, #d53f8c 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow: hidden;
}

/* 背景装饰效果 */
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: float 20s linear infinite;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(50px, 50px) rotate(360deg);
  }
}

/* 登录卡片 */
.login-card {
  width: 420px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1;
  transition: all 0.3s ease;
  transform: translateY(0);
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
}

/* 登录标题 */
.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 32px;
  font-weight: 700;
  color: #4a5568;
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  padding-bottom: 15px;
}

.login-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  border-radius: 2px;
}

/* 表单样式 */
.login-form {
  margin-top: 30px;
}

/* 表单项样式 */
.login-card :deep(.el-form-item) {
  margin-bottom: 25px;
}

.login-card :deep(.el-form-item__label) {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
  padding-bottom: 8px;
  display: block;
  text-align: left;
}

/* 输入框样式 */
.login-card :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  height: 50px;
}

.login-card :deep(.el-input__wrapper:hover) {
  border-color: #6b46c1;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
  transform: translateY(-1px);
}

.login-card :deep(.el-input__wrapper.is-focus) {
  border-color: #6b46c1;
  box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
  transform: translateY(-1px);
}

.login-card :deep(.el-input__inner) {
  font-size: 14px;
  color: #4a5568;
  padding: 0 16px;
  height: 46px;
  line-height: 46px;
}

/* 密码输入框 */
.login-card :deep(.el-input--password .el-input__inner) {
  padding-right: 40px;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.3);
  margin-top: 10px;
}

.login-btn:hover {
  background: linear-gradient(135deg, #553c9a 0%, #6b46c1 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 70, 193, 0.4);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.3);
}

/* 按钮加载状态 */
.login-btn :deep(.el-icon-loading) {
  margin-right: 8px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    padding: 30px 25px;
    margin: 0 10px;
  }
  
  .login-title {
    font-size: 26px;
  }
  
  .login-card :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  .login-card :deep(.el-input__wrapper) {
    height: 46px;
  }
  
  .login-card :deep(.el-input__inner) {
    height: 42px;
    line-height: 42px;
  }
  
  .login-btn {
    height: 46px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .login-title {
    font-size: 22px;
  }
  
  .login-card {
    padding: 25px 20px;
  }
  
  .login-card :deep(.el-form-item__label) {
    font-size: 13px;
  }
  
  .login-card :deep(.el-input__inner) {
    font-size: 13px;
  }
}
</style>