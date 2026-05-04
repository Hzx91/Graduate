<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">数据概览</h2>
      <p class="page-subtitle">实时监控平台数据，及时了解运营状况</p>
    </div>
    
    <!-- 核心数据指标卡片区 -->
    <div class="metrics-section">
      <div class="metrics-grid">
        <!-- 今日新增情绪日记 -->
        <div class="metric-card small" @click="goToMoodDiaryManage">
          <div class="metric-icon blue">
            <el-icon><Document /></el-icon>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">今日新增情绪日记</h3>
            <p class="metric-value">{{ statsData.todayEmotionCount }}</p>
            <p class="metric-desc">今日用户记录的情绪日记数量</p>
          </div>
        </div>
        
        <!-- 今日活跃用户数 -->
        <div class="metric-card small" @click="goToUserManage">
          <div class="metric-icon green">
            <el-icon><User /></el-icon>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">今日活跃用户数</h3>
            <p class="metric-value">{{ statsData.todayActiveUser }}</p>
            <p class="metric-desc">今日有活动的用户数量</p>
          </div>
        </div>
        
        <!-- 待审核帖子数 -->
        <div class="metric-card small" @click="goToPostManage">
          <div class="metric-icon orange">
            <el-icon><Document /></el-icon>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">待审核帖子数</h3>
            <p class="metric-value">{{ statsData.pendingPostCount }}</p>
            <p class="metric-desc">等待审核的帖子数量</p>
          </div>
          <span v-if="statsData.pendingPostCount > 0" class="badge">{{ statsData.pendingPostCount }}</span>
        </div>
        
        <!-- 平台总用户数 -->
        <div class="metric-card large" @click="goToUserManage">
          <div class="metric-icon purple">
            <el-icon><User /></el-icon>
          </div>
          <div class="metric-content">
            <h3 class="metric-title">平台总用户数</h3>
            <p class="metric-value large">{{ statsData.totalUserCount }}</p>
            <p class="metric-desc">平台注册用户总数</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数据可视化图表区 -->
    <div class="charts-section">
      <div class="charts-grid">
        <!-- 近7天情绪日记趋势 -->
        <div class="chart-card wide">
          <h3 class="chart-title">近7天情绪日记趋势</h3>
          <div class="chart-container">
            <canvas ref="trendChart"></canvas>
          </div>
        </div>
        
        <!-- 情绪类型占比 -->
        <div class="chart-card">
          <h3 class="chart-title">情绪类型占比</h3>
          <div class="chart-container">
            <canvas ref="distributionChart"></canvas>
          </div>
        </div>
        
        <!-- 今日情绪峰值 -->
        <div class="chart-card small">
          <h3 class="chart-title">今日情绪洞察</h3>
          <div class="peak-info">
            <div class="peak-item">
              <span class="peak-label">峰值时间</span>
              <span class="peak-value">{{ peakTime }}</span>
            </div>
            <div class="peak-item">
              <span class="peak-label">最常见情绪</span>
              <span class="peak-value">{{ mostCommonEmotion }}</span>
            </div>
            <div class="peak-item">
              <span class="peak-label">平均情绪值</span>
              <span class="peak-value">{{ averageEmotion }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷操作 + 最近动态区 -->
    <div class="bottom-section">
      <div class="bottom-grid">
        <!-- 快捷操作 -->
        <div class="action-card">
          <h3 class="section-title">快捷操作</h3>
          <div class="action-buttons">
            <el-button type="primary" round @click="goToPendingPosts" class="action-btn">
              <el-icon><Document /></el-icon>
              <span>查看待审核帖子</span>
            </el-button>
            <el-button type="success" round @click="goToResourceManage" class="action-btn">
              <el-icon><Picture /></el-icon>
              <span>新增情绪调节资源</span>
            </el-button>
            <el-button type="info" round @click="goToUserManage" class="action-btn">
              <el-icon><User /></el-icon>
              <span>查看用户列表</span>
            </el-button>
            <el-button type="warning" round @click="exportEmotionData" class="action-btn">
              <el-icon><Document /></el-icon>
              <span>导出情绪数据</span>
            </el-button>
          </div>
        </div>
        
        <!-- 最近动态 -->
        <div class="activity-card">
          <h3 class="section-title">最近动态</h3>
          <div class="activity-list">
            <!-- 最新情绪记录 -->
            <div class="activity-section">
              <h4 class="activity-title">最新情绪记录</h4>
              <el-empty v-if="recentEmotions.length === 0" description="暂无情绪记录" />
              <ul class="activity-items" v-else>
                <li class="activity-item" v-for="emotion in recentEmotions" :key="emotion.createTime">
                  <div class="activity-avatar">
                    <el-avatar>{{ emotion.username.charAt(0) }}</el-avatar>
                  </div>
                  <div class="activity-content">
                    <div class="activity-header">
                      <span class="activity-username">{{ emotion.username }}</span>
                      <span class="activity-time">{{ emotion.createTime }}</span>
                    </div>
                    <div class="activity-text">{{ emotion.content }}</div>
                  </div>
                </li>
              </ul>
              <el-button type="text" @click="goToMoodDiaryManage" class="view-more-btn">查看更多</el-button>
            </div>
            
            <!-- 最新帖子 -->
            <div class="activity-section">
              <h4 class="activity-title">最新帖子</h4>
              <el-empty v-if="recentPosts.length === 0" description="暂无帖子" />
              <ul class="activity-items" v-else>
                <li class="activity-item" v-for="post in recentPosts" :key="post.postId">
                  <div class="activity-avatar">
                    <el-avatar>{{ post.username.charAt(0) }}</el-avatar>
                  </div>
                  <div class="activity-content">
                    <div class="activity-header">
                      <span class="activity-username">{{ post.username }}</span>
                      <span class="activity-time">{{ post.createTime }}</span>
                    </div>
                    <div class="activity-title-text">{{ post.title }}</div>
                    <div class="activity-status" :class="`status-${post.status}`">
                      {{ post.status === 'pending' ? '待审核' : post.status === 'approved' ? '已通过' : '已拒绝' }}
                    </div>
                  </div>
                </li>
              </ul>
              <el-button type="text" @click="goToPostManage" class="view-more-btn">查看更多</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, User, Picture } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()

