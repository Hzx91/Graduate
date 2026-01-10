<template>
  <!-- 路由出口：所有页面都会在这里渲染 -->
  <router-view></router-view>
</template>

<script setup>
// 无需额外逻辑，仅作为路由容器
</script>

<style>
/* 全局样式：去掉默认边距，统一字体 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: "Microsoft YaHei", sans-serif;
}
</style>