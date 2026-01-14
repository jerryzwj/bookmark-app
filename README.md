分类式网址导航 - Cloudflare Worker 版
一款基于 Cloudflare Worker + KV 构建的轻量级、高性能分类式网址导航工具，支持分类分组、随机配色、数据持久化，无冗余资源加载，流畅度拉满。


✨ 核心特性
📁 分类管理：支持自定义分类、分类筛选、按分类分组显示，网址再多也不杂乱
⚡ 极致流畅：移除 ICO 图标加载逻辑，减少网络请求，页面加载 / 渲染无卡顿
🎨 随机配色：卡片随机柔和配色，与背景区分明显，视觉体验佳
💾 数据持久化：基于 Cloudflare KV 存储，本地备份兜底，数据不丢失
📱 响应式设计：适配 PC / 移动端，分类栏支持横向滚动，移动端体验友好
✏️ 便捷操作：支持网址的添加、编辑、删除，操作简单直观
🌙 深色模式：自动适配系统深色 / 浅色模式，配色同步调整
🚀 部署教程
前置条件
拥有 Cloudflare 账号
已创建 Cloudflare Worker 服务
已创建 KV 命名空间
部署步骤
创建 KV 命名空间
进入 Cloudflare 控制台 → Workers & Pages → KV → 创建命名空间（例如：bookmarks-kv）
绑定 KV 命名空间到 Worker：进入 Worker 服务 → 设置 → 变量 → KV 命名空间绑定 → 添加绑定（变量名：BOOKMARKS_KV，选择创建的命名空间）
部署代码
进入 Worker 服务 → Quick Edit
清空编辑器内默认代码，粘贴本项目完整代码
点击「Save and deploy」完成部署
访问使用
访问 Worker 分配的域名（例如：xxx.xxx.workers.dev）即可使用
📖 使用指南
基础操作
添加网址
点击右上角「添加网址」按钮
填写网站名称、网址、分类（分类为必填项，例如：工具类、影音类、编程类）
点击「保存网址」，自动按分类分组显示
筛选分类
顶部分类筛选栏点击对应分类标签（如：工具类），仅显示该分类下的网址
点击「全部」可查看所有分类的网址
编辑 / 删除网址
每个网址卡片右上角提供「编辑」「删除」按钮
编辑：修改名称、网址、分类，保存后自动更新
删除：确认后删除该网址，数据即时同步
数据管理
数据自动存储到 Cloudflare KV，同时本地 localStorage 备份
即使 KV 同步失败，本地数据也不会丢失，重新联网后自动同步
🎨 自定义配置
调整卡片配色
修改代码中 cardColorPool（浅色模式）和 darkCardColorPool（深色模式）数组，自定义卡片随机配色：
javascript
运行
// 浅色模式配色池（rgba格式，最后一位为透明度）
const cardColorPool = [
  'rgba(255,243,243,0.4)',  // 浅红
  'rgba(243,255,243,0.4)',  // 浅绿
  'rgba(243,243,255,0.4)',  // 浅蓝
  'rgba(255,251,243,0.4)',  // 浅橙
  'rgba(250,243,255,0.4)',  // 浅紫
  'rgba(243,255,251,0.4)',  // 浅青
];
// 深色模式配色池
const darkCardColorPool = [
  'rgba(45,35,35,0.4)',
  'rgba(35,45,35,0.4)',
  'rgba(35,35,45,0.4)',
  'rgba(45,40,35,0.4)',
  'rgba(40,35,45,0.4)',
  'rgba(35,45,45,0.4)',
];
调整卡片列数
修改代码中卡片网格的 grid-cols-* 配置，自定义不同屏幕尺寸下的列数：
html
预览
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
grid-cols-1：移动端默认 1 列
sm:grid-cols-2：小屏设备（≥640px）2 列
md:grid-cols-3：中屏设备（≥768px）3 列
lg:grid-cols-4：大屏设备（≥1024px）4 列
xl:grid-cols-5：超大屏设备（≥1280px）5 列
修改主题色
修改代码中 primary 变量，自定义主色调：
javascript
运行
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#165DFF', // 替换为自定义主色（如：#0088ff、#2563eb等）
        secondary: '#36CFC9',
      },
    }
  }
}
🛠 技术栈
前端：HTML + TailwindCSS + JavaScript（原生，无框架）
后端：Cloudflare Worker（JavaScript）
存储：Cloudflare KV + localStorage（本地备份）
📄 许可证
本项目基于 MIT 许可证开源，你可以自由使用、修改、分发本项目代码。
💡 常见问题
Q1：部署后页面乱码？
A1：检查代码是否完整粘贴，确保没有多余 / 缺失的符号（如：< >），部署后强制刷新页面（Ctrl+F5）。
Q2：数据无法保存？
A2：确认 KV 命名空间已正确绑定到 Worker，变量名需为 BOOKMARKS_KV，检查 Worker 权限是否足够。
Q3：旧数据没有分类？
A3：代码已兼容旧数据，无分类的旧数据会自动归为「未分类」，可编辑网址补充分类信息。
Q4：移动端显示异常？
A4：确保代码中响应式配置完整，移动端分类栏支持横向滚动，可调整 grid-cols-* 适配不同设备。