// 统计数据
const statsData = ref({
  todayEmotionCount: 12,
  todayActiveUser: 8,
  pendingPostCount: 3,
  totalUserCount: 156
})

// 近7天情绪日记趋势数据
const trendData = ref({
  dates: ["03-21", "03-22", "03-23", "03-24", "03-25", "03-26", "03-27"],
  counts: [5, 8, 6, 10, 12, 9, 11]
})

// 情绪类型占比数据
const distributionData = ref([
  { name: "开心", value: 45 },
  { name: "平静", value: 30 },
  { name: "焦虑", value: 15 },
  { name: "难过", value: 8 },
  { name: "愤怒", value: 2 }
])

// 最近情绪记录
const recentEmotions = ref([
  { userId: "test", username: "测试用户", emotion: "mood2", content: "加油加油干", createTime: "2026-03-27 19:00" },
  { userId: "user1", username: "张三", emotion: "mood1", content: "今天心情很好", createTime: "2026-03-27 18:30" },
  { userId: "user2", username: "李四", emotion: "mood3", content: "平静的一天", createTime: "2026-03-27 18:00" },
  { userId: "user3", username: "王五", emotion: "mood5", content: "有点难过", createTime: "2026-03-27 17:30" },
  { userId: "user4", username: "赵六", emotion: "mood7", content: "有点焦虑", createTime: "2026-03-27 17:00" }
])

// 最近帖子
const recentPosts = ref([
  { postId: 1, userId: "55555", username: "车茂熙", title: "今天好开心", status: "pending", createTime: "2026-03-27 18:30" },
  { postId: 2, userId: "user1", username: "张三", title: "分享一个好心情", status: "approved", createTime: "2026-03-27 18:00" },
  { postId: 3, userId: "user2", username: "李四", title: "如何缓解焦虑", status: "pending", createTime: "2026-03-27 17:30" },
  { postId: 4, userId: "user3", username: "王五", title: "今天的感悟", status: "approved", createTime: "2026-03-27 17:00" },
  { postId: 5, userId: "user4", username: "赵六", title: "分享一个小技巧", status: "rejected", createTime: "2026-03-27 16:30" }
])

// 今日情绪洞察数据
const peakTime = ref('18:00')
const mostCommonEmotion = ref('开心')
const averageEmotion = ref('积极')

// 图表引用
const trendChart = ref(null)
const distributionChart = ref(null)

// 图表实例
let trendChartInstance = null
let distributionChartInstance = null

// 初始化图表
const initCharts = () => {
  // 近7天情绪日记趋势图
  if (trendChart.value) {
    trendChartInstance = echarts.init(trendChart.value)
    trendChartInstance.setOption({
      title: {
        text: '近7天情绪日记趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: trendData.value.dates,
        axisLine: {
          lineStyle: {
            color: '#e8e8e8'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLine: {
          lineStyle: {
            color: '#e8e8e8'
          }
        },
        axisLabel: {
          color: '#666'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      series: [{
        name: '情绪日记数量',
        type: 'line',
        data: trendData.value.counts,
        smooth: true,
        lineStyle: {
          color: '#1890ff',
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(24, 144, 255, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(24, 144, 255, 0.1)'
            }
          ])
        },
        itemStyle: {
          color: '#1890ff'
        }
      }]
    })
  }
  
  // 情绪类型占比饼图
  if (distributionChart.value) {
    distributionChartInstance = echarts.init(distributionChart.value)
    distributionChartInstance.setOption({
      title: {
        text: '情绪类型占比',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          color: '#666'
        }
      },
      series: [{
        name: '情绪类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: distributionData.value
      }]
    })
  }
}

// 销毁图表
const destroyCharts = () => {
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  if (distributionChartInstance) {
    distributionChartInstance.dispose()
  }
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  if (trendChartInstance) {
    trendChartInstance.resize()
  }
  if (distributionChartInstance) {
    distributionChartInstance.resize()
  }
}

// 页面加载时初始化
onMounted(() => {
  initCharts()
  // 模拟数据加载
  loadData()
  // 添加窗口大小变化的事件监听器
  window.addEventListener('resize', handleResize)
})

// 页面卸载时销毁图表
onUnmounted(() => {
  destroyCharts()
  // 移除窗口大小变化的事件监听器
  window.removeEventListener('resize', handleResize)
})

// 加载数据
const loadData = () => {
  // 这里可以添加真实的API调用
  // 模拟数据加载延迟
  setTimeout(() => {
    // 数据已在初始化时设置
  }, 500)
}

// 跳转到情绪日记管理
const goToMoodDiaryManage = () => {
  router.push('/home/mood-diary-manage')
}

// 跳转到用户管理
const goToUserManage = () => {
  router.push('/home/user-manage')
}

// 跳转到帖子管理
const goToPostManage = () => {
  router.push('/home/post-manage')
}

// 跳转到待审核帖子
const goToPendingPosts = () => {
  router.push('/home/post-manage')
  // 这里可以添加查询参数，筛选待审核帖子
}

// 跳转到资源管理
const goToResourceManage = () => {
  router.push('/home/resource-manage')
}

// 导出情绪数据
const exportEmotionData = () => {
  ElMessage.success('导出数据功能已触发')
  // 这里可以添加真实的导出逻辑
}
</script>

<style scoped>
/* 仪表盘容器 */
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 核心数据指标卡片区 */
.metrics-section {
  margin-bottom: 30px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
}

/* 统计卡片 */
.metric-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #409EFF;
}

.metric-card.small {
  grid-row: 1;
}

.metric-card.large {
  grid-column: 1 / -1;
  grid-row: 2;
  display: flex;
  align-items: center;
  gap: 30px;
}

/* 指标图标 */
.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 15px;
}

.metric-card.large .metric-icon {
  margin-bottom: 0;
}

.metric-icon.blue {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.metric-icon.green {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.metric-icon.orange {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.metric-icon.purple {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
}

/* 指标内容 */
.metric-content {
  flex: 1;
}

.metric-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 0 0 10px 0;
}

.metric-value {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  margin: 0 0 5px 0;
}

.metric-value.large {
  font-size: 48px;
}

.metric-desc {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 徽章 */
.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f56c6c;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

/* 图表区域 */
.charts-section {
  margin-bottom: 30px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
}

/* 图表卡片 */
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

.chart-card.wide {
  grid-column: 1 / -1;
  grid-row: 1;
}

.chart-card.small {
  grid-column: 2;
  grid-row: 2;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 20px 0;
}

.chart-container {
  width: 100%;
  height: 300px;
}

/* 今日情绪洞察 */
.peak-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.peak-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.peak-item:last-child {
  border-bottom: none;
}

.peak-label {
  font-size: 14px;
  color: #666;
}

.peak-value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* 底部区域 */
.bottom-section {
  margin-bottom: 30px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

/* 快捷操作区 */
.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 20px 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
  gap: 8px;
  border-radius: 8px;
}

/* 最近动态区 */
.activity-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-section {
  margin-bottom: 0;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 0 0 15px 0;
}

.activity-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-avatar {
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.activity-username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.activity-text {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.activity-title-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.activity-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.status-pending {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-approved {
  background: #f0f9eb;
  color: #67c23a;
}

.status-rejected {
  background: #fef0f0;
  color: #f56c6c;
}

.view-more-btn {
  width: 100%;
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .metric-card.large {
    grid-column: 1 / -1;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card.wide,
  .chart-card,
  .chart-card.small {
    grid-column: 1;
  }
  
  .bottom-grid {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    order: 2;
  }
  
  .activity-card {
    order: 1;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-card.small,
  .metric-card.large {
    grid-column: 1;
    grid-row: auto;
  }
  
  .metric-card.large {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>