# 跨设备书签应用

一个简单易用的书签管理应用，支持跨设备同步访问，包含添加、编辑、删除书签功能，以及明亮/暗黑两种主题。

## 功能特点

- 📱 **跨设备同步**: 在手机、平板和电脑间无缝访问书签
- 🔖 **书签管理**: 添加、编辑、删除和分类管理书签
- 🏷️ **标签系统**: 为书签添加多个标签，便于快速查找
- 🌓 **主题切换**: 支持明亮模式和暗黑模式
- 🔍 **搜索功能**: 快速搜索书签标题、URL和标签
- 📂 **分类管理**: 创建自定义分类，为书签归类
- 📱 **响应式设计**: 完美适配各种屏幕尺寸

## 技术栈

- **前端**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **后端**: Cloudflare Workers
- **存储**: Cloudflare Workers KV
- **部署**: Cloudflare Pages

## 本地开发

### 前提条件

- Node.js 16.x 或更高版本
- npm 或 yarn
- Cloudflare账户

### 安装步骤

1. 克隆项目到本地

```bash
git clone https://github.com/your-username/bookmark-app.git
cd bookmark-app
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 安装Cloudflare Wrangler CLI

```bash
npm install -g @cloudflare/wrangler
# 或
yarn global add @cloudflare/wrangler
```

4. 登录Cloudflare账户

```bash
wrangler login
```

5. 配置KV命名空间

```bash
# 创建书签数据KV命名空间
wrangler kv:namespace create BOOKMARKS_APP_DATA

# 创建配置数据KV命名空间
wrangler kv:namespace create BOOKMARKS_APP_CONFIG

# 创建开发环境KV命名空间
wrangler kv:namespace create BOOKMARKS_APP_DATA --preview
wrangler kv:namespace create BOOKMARKS_APP_CONFIG --preview
```

6. 更新`wrangler.toml`文件，填入创建的KV命名空间ID

7. 启动开发服务器

```bash
wrangler dev
```

8. 在浏览器中访问 `http://localhost:8787`

## 部署到Cloudflare Pages

### 方法一：通过Cloudflare Dashboard部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账户
3. 点击 "Pages"
4. 点击 "Create a Project"
5. 选择 "Connect to Git"
6. 选择你的GitHub/GitLab仓库
7. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: 留空
   - **Build output directory**: 留空
8. 点击 "Save and Deploy"

### 方法二：通过Wrangler CLI部署

1. 更新`wrangler.toml`文件中的账户ID和区域ID
2. 执行部署命令

```bash
wrangler publish
```

## 配置KV命名空间

部署后，你需要在Cloudflare Dashboard中配置KV命名空间：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账户
3. 点击 "Workers & Pages"
4. 选择你的Pages项目
5. 点击 "Settings"
6. 点击 "Functions"
7. 在 "KV namespaces" 部分，点击 "Add binding"
8. 添加两个绑定：
   - **Variable name**: BOOKMARKS_APP_DATA
   - **KV namespace**: 选择之前创建的BOOKMARKS_APP_DATA命名空间
   - **Variable name**: BOOKMARKS_APP_CONFIG
   - **KV namespace**: 选择之前创建的BOOKMARKS_APP_CONFIG命名空间

## 使用说明

### 添加书签

1. 点击右下角的 "+" 按钮
2. 输入书签标题和URL
3. 选择或创建分类（可选）
4. 添加标签（可选，用逗号分隔）
5. 点击 "保存"

### 编辑书签

1. 点击书签卡片上的铅笔图标
2. 修改书签信息
3. 点击 "保存"

### 删除书签

1. 点击书签卡片上的垃圾桶图标
2. 在确认对话框中点击 "删除"

### 切换主题

点击顶部导航栏中的太阳/月亮图标切换明亮/暗黑模式。

### 分类管理

1. 点击 "添加分类" 按钮
2. 输入分类名称
3. 选择分类颜色
4. 点击 "保存"

### 搜索书签

在顶部搜索框中输入关键词，可搜索书签标题、URL和标签。

## 数据持久化

本应用使用Cloudflare Workers KV进行数据持久化存储，确保你的书签数据安全保存并可在所有设备上访问。

## 浏览器兼容性

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 许可证

MIT License