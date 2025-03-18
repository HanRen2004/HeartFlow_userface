# 心语星 - 心理健康平台前端文档

## 项目概述
心语星是一个专注于心理健康的在线平台，提供在线聊天、心理辅导、音乐放松等功能。本文档主要介绍前端实现细节，便于后续开发和维护。

## 技术栈
- HTML5
- CSS3
- 原生JavaScript
- Bootstrap 5.3.0
- Google Fonts (Noto Sans SC)

## 项目结构
```
├── index.html          # 主页面
├── style.css          # 样式文件
├── script.js          # 主要脚本文件
└── README.md          # 项目文档
```

## 样式设计

### 主题颜色
项目使用CSS变量定义主题颜色，便于统一管理和切换主题：
```css
:root {
    --primary-color: #5D87A4;    /* 主色调 */
    --secondary-color: #7EA4B2;  /* 辅助色 */
    --background-color: #F7F9FC; /* 背景色 */
    --card-bg: #FFFFFF;          /* 卡片背景 */
    --text-color: #34495E;       /* 文字颜色 */
    --accent-color: #9DBAD5;     /* 强调色 */
    --hover-color: #4A7A9C;      /* 悬停状态色 */
}
```

### 布局系统
- 采用Flex布局实现响应式设计
- 页面最大宽度限制为1200px
- 聊天界面采用固定高度设计，确保最佳用户体验

### 组件样式
1. 导航栏
   - 固定在顶部
   - 包含品牌标识和导航菜单
   - 支持响应式设计

2. 聊天界面
   - 左侧会话列表（可收起）
   - 右侧聊天主区域
   - 支持会话管理和搜索

3. 消息气泡
   - 用户消息右对齐，使用渐变背景
   - 机器人消息左对齐，使用白色背景
   - 支持长文本自动换行

## JavaScript功能实现

### 核心类：ChatSessionManager
管理聊天会话的核心类，主要功能：

1. 会话管理
```javascript
class ChatSessionManager {
    constructor() {
        this.sessions = [];
        this.currentSessionId = null;
    }
    
    // 创建新会话
    createNewSession() { ... }
    
    // 加载会话
    loadSession(sessionId) { ... }
    
    // 删除会话
    deleteSession(sessionId) { ... }
}
```

2. 本地存储
- 使用localStorage存储会话数据
- 自动保存会话状态和消息历史

### 接口集成指南

1. 消息发送接口
```javascript
async function sendMessage(message) {
    // TODO: 实现与后端的消息发送接口
    // 示例：
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            sessionId: chatManager.currentSessionId
        })
    });
    return await response.json();
}
```

2. 会话管理接口
```javascript
// 创建新会话
async function createSession() {
    // TODO: 实现会话创建接口
}

// 获取会话历史
async function getSessionHistory(sessionId) {
    // TODO: 实现获取会话历史接口
}

// 删除会话
async function deleteSession(sessionId) {
    // TODO: 实现删除会话接口
}
```

### 扩展功能实现指南

1. 添加新的消息类型
```javascript
function renderCustomMessage(messageData) {
    // 创建自定义消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageData.type}-message`;
    // 添加自定义内容
    return messageDiv;
}
```

2. 实现新的交互功能
```javascript
function setupNewFeature() {
    // 1. 添加必要的HTML结构
    // 2. 编写对应的CSS样式
    // 3. 实现JavaScript交互逻辑
    // 4. 注册事件监听器
}
```

## 注意事项

1. 性能优化
- 使用防抖/节流处理频繁事件
- 优化DOM操作，避免频繁重绘
- 合理使用本地存储

2. 兼容性
- 主要支持现代浏览器
- 使用CSS前缀确保跨浏览器兼容性
- 考虑移动端适配

3. 安全性
- 实现XSS防护
- 敏感数据加密存储
- 添加必要的用户认证

## 后续开发建议

1. 功能增强
- 添加语音输入支持
- 实现图片/文件发送
- 添加表情包支持
- 实现消息撤回功能

2. 性能优化
- 实现消息分页加载
- 添加消息缓存机制
- 优化大量消息场景的性能

3. 用户体验
- 添加消息发送状态提示
- 实现打字状态显示
- 添加消息搜索功能
- 支持快捷回复

## 维护和更新
1. 定期检查并更新依赖包
2. 保持代码风格一致性
3. 及时处理用户反馈
4. 记录重要更新日志 