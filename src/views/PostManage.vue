<template>
  <div class="post-manage">
    <el-card>
      <h3>帖子管理</h3>
      <el-divider></el-divider>
      <!-- 查询框：修复slot为template #append -->
      <el-input v-model="searchKey" placeholder="输入帖子标题查询" style="width: 300px; margin-bottom: 20px;">
        <template #append>
          <el-button @click="searchPost">查询</el-button>
        </template>
      </el-input>
      <!-- 帖子列表 -->
      <el-table :data="postList" border style="width: 100%">
        <el-table-column prop="id" label="帖子ID" width="80"></el-table-column>
        <el-table-column prop="title" label="帖子标题"></el-table-column>
        <el-table-column prop="author" label="作者" width="100"></el-table-column>
        <el-table-column prop="likeCount" label="点赞数" width="80"></el-table-column>
        <el-table-column prop="commentCount" label="评论数" width="80"></el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary">查看详情</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: right;"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 查询关键词
const searchKey = ref('')
// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)

// 模拟帖子数据
const postList = ref([
  {
    id: 1,
    title: 'Vue3管理端开发教程',
    author: '小明',
    likeCount: 120,
    commentCount: 30,
    createTime: '2026-01-01 10:00:00'
  },
  {
    id: 2,
    title: 'Element Plus使用技巧',
    author: '小红',
    likeCount: 88,
    commentCount: 15,
    createTime: '2026-01-02 14:30:00'
  },
  {
    id: 3,
    title: 'Vite比Webpack快在哪里？',
    author: '小李',
    likeCount: 200,
    commentCount: 50,
    createTime: '2026-01-03 09:15:00'
  }
])

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
}
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 查询方法
const searchPost = () => {
  // 这里可加真实查询逻辑，先模拟
  console.log('查询关键词：', searchKey.value)
}
</script>

<style scoped>
.post-manage {
  padding: 10px;
}
</style>