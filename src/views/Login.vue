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
  font-family: '微软雅黑';
  width: 100vw;
  height: 100vh;
  background: 
    linear-gradient(180deg,
      rgba(173, 216, 255, 0.5) 0%,    /* 半透明浅冰蓝 */
      rgba(135, 206, 235, 0.5) 50%,  /* 半透明中冰蓝 */
      rgba(96, 168, 230, 0.5) 100%   /* 半透明深冰蓝 */
    ),
    url('../assets/bz4.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow: hidden;
  filter: brightness(0.85) saturate(0.9); /* 调暗+降饱和，让登录框更突出 */
}

/* 丁达尔光效（增强氛围感） */
.login-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%);
  pointer-events: none;
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
  border-radius: 20px;
  background: rgba(242, 239, 239, 0.084);
  backdrop-filter: blur(12px); /* 增强毛玻璃通透感 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* 加一层细微白边，让框体更清晰 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* 加一点柔和阴影，让框体浮起来 */
  z-index: 1;
  transition: all 0.3s ease;
  transform: translateY(0);
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* 登录标题 */
.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px; /* 稍放大字号 */
  font-weight: 600; /* 加粗字重 */
  color: #409EFF; /* 用主题蓝，更醒目 */
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
  height: 2px;
  background: linear-gradient(90deg, #409EFF, #83bafc); /* 改成渐变线 */
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
  font-weight: 500;
  color: #606266; /* 用稍深的灰色，比之前更醒目 */
  font-size: 14px;
  padding-bottom: 8px;
  display: block;
  text-align: left;
  margin-bottom: 8px;
}

/* 输入框样式 */
.login-card :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  height: 50px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); /* 加内阴影，让输入区有凹陷质感 */
}

.login-card :deep(.el-input__wrapper:hover) {
  border-color: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  transform: translateY(-1px);
}

.login-card :deep(.el-input__wrapper.is-focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1); /* 聚焦时的主题色光环 */
  transform: translateY(-1px);
}

.login-card :deep(.el-input__inner) {
  font-size: 14px;
  color: #4a5568;
  padding: 0 16px;
  height: 46px;
  line-height: 46px;
}

.login-card :deep(.el-input__inner::placeholder) {
  color: #c0c4cc; /* 浅灰，和标签形成层级对比 */
}

/* 密码输入框 */
.login-card :deep(.el-input--password .el-input__inner) {
  padding-right: 40px;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: #409EFF;
  border: none;
  transition: all 0.3s ease; /* 加过渡动画 */
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  margin-top: 10px;
}

.login-btn:hover {
  background: #337ecc; /* hover 时颜色稍深 */
  transform: translateY(-1px); /* 微微上浮，增强按压感 */
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3); /* 加发光阴影 */
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
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