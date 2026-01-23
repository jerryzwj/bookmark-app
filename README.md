# Cloudflare Workers + KV 导航页

一个基于 Cloudflare Workers 和 KV 存储的现代化、响应式导航页，支持书签管理、分类管理、暗黑模式和网站图标自动获取。

## ✨ 功能特性

- 📌 **书签管理**：添加、编辑、删除书签，支持分类管理
- 🔒 **密码保护**：所有书签操作都需要密码验证
- 🌓 **暗黑模式**：支持自动切换和手动切换，保存用户偏好
- 🎨 **现代化设计**：采用玻璃态设计，带有紫色发光效果
- 🖼️ **网站图标**：自动获取网站 favicon，支持缓存
- 📱 **响应式布局**：适配桌面端、平板和移动端
- ⚡ **高性能**：基于 Cloudflare Workers，全球边缘部署
- 📦 **KV 存储**：使用 Cloudflare KV 存储书签数据

## 🛠️ 技术栈

- **前端框架**：原生 HTML/CSS/JavaScript
- **样式**：Tailwind CSS + 自定义 CSS
- **部署**：Cloudflare Workers
- **存储**：Cloudflare KV
- **图标**：Font Awesome 4.7.0

## 🚀 部署说明

### 1. 准备工作

- 注册 Cloudflare 账号
- 安装 Wrangler CLI：`npm install -g wrangler`
- 登录 Wrangler：`wrangler login`

### 2. 创建项目

```bash
# 克隆或复制本项目代码
mkdir my-nav && cd my-nav
# 初始化 Wrangler 项目
wrangler init
```

### 3. 配置 KV 命名空间

```bash
# 创建 KV 命名空间
wrangler kv:namespace create BOOKMARKS_KV
# 开发环境 KV 命名空间
wrangler kv:namespace create BOOKMARKS_KV --preview
```

### 4. 修改配置文件

创建 `wrangler.toml` 文件，内容如下：

```toml
name = "my-nav"
main = "worker.js"
compatibility_date = "2025-11-25"

[[kv_namespaces]]
binding = "BOOKMARKS_KV"
id = "<YOUR_KV_NAMESPACE_ID>"
preview_id = "<YOUR_PREVIEW_KV_NAMESPACE_ID>"

[vars]
BOOKMARK_PASSWORD = "your_password_here"
```

### 5. 部署项目

```bash
# 本地开发
wrangler dev

# 部署到生产环境
wrangler deploy
```

## ⚙️ 配置说明

### 环境变量

- `BOOKMARK_PASSWORD`：书签操作密码
- `BOOKMARKS_KV`：KV 存储命名空间绑定

### 自定义主题

可以修改代码中的以下变量来调整主题：

- `cardColorPool`：浅色模式卡片颜色
- `darkCardColorPool`：深色模式卡片颜色
- `primary`：主题主色
- `secondary`：主题次要色

## 📖 使用说明

### 添加书签

1. 点击右上角的「添加」按钮
2. 填写网站名称、网址和分类
3. 输入操作密码
4. 点击「保存网址」按钮

### 编辑书签

1. 点击书签卡片上的编辑图标
2. 修改相关信息
3. 输入操作密码
4. 点击「保存网址」按钮

### 删除书签

1. 点击书签卡片上的删除图标
2. 输入操作密码
3. 点击「确认删除」按钮

### 切换暗黑模式

点击右上角的月亮/太阳图标切换主题。

### 分类筛选

点击顶部的分类标签可以筛选书签。

## 🏗️ 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
wrangler dev
```

访问 `http://127.0.0.1:8787` 查看效果。

### 测试 API

```bash
# 获取分类
curl http://127.0.0.1:8787/api/get-categories

# 获取书签
curl http://127.0.0.1:8787/api/get-bookmarks

# 添加书签
curl -X POST -H "Content-Type: application/json" -d '{"name":"百度","url":"https://www.baidu.com","category":"搜索引擎","password":"your_password"}' http://127.0.0.1:8787/api/save-bookmark
```

## 📁 项目结构

```
.
├── worker.js          # 主代码文件
├── wrangler.toml      # Wrangler 配置文件
└── README.md          # 项目说明文档
```

## 🎨 设计特点

### 玻璃态设计

采用了现代化的玻璃态设计，带有模糊效果和半透明背景，创造出层次感。

### 紫色发光效果

在卡片、按钮和边框上使用了紫色发光效果，增强视觉吸引力。

### 响应式布局

使用 Tailwind CSS 的响应式工具类，确保在不同设备上都有良好的显示效果。

## 📝 注意事项

1. 本地开发环境中，由于没有配置 KV 存储，所以会显示空的书签列表
2. 部署到 Cloudflare Workers 后，需要配置 KV 命名空间才能正常使用
3. 密码保护功能仅用于验证操作权限，不提供数据加密
4. 网站图标获取可能会受到 CORS 限制

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，欢迎通过 GitHub Issues 反馈。

---

**Enjoy using Cloudflare Workers + KV 导航页！** 🎉