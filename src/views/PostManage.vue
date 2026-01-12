<template>
  <div class="post-manage">
    <el-card>
      <h3>帖子管理</h3>
      <el-divider></el-divider>
      <!-- 查询框：修复slot为template #append -->
      <el-input v-model="searchKey" placeholder="输入关键词查询帖子" style="width: 300px; margin-bottom: 20px;">
        <template #append>
          <el-button @click="searchPost">查询</el-button>
        </template>
      </el-input>
      <!-- 帖子列表 -->
      <el-table :data="postList" border style="width: 100%">
        <el-table-column prop="id" label="帖子ID" width="80"></el-table-column>
        <el-table-column prop="title" label="帖子标题" width="200"></el-table-column>
        <el-table-column prop="content" label="帖子内容" width="250"></el-table-column>
        <el-table-column prop="user_name" label="作者" width="100"></el-table-column>
        <el-table-column prop="like_count" label="点赞数" width="80"></el-table-column>
        <el-table-column prop="comment_count" label="评论数" width="80"></el-table-column>
        <el-table-column prop="view_count" label="浏览量" width="80"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_top" label="置顶" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.is_top" type="info">已置顶</el-tag>
            <el-tag v-else type="default">未置顶</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="发布时间" width="180"></el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" type="primary" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="warning" @click="toggleTop(scope.row)" v-if="scope.row.status === 1">
              {{ scope.row.is_top ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button size="small" type="success" @click="approvePost(scope.row)" v-if="scope.row.status === 0">通过</el-button>
            <el-button size="small" type="danger" @click="rejectPost(scope.row)" v-if="scope.row.status === 0">拒绝</el-button>
            <el-button size="small" type="danger" @click="deletePost(scope.row)">删除</el-button>
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
    
    <!-- 帖子详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="帖子详情" width="800px">
      <div v-if="currentPost" class="post-detail">
        <div class="detail-item">
          <span class="label">帖子ID：</span>
          <span class="value">{{ currentPost.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">标题：</span>
          <span class="value">{{ currentPost.title }}</span>
        </div>
        <div class="detail-item">
          <span class="label">作者：</span>
          <span class="value">{{ currentPost.user_name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">发布时间：</span>
          <span class="value">{{ currentPost.create_time }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <span class="value">
            <el-tag v-if="currentPost.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="currentPost.status === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">点赞数：</span>
          <span class="value">{{ currentPost.like_count || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="label">评论数：</span>
          <span class="value">{{ currentPost.comment_count || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="label">浏览量：</span>
          <span class="value">{{ currentPost.view_count || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="label">置顶状态：</span>
          <span class="value">{{ currentPost.is_top ? '已置顶' : '未置顶' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">内容：</span>
          <div class="value content">{{ currentPost.content }}</div>
        </div>
        <div class="detail-item" v-if="currentPost.images && JSON.parse(currentPost.images).length">
          <span class="label">图片：</span>
          <div class="value images">
            <div 
              v-for="(img, index) in JSON.parse(currentPost.images)" 
              :key="index" 
              class="image-wrapper"
            >
              <el-image 
                :src="img" 
                fit="cover" 
                style="width: 120px; height: 120px; margin: 5px;"
                :error="handleImageError"
                :preview-src-list="JSON.parse(currentPost.images)"
              >
                <!-- 图片加载失败时显示的占位内容 -->
                <template #error>
                  <div class="image-placeholder">
                    <span>图片加载失败</span>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>
        
        <!-- 评论列表 -->
        <div class="detail-item" v-if="currentPostComments.length > 0">
          <span class="label">评论列表：</span>
          <div class="value comments-list">
            <div class="comment-table-container">
              <el-table :data="currentPostComments" border style="width: 100%; margin-top: 10px;">
                <el-table-column prop="id" label="评论ID" width="80"></el-table-column>
                <el-table-column prop="user_name" label="评论者" width="120"></el-table-column>
                <el-table-column prop="content" label="评论内容" width="300"></el-table-column>
                <el-table-column prop="create_time" label="评论时间" width="180"></el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="scope">
                    <el-button size="small" type="danger" @click="deleteComment(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
        <div class="detail-item" v-else>
          <span class="label">评论列表：</span>
          <span class="value">暂无评论</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询关键词
const searchKey = ref('')
// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
// 帖子列表数据
const postList = ref([])
// 详情弹窗
const dialogVisible = ref(false)
const currentPost = ref(null)
const currentPostComments = ref([])

// 获取帖子列表
const getPostList = () => {
  axios.get('http://localhost:8082/api/community/posts', {
    params: {
      isAdmin: 1,
      pageindex: currentPage.value,
      pagesize: pageSize.value
    }
  })
  .then(res => {
    console.log('获取帖子列表成功:', res.data)
    if (res.data.status === 0) {
      postList.value = res.data.message.list || []
      total.value = res.data.message.total || 0
    }
  })
  .catch(err => {
    console.error('获取帖子列表失败:', err)
  })
}

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
  getPostList()
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  getPostList()
}

// 查询方法
const searchPost = () => {
  // 搜索功能实现
  axios.get('http://localhost:8082/api/community/posts', {
    params: {
      isAdmin: 1,
      pageindex: currentPage.value,
      pagesize: pageSize.value,
      keyword: searchKey.value
    }
  })
  .then(res => {
    console.log('搜索帖子成功:', res.data)
    if (res.data.status === 0) {
      postList.value = res.data.message.list || []
      total.value = res.data.message.total || 0
    }
  })
  .catch(err => {
    console.error('搜索帖子失败:', err)
  })
}

// 查看详情
const viewDetail = (row) => {
  // 深拷贝行数据，避免修改原始数据
  const postData = JSON.parse(JSON.stringify(row));
  
  // 确保图片URL格式正确
  if (postData.images) {
    try {
      let images = [];
      // 尝试解析图片数据
      if (typeof postData.images === 'string') {
        if (postData.images.startsWith('http')) {
          // 单个图片URL
          images = [postData.images];
        } else {
          // JSON字符串数组
          images = JSON.parse(postData.images);
        }
      } else if (Array.isArray(postData.images)) {
        // 已经是数组
        images = postData.images;
      }
      
      // 格式化图片URL
      const formattedImages = images.map(img => {
        if (img && typeof img === 'string' && !img.startsWith('http')) {
          return `http://localhost:8082${img}`;
        }
        return img;
      }).filter(img => img); // 过滤空值
      
      postData.images = JSON.stringify(formattedImages);
    } catch (e) {
      console.error('解析图片失败:', e);
      // 设置默认空数组，避免后续处理出错
      postData.images = '[]';
    }
  } else {
    // 如果没有图片，设置默认空数组
    postData.images = '[]';
  }
  
  currentPost.value = postData;
  dialogVisible.value = true;
  
  // 获取帖子评论
  getPostComments(row.id);
}

// 获取帖子评论
const getPostComments = (postId) => {
  axios.get(`http://localhost:8082/api/community/post/${postId}/comments`)
    .then(res => {
      if (res.data.status === 0) {
        currentPostComments.value = res.data.message.list || [];
      }
    })
    .catch(err => {
      console.error('获取评论失败:', err);
      currentPostComments.value = [];
    });
}

// 图片加载失败处理函数
const handleImageError = (e) => {
  console.error('图片加载失败:', e)
  // 图片加载失败时，会自动显示占位符
}

// 删除评论
const deleteComment = (comment) => {
  ElMessageBox.confirm('确定要删除该评论吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  .then(() => {
    // 使用删除评论API
    axios.delete(`http://localhost:8082/api/community/comment/${comment.id}`)
      .then(res => {
        if (res.data.status === 0) {
          // 更新评论列表
          currentPostComments.value = currentPostComments.value.filter(item => item.id !== comment.id);
          // 更新当前帖子的评论数
          if (currentPost.value) {
            currentPost.value.comment_count = Math.max(0, currentPost.value.comment_count - 1);
          }
          // 刷新帖子列表
          getPostList();
          ElMessage.success('删除成功');
        } else {
          ElMessage.error(res.data.message || '删除失败');
        }
      })
      .catch(err => {
        console.error('删除评论失败:', err);
        ElMessage.error('删除失败');
      });
  })
  .catch(err => {
    if (err !== 'cancel') {
      console.error('删除失败:', err);
      ElMessage.error('删除失败');
    }
  });
}

// 置顶/取消置顶
const toggleTop = (row) => {
  axios.put(`http://localhost:8082/api/community/post/${row.id}/top`, {
    is_top: row.is_top ? 0 : 1
  })
  .then(res => {
    if (res.data.status === 0) {
      row.is_top = !row.is_top
      ElMessage.success(row.is_top ? '置顶成功' : '取消置顶成功')
      getPostList()
    }
  })
  .catch(err => {
    console.error('置顶操作失败:', err)
    ElMessage.error('置顶操作失败')
  })
}

// 通过审核
const approvePost = (row) => {
  axios.put(`http://localhost:8082/api/community/post/${row.id}/status`, {
    status: 1
  })
  .then(res => {
    console.log('审核通过结果:', res.data)
    if (res.data.status === 0) {
      row.status = 1
      ElMessage.success('审核通过')
      // 刷新列表
      getPostList()
    } else {
      ElMessage.error(res.data.message || '审核失败')
    }
  })
  .catch(err => {
    console.error('审核失败:', err)
    ElMessage.error('审核失败')
  })
}

// 拒绝审核
const rejectPost = (row) => {
  axios.put(`http://localhost:8082/api/community/post/${row.id}/status`, {
    status: 2,
    reason: '内容不符合要求' // 这里可以根据需要让管理员输入拒绝原因
  })
  .then(res => {
    console.log('拒绝审核结果:', res.data)
    if (res.data.status === 0) {
      row.status = 2
      ElMessage.success('已拒绝')
      // 刷新列表
      getPostList()
    } else {
      ElMessage.error(res.data.message || '拒绝审核失败')
    }
  })
  .catch(err => {
    console.error('拒绝审核失败:', err)
    ElMessage.error('拒绝审核失败')
  })
}

// 删除帖子
const deletePost = (row) => {
  ElMessageBox.confirm('确定要删除该帖子吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  .then(() => {
    return axios.delete(`http://localhost:8082/api/community/post/${row.id}`)
  })
  .then(res => {
    if (res.data.status === 0) {
      ElMessage.success('删除成功')
      getPostList()
    }
  })
  .catch(err => {
    if (err !== 'cancel') {
      console.error('删除失败:', err)
      ElMessage.error('删除失败')
    }
  })
}

// 组件挂载时获取帖子列表
onMounted(() => {
  getPostList()
})
</script>

<style scoped>
/* 全局样式重置和基础设置 */
.post-manage {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 70px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 卡片样式 */
.post-manage :deep(.el-card) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* 页面标题 */
.post-manage h3 {
  font-size: 24px;
  font-weight: 700;
  color: #4a5568;
  margin: 0 0 20px 0;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 搜索框样式 */
.post-manage :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.post-manage :deep(.el-input__wrapper:hover) {
  border-color: #6b46c1;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.post-manage :deep(.el-input__wrapper.is-focus) {
  border-color: #6b46c1;
  box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
}

/* 搜索按钮样式 */
.post-manage :deep(.el-input__append-inner .el-button) {
  border-radius: 10px;
  font-weight: 600;
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  border: none;
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-manage :deep(.el-input__append-inner .el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #553c9a 0%, #6b46c1 100%);
}

/* 表格样式 */
.post-manage :deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  margin-top: 20px;
}

.post-manage :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
}

.post-manage :deep(.el-table__header-wrapper th) {
  background: transparent;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  padding: 16px;
}

.post-manage :deep(.el-table__body-wrapper tr) {
  transition: all 0.3s ease;
}

.post-manage :deep(.el-table__body-wrapper tr:hover) {
  background: rgba(107, 70, 193, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-manage :deep(.el-table__body-wrapper td) {
  padding: 16px;
  text-align: center;
  color: #4a5568;
  font-size: 14px;
  border-bottom: 1px solid #f7fafc;
}

.post-manage :deep(.el-table__body-wrapper tr.el-table__row--striped) {
  background: rgba(247, 250, 252, 0.8);
}

/* 表格边框样式 */
.post-manage :deep(.el-table--border .el-table__inner-wrapper::after),
.post-manage :deep(.el-table--border .el-table__inner-wrapper::before),
.post-manage :deep(.el-table__inner-wrapper::after),
.post-manage :deep(.el-table__inner-wrapper::before) {
  background-color: transparent;
}

/* 操作按钮样式 */
.post-manage :deep(.el-table .el-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 6px 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 2px;
}

.post-manage :deep(.el-table .el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-manage :deep(.el-button--primary) {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  border: none;
}

.post-manage :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%);
}

.post-manage :deep(.el-button--warning) {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  border: none;
}

.post-manage :deep(.el-button--warning:hover) {
  background: linear-gradient(135deg, #dd6b20 0%, #c05621 100%);
}

.post-manage :deep(.el-button--success) {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border: none;
}

.post-manage :deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
}

.post-manage :deep(.el-button--danger) {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  border: none;
}

.post-manage :deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
}

/* 标签样式 */
.post-manage :deep(.el-tag) {
  font-weight: 500;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 分页样式 */
.post-manage :deep(.el-pagination) {
  margin-top: 20px;
  text-align: right;
}

.post-manage :deep(.el-pagination button) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.post-manage :deep(.el-pagination button:hover) {
  background: rgba(107, 70, 193, 0.1);
  color: #6b46c1;
  transform: translateY(-1px);
}

.post-manage :deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  transition: all 0.3s ease;
  margin: 0 3px;
}

.post-manage :deep(.el-pagination .el-pager li:hover) {
  background: rgba(107, 70, 193, 0.1);
  color: #6b46c1;
}

.post-manage :deep(.el-pagination .el-pager li.active) {
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.3);
}

/* 详情弹窗样式 */
.post-manage :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
}

.post-manage :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  color: #fff;
  padding: 20px;
}

.post-manage :deep(.el-dialog__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.post-manage :deep(.el-dialog__headerbtn) {
  color: #fff;
}

.post-manage :deep(.el-dialog__headerbtn:hover) {
  color: rgba(255, 255, 255, 0.8);
}

.post-manage :deep(.el-dialog__body) {
  padding: 30px;
  background: #fff;
}

.post-manage :deep(.el-dialog__footer) {
  background: #f7fafc;
  padding: 20px 30px;
  border-top: 1px solid #e2e8f0;
}

/* 详情内容样式 */
.post-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: #edf2f7;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.label {
  font-weight: 600;
  color: #4a5568;
  min-width: 100px;
  flex-shrink: 0;
  font-size: 14px;
  padding-top: 4px;
}

.value {
  flex: 1;
  color: #718096;
  font-size: 14px;
}

.content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* 图片样式 */
.images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-wrapper {
  display: inline-block;
  margin: 0;
}

.image-wrapper :deep(.el-image) {
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: zoom-in;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-wrapper :deep(.el-image:hover) {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* 图片占位符样式 */
.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  color: #a0aec0;
  font-size: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

/* 评论表格样式 */
.comment-table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.comment-table-container :deep(.el-table) {
  margin-top: 0;
  border-radius: 0;
}

.comment-table-container :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

/* 关闭按钮样式 */
.post-manage :deep(.el-dialog__footer .el-button) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 8px 20px;
}

.post-manage :deep(.el-dialog__footer .el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 滚动条样式 */
.post-detail::-webkit-scrollbar,
.comment-table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.post-detail::-webkit-scrollbar-track,
.comment-table-container::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 4px;
}

.post-detail::-webkit-scrollbar-thumb,
.comment-table-container::-webkit-scrollbar-thumb {
  background: rgba(107, 70, 193, 0.5);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.post-detail::-webkit-scrollbar-thumb:hover,
.comment-table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 70, 193, 0.7);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .post-manage {
    padding: 15px;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .label {
    min-width: auto;
    padding-top: 0;
  }
}

@media (max-width: 768px) {
  .post-manage {
    padding: 10px;
  }
  
  .post-manage h3 {
    font-size: 20px;
  }
  
  .post-manage :deep(.el-table) {
    font-size: 13px;
  }
  
  .post-manage :deep(.el-table__body-wrapper td) {
    padding: 12px 8px;
  }
  
  .post-manage :deep(.el-table .el-button) {
    padding: 4px 8px;
    font-size: 12px;
    margin: 1px;
  }
}
</style>