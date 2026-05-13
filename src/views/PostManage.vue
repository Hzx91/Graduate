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
      <!-- 批量操作工具栏 -->
      <div class="batch-actions" v-if="postList.length > 0">
        <div class="batch-left">
          <el-checkbox 
            v-model="selectAll" 
            @change="handleSelectAll"
            :indeterminate="isIndeterminate"
          >全选</el-checkbox>
          <span class="selected-count" v-if="selectedPosts.length > 0">
            已选择 {{ selectedPosts.length }} 项
          </span>
        </div>
        <div class="batch-right">
          <el-button 
            type="success" 
            :disabled="selectedPosts.length === 0"
            @click="batchApprove"
            class="batch-btn"
          >
            批量通过
          </el-button>
          <el-button 
            type="warning" 
            :disabled="selectedPosts.length === 0"
            @click="batchReject"
            class="batch-btn"
          >
            批量拒绝
          </el-button>
          <el-button 
            type="info" 
            :disabled="selectedPosts.length === 0"
            @click="batchTop"
            class="batch-btn"
          >
            批量置顶
          </el-button>
          <el-button 
            type="danger" 
            :disabled="selectedPosts.length === 0"
            @click="batchDelete"
            class="batch-btn"
          >
            批量删除
          </el-button>
        </div>
      </div>
      
      <!-- 无数据提示 -->
      <el-empty v-if="postList.length === 0" description="暂无帖子数据" style="margin-top: 50px;"></el-empty>
      
      <!-- 帖子列表 -->
      <el-table 
        v-if="postList.length > 0" 
        :data="postList" 
        border 
        style="width: 100%; margin-top: 15px;" 
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" :selectable="checkSelectable"></el-table-column>
        <el-table-column prop="user_id" label="用户ID" width="120"></el-table-column>
        <el-table-column prop="title" label="帖子标题" min-width="180"></el-table-column>
        <el-table-column prop="content" label="帖子内容" min-width="250">
          <template #default="scope">
            <span>{{ scope.row.content || '无内容' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="昵称" width="150">
          <template #default="scope">
            <span v-if="scope.row.is_anonymous" class="anonymous-tag">🔒 匿名用户</span>
            <span v-else>{{ scope.row.user_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="like_count" label="点赞数" width="100"></el-table-column>
        <el-table-column prop="comment_count" label="评论数" width="100"></el-table-column>
        <el-table-column prop="view_count" label="浏览量" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_top" label="置顶" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.is_top" type="info">已置顶</el-tag>
            <el-tag v-else type="default">未置顶</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="发布时间" width="180"></el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
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
          <span class="value">
            <span v-if="currentPost.is_anonymous" class="anonymous-tag">🔒 匿名用户 (UID: {{ currentPost.user_id }})</span>
            <span v-else>{{ currentPost.user_name }} (UID: {{ currentPost.user_id }})</span>
          </span>
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
        <div class="detail-item">
          <span class="label">匿名状态：</span>
          <span class="value">
            <el-tag v-if="currentPost.is_anonymous" type="warning">🔒 匿名帖子</el-tag>
            <el-tag v-else type="info">🌟 公开帖子</el-tag>
          </span>
        </div>
        <div class="detail-item" v-if="currentPost._formattedImages && currentPost._formattedImages.length">
          <span class="label">图片：</span>
          <div class="value images">
            <div 
              v-for="(img, index) in currentPost._formattedImages" 
              :key="index" 
              class="image-wrapper"
            >
              <el-image 
                :src="img" 
                fit="cover" 
                style="width: 120px; height: 120px; margin: 5px;"
                :error="handleImageError"
                :preview-src-list="currentPost._formattedImages"
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
        <div class="detail-item">
          <span class="label">评论列表：</span>
          <div class="value comments-list">
            <div class="comment-header">
              <span class="comment-count">共 {{ currentPostComments.length }} 条评论</span>
              <div class="comment-actions">
                <el-checkbox 
                  v-model="selectAllComments" 
                  @change="handleSelectAllComments"
                  :disabled="currentPostComments.length === 0"
                >全选</el-checkbox>
                <el-button 
                  type="danger" 
                  size="small" 
                  :disabled="selectedComments.length === 0"
                  @click="batchDeleteComments"
                  class="batch-delete-btn"
                >
                  删除选中 ({{ selectedComments.length }})
                </el-button>
              </div>
            </div>
            <div class="comment-table-container" v-if="currentPostComments.length > 0">
              <el-table 
                :data="currentPostComments" 
                border 
                style="width: 100%; margin-top: 10px;"
                @selection-change="handleCommentSelectionChange"
              >
                <el-table-column type="selection" width="50"></el-table-column>
                <el-table-column prop="id" label="评论ID" width="80"></el-table-column>
                <el-table-column prop="user_name" label="评论者" width="120"></el-table-column>
                <el-table-column prop="content" label="评论内容" min-width="200"></el-table-column>
                <el-table-column prop="create_time" label="评论时间" width="180"></el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="scope">
                    <el-button size="small" type="danger" @click="deleteComment(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="no-comments">
              <span>暂无评论</span>
            </div>
          </div>
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
// 评论多选相关
const selectedComments = ref([])
const selectAllComments = ref(false)
// 帖子批量选择相关
const selectedPosts = ref([])
const selectAll = ref(false)
const isIndeterminate = ref(false)

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
      // 处理帖子列表数据，确保用户ID和作者信息正确显示
      const posts = res.data.message.list || []
      postList.value = posts.map(post => {
        // 确保用户ID和昵称正确显示
        return {
          ...post,
          // 确保user_id显示为用户名
          user_id: post.user_id || '55555',
          // 确保user_name显示为昵称
          user_name: post.user_name || '车茂熙'
        }
      })
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
  // 搜索时重置页码为1
  currentPage.value = 1

  // 构建请求参数
  const params = {
    isAdmin: 1,
    pageindex: currentPage.value,
    pagesize: pageSize.value
  }

  // 如果有关键词，添加到参数中
  if (searchKey.value && searchKey.value.trim()) {
    params.keyword = searchKey.value.trim()
  }

  // 使用 params 对象发送请求
  axios.get('http://localhost:8082/api/community/posts', { params })
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
  
  // 确保图片URL格式正确 - 后端返回的可能是数组或字符串
  let formattedImages = [];
  if (postData.images) {
    try {
      let images = [];
      // 尝试解析图片数据
      if (typeof postData.images === 'string') {
        if (postData.images.startsWith('http')) {
          // 单个完整URL图片
          images = [postData.images];
        } else if (postData.images.startsWith('[')) {
          // JSON字符串数组
          images = JSON.parse(postData.images);
        } else {
          // 单个相对路径
          images = [postData.images];
        }
      } else if (Array.isArray(postData.images)) {
        // 已经是数组
        images = postData.images;
      }
      
      // 格式化图片URL，添加服务器前缀
      formattedImages = images.map(img => {
        if (img && typeof img === 'string') {
          if (img.startsWith('http') || img.startsWith('data:')) {
            return img;
          }
          // 添加服务器前缀
          return `http://localhost:8082${img.startsWith('/') ? '' : '/'}${img}`;
        }
        return null;
      }).filter(img => img && !img.includes('null')); // 过滤空值
      
    } catch (e) {
      console.error('解析图片失败:', e);
    }
  }
  
  postData._formattedImages = formattedImages;
  postData.images = JSON.stringify(formattedImages); // 保持兼容性
  
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
          // 从选中列表中移除
          selectedComments.value = selectedComments.value.filter(id => id !== comment.id);
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

// 处理评论选择变化
const handleCommentSelectionChange = (selection) => {
  selectedComments.value = selection.map(item => item.id);
}

// 全选/取消全选评论
const handleSelectAllComments = (checked) => {
  if (checked) {
    selectedComments.value = currentPostComments.value.map(comment => comment.id);
  } else {
    selectedComments.value = [];
  }
}

// 批量删除评论
const batchDeleteComments = () => {
  if (selectedComments.value.length === 0) {
    ElMessage.warning('请先选择要删除的评论');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedComments.value.length} 条评论吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  .then(() => {
    // 使用批量删除API
    axios.post('http://localhost:8082/api/community/comments/batch-delete', {
      comment_ids: selectedComments.value
    })
      .then(res => {
        if (res.data.status === 0) {
          // 更新评论列表
          const deletedIds = new Set(selectedComments.value);
          currentPostComments.value = currentPostComments.value.filter(item => !deletedIds.has(item.id));
          // 清空选中列表
          selectedComments.value = [];
          selectAllComments.value = false;
          // 更新当前帖子的评论数
          if (currentPost.value) {
            currentPost.value.comment_count = Math.max(0, currentPost.value.comment_count - deletedIds.size);
          }
          // 刷新帖子列表
          getPostList();
          ElMessage.success(res.data.message || '删除成功');
        } else {
          ElMessage.error(res.data.message || '删除失败');
        }
      })
      .catch(err => {
        console.error('批量删除评论失败:', err);
        ElMessage.error('批量删除失败');
      });
  })
  .catch(err => {
    if (err !== 'cancel') {
      console.error('批量删除失败:', err);
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

// ==================== 批量操作相关函数 ====================

// 检查行是否可选（已通过的帖子不能置顶，但可以选择）
const checkSelectable = (row) => {
  return true // 所有帖子都可以被选择
}

// 处理帖子选择变化
const handleSelectionChange = (selection) => {
  selectedPosts.value = selection
  // 更新全选状态
  if (selection.length === 0) {
    selectAll.value = false
    isIndeterminate.value = false
  } else if (selection.length === postList.value.length) {
    selectAll.value = true
    isIndeterminate.value = false
  } else {
    selectAll.value = false
    isIndeterminate.value = true
  }
}

// 全选/取消全选帖子
const handleSelectAll = (checked) => {
  if (checked) {
    selectedPosts.value = [...postList.value]
  } else {
    selectedPosts.value = []
  }
  isIndeterminate.value = false
}

// 批量通过审核
const batchApprove = () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请先选择要通过的帖子')
    return
  }
  
  // 过滤出待审核的帖子
  const pendingPosts = selectedPosts.value.filter(post => post.status === 0)
  if (pendingPosts.length === 0) {
    ElMessage.warning('所选帖子中没有待审核的帖子')
    return
  }
  
  ElMessageBox.confirm(
    `确定要通过选中的 ${pendingPosts.length} 篇帖子的审核吗？`,
    '批量审核通过',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
  .then(() => {
    // 使用循环单个通过的方式（如果后端没有批量API）
    Promise.all(pendingPosts.map(post => 
      axios.put(`http://localhost:8082/api/community/post/${post.id}/status`, {
        status: 1
      })
    ))
    .then(res => {
      const successCount = res.filter(r => r.data.status === 0).length
      ElMessage.success(`成功通过 ${successCount} 篇帖子`)
      // 清空选择
      clearSelection()
      // 刷新列表
      getPostList()
    })
    .catch(err => {
      console.error('批量通过失败:', err)
      ElMessage.error('批量通过失败')
    })
  })
  .catch(() => {})
}

// 批量拒绝审核
const batchReject = () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请先选择要拒绝的帖子')
    return
  }
  
  // 过滤出待审核的帖子
  const pendingPosts = selectedPosts.value.filter(post => post.status === 0)
  if (pendingPosts.length === 0) {
    ElMessage.warning('所选帖子中没有待审核的帖子')
    return
  }
  
  ElMessageBox.confirm(
    `确定要拒绝选中的 ${pendingPosts.length} 篇帖子的审核吗？`,
    '批量审核拒绝',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  .then(() => {
    // 使用循环单个拒绝的方式
    Promise.all(pendingPosts.map(post => 
      axios.put(`http://localhost:8082/api/community/post/${post.id}/status`, {
        status: 2,
        reason: '内容不符合要求'
      })
    ))
    .then(res => {
      const successCount = res.filter(r => r.data.status === 0).length
      ElMessage.success(`已拒绝 ${successCount} 篇帖子`)
      // 清空选择
      clearSelection()
      // 刷新列表
      getPostList()
    })
    .catch(err => {
      console.error('批量拒绝失败:', err)
      ElMessage.error('批量拒绝失败')
    })
  })
  .catch(() => {})
}

// 批量置顶
const batchTop = () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请先选择要置顶的帖子')
    return
  }
  
  // 过滤出已通过的帖子（只有已通过的帖子才能置顶）
  const approvedPosts = selectedPosts.value.filter(post => post.status === 1)
  if (approvedPosts.length === 0) {
    ElMessage.warning('所选帖子中没有已通过审核的帖子（只有已通过的帖子才能置顶）')
    return
  }
  
  ElMessageBox.confirm(
    `确定要将选中的 ${approvedPosts.length} 篇帖子置顶吗？`,
    '批量置顶',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
  .then(() => {
    // 使用循环单个置顶的方式
    Promise.all(approvedPosts.map(post => 
      axios.put(`http://localhost:8082/api/community/post/${post.id}/top`, {
        is_top: 1
      })
    ))
    .then(res => {
      const successCount = res.filter(r => r.data.status === 0).length
      ElMessage.success(`已置顶 ${successCount} 篇帖子`)
      // 清空选择
      clearSelection()
      // 刷新列表
      getPostList()
    })
    .catch(err => {
      console.error('批量置顶失败:', err)
      ElMessage.error('批量置顶失败')
    })
  })
  .catch(() => {})
}

// 批量删除
const batchDelete = () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请先选择要删除的帖子')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedPosts.value.length} 篇帖子吗？此操作不可恢复！`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  )
  .then(() => {
    // 使用循环单个删除的方式
    Promise.all(selectedPosts.value.map(post => 
      axios.delete(`http://localhost:8082/api/community/post/${post.id}`)
    ))
    .then(res => {
      const successCount = res.filter(r => r.data.status === 0).length
      ElMessage.success(`已删除 ${successCount} 篇帖子`)
      // 清空选择
      clearSelection()
      // 刷新列表
      getPostList()
    })
    .catch(err => {
      console.error('批量删除失败:', err)
      ElMessage.error('批量删除失败')
    })
  })
  .catch(() => {})
}

// 清空选择状态
const clearSelection = () => {
  selectedPosts.value = []
  selectAll.value = false
  isIndeterminate.value = false
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
  background: rgba(90, 165, 222, 0.7);
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
   border-color:rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.post-manage :deep(.el-input__wrapper.is-focus) {
   border-color:rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
}

/* 搜索按钮样式 */
.post-manage :deep(.el-input__append-inner .el-button) {
  border-radius: 12px;
  font-weight: 600;
  background: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 15px rgba(66, 165, 245, 0.3);
  border: none;
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-manage :deep(.el-input__append-inner .el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  background: rgba(90, 165, 222, 1);
}

/* 表格样式 */
.post-manage :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
}

.post-manage :deep(.el-table__header-wrapper th) {
  background: #f7fafc;
  font-weight: 600;
  font-size: 14px;
  text-align: left;
  padding: 12px;
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
  padding: 12px;
  text-align: left;
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
  background: rgba(90, 165, 222, 0.7);
  box-shadow: 0 4px 15px rgba(66, 165, 245, 0.3);
  border: none;
}

.post-manage :deep(.el-button--primary:hover) {
  background: rgba(90, 165, 222, 1);
}

.post-manage :deep(.el-button--warning) {
  background: rgba(237, 137, 54, 0.7);
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
  border: none;
}

.post-manage :deep(.el-button--warning:hover) {
  background: rgba(237, 137, 54, 1);
}

.post-manage :deep(.el-button--success) {
  background: rgba(72, 187, 120, 0.7);
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
  border: none;
}

.post-manage :deep(.el-button--success:hover) {
  background: rgba(72, 187, 120, 1);
}

.post-manage :deep(.el-button--danger) {
  background: rgba(229, 62, 62, 0.7);
  box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);
  border: none;
}

.post-manage :deep(.el-button--danger:hover) {
  background: rgba(229, 62, 62, 1);
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
  background: linear-gradient(180deg, rgba(173, 216, 255, 0.9) 0%, /* 浅冰蓝 */ rgba(135, 206, 235, 0.9) 50%, /* 中冰蓝 */ rgba(96, 168, 230, 0.9) 100% /* 深冰蓝 */);
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
  background: linear-gradient(180deg, rgba(173, 216, 255, 0.9) 0%, /* 浅冰蓝 */ rgba(135, 206, 235, 0.9) 50%, /* 中冰蓝 */ rgba(96, 168, 230, 0.9) 100% /* 深冰蓝 */);
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

/* 评论列表头部样式 */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f7fafc;
  border-radius: 8px 8px 0 0;
  border: 1px solid #e2e8f0;
  border-bottom: none;
}

.comment-count {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.comment-actions :deep(.el-checkbox) {
  margin-right: 10px;
}

.batch-delete-btn {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.batch-delete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.batch-delete-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

/* 无评论提示 */
.no-comments {
  padding: 40px;
  text-align: center;
  background: #f7fafc;
  border-radius: 8px;
  color: #a0aec0;
  font-size: 14px;
  border: 1px solid #e2e8f0;
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

/* 匿名标签样式 */
.anonymous-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  color: #7b1fa2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 批量操作工具栏样式 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 15px;
  background: linear-gradient(180deg,
		  rgba(173, 216, 255, 0.9) 0%,    /* 浅冰蓝 */
		  rgba(135, 206, 235, 0.9) 50%,  /* 中冰蓝 */
		  rgba(96, 168, 230, 0.9) 100%   /* 深冰蓝 */
		);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.batch-actions:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.batch-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.batch-left :deep(.el-checkbox) {
  color: #fff;
  font-weight: 600;
}

.batch-left :deep(.el-checkbox__label) {
  color: #fff !important;
  font-weight: 600;
  font-size: 14px;
}

.batch-left :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #fff;
  border-color: #fff;
}

.batch-left :deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #667eea;
}

.batch-left :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #fff;
  border-color: #fff;
}

.batch-left :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner::before) {
  background-color: #667eea;
  border-color: #667eea;
}

.selected-count {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.batch-right {
  display: flex;
  gap: 10px;
}

.batch-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 16px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.batch-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.batch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 批量操作按钮特殊样式 */
.batch-right :deep(.el-button--success) {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
}

.batch-right :deep(.el-button--success):not(:disabled):hover {
  background: linear-gradient(135deg, #0d8a7f 0%, #2dd36f 100%);
}

.batch-right :deep(.el-button--warning) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
}

.batch-right :deep(.el-button--warning):not(:disabled):hover {
  background: linear-gradient(135deg, #e083c7 0%, #e0475a 100%);
}

.batch-right :deep(.el-button--info) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  color: #fff;
}

.batch-right :deep(.el-button--info):not(:disabled):hover {
  background: linear-gradient(135deg, #3e9be6 0%, #00d9e6 100%);
}

.batch-right :deep(.el-button--danger) {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  border: none;
}

.batch-right :deep(.el-button--danger):not(:disabled):hover {
  background: linear-gradient(135deg, #e6395c 0%, #e64425 100%);
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
  
  /* 移动端批量操作工具栏 */
  .batch-actions {
    flex-direction: column;
    gap: 12px;
    padding: 12px 15px;
  }
  
  .batch-left {
    width: 100%;
    justify-content: space-between;
  }
  
  .batch-right {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
  
  .batch-btn {
    flex: 1;
    min-width: 70px;
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>