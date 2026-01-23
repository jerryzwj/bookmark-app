# Cloudflare Workers 全流程部署教程（基于最终版代码）

我将以你提供的最终版代码为核心，从准备工作到具体部署步骤，再到后期验证和问题排查，撰写一份详细且易懂的部署教程，覆盖Cloudflare相关配置的全流程。

<canvas_command>

<action>create</action>

<identifier>cloudflare-workers-bookmark-deployment</identifier>

<title>Cloudflare Workers 网址导航页部署教程（基于最终修复版代码）</title>

<genre>部署教程</genre>

<type>type/ddxml</type>

<content>

<title id="0">Cloudflare Workers 网址导航页部署教程（基于最终修复版代码）</title>

<h1 id="1">一、部署前准备</h1>

<h2 id="2">1.1 必备账号与工具</h2>

<ul id="3">

<li id="4">Cloudflare 账号：前往 <a href="[https://dash.cloudflare.com/](https://dash.cloudflare.com/)" target="_blank">Cloudflare 官网</a> 注册/登录（免费账号即可满足需求）；</li>

<li id="5">浏览器：推荐 Chrome、Edge 等现代浏览器（用于操作 Cloudflare 控制台）；</li>

<li id="6">最终版代码：提前复制好你提供的「Cloudflare Workers + KV 导航页【最终修复版】」完整代码。</li>

</ul>

<h2 id="7">1.2 核心概念说明</h2>

<ul id="8">

<li id="9">Cloudflare Workers：Serverless 运行环境，用于部署导航页的后端逻辑和前端页面；</li>

<li id="10">KV 命名空间：Cloudflare 提供的键值存储服务，用于保存书签数据、分类信息和密码锁定状态；</li>

<li id="11">环境变量：用于配置操作密码（避免硬编码在代码中，更安全）。</li>

</ul>

<h1 id="12">二、具体部署步骤</h1>

<h2 id="13">步骤 1：创建 KV 命名空间（关键！用于存储数据）</h2>

<ol id="14">

<li id="15">登录 Cloudflare 控制台后，在左侧导航栏找到「Workers 和 Pages」→ 点击进入「KV」标签页；</li>

<li id="16">点击右上角「创建命名空间」按钮，填写以下信息：

<ul id="17">

<li id="18">命名空间名称：自定义（如 <code id="19">bookmark-nav-kv</code>，仅用于识别，无强制要求）；</li>

<li id="20">位置：默认选择「自动」即可；</li>

</ul>

</li>

<li id="21">点击「创建」，记住该命名空间的名称（后续绑定 Workers 时需要用到）。</li>

</ol>

<h2 id="22">步骤 2：创建 Workers 服务</h2>

<ol id="23">

<li id="24">在「Workers 和 Pages」页面，点击「创建应用程序」→ 选择「创建 Workers 服务」；</li>

<li id="25">填写服务信息：

<ul id="26">

<li id="27">服务名称：自定义（如 <code id="28">my-bookmark-nav</code>，将作为默认访问域名的一部分，例如 <code id="29">my-bookmark-nav.your-account.workers.dev</code>）；</li>

<li id="30">选择「使用模板从头开始」→ 模板默认选「Hello World」即可；</li>

<li id="31">点击「创建服务」。</li>

</ul>

</li>

</ol>

<h2 id="32">步骤 3：绑定 KV 命名空间到 Workers</h2>

<ol id="33">

<li id="34">进入刚创建的 Workers 服务详情页（如 <code id="35">my-bookmark-nav</code>）；</li>

<li id="36">点击「设置」标签页 → 选择左侧「变量」→ 找到「KV 命名空间绑定」区域，点击「添加绑定」；</li>

<li id="37">填写绑定信息（<strong>关键！变量名必须与代码一致</strong>）：

<ul id="38">

<li id="39">变量名：固定填写 <code id="40">BOOKMARKS_KV</code>（代码中通过 <code id="41">env.BOOKMARKS_KV</code> 访问 KV 服务，不可修改）；</li>

<li id="42">KV 命名空间：从下拉框中选择步骤 1 创建的 KV 命名空间（如 <code id="43">bookmark-nav-kv</code>）；</li>

</ul>

</li>

<li id="44">点击「保存」完成绑定。</li>

</ol>

<h2 id="45">步骤 4：配置环境变量（设置操作密码）</h2>

<ol id="46">

<li id="47">在 Workers 服务的「变量」设置页，找到「环境变量」区域，点击「添加变量」；</li>

<li id="48">填写环境变量信息（用于设置书签编辑/删除的操作密码）：

<ul id="49">

<li id="50">变量名：固定填写 <code id="51">BOOKMARK_PASSWORD</code>（代码中通过 <code id="52">env.BOOKMARK_PASSWORD</code> 读取，不可修改）；</li>

<li id="53">值：填写你的自定义密码（如 <code id="54">MyBookmark123!</code>，建议复杂且易记）；</li>

<li id="55">（可选）勾选「加密」：加密存储密码，更安全（推荐勾选）；</li>

</ul>

</li>

<li id="56">点击「保存」完成环境变量配置。</li>

</ol>

<h2 id="57">步骤 5：上传最终版代码并部署</h2>
### ✅ Workers完整代码（直接复制，无需修改）

```JavaScript
// Cloudflare Workers + KV 导航页【最终修复版】- 解决模板字符串语法错误
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ===================== 全局配置 =====================
    const BOOKMARK_PASSWORD = env.BOOKMARK_PASSWORD || 'default123';
    const MAX_ERROR_COUNT = 3;
    const LOCK_DURATION = 60;

    // ===================== 工具函数：迁移旧数据 =====================
    async function migrateOldDataToCategories(env, oldBookmarks) {
      try {
        const categoryMap = {};
        oldBookmarks.forEach(item => {
          const cat = item.category || item.desc || '未分类';
          if (!categoryMap[cat]) categoryMap[cat] = [];
          categoryMap[cat].push({ name: item.name, url: item.url });
        });

        const categories = Object.keys(categoryMap);
        for (const cat of categories) {
          await env.BOOKMARKS_KV.put(`bookmarks:${cat}`, JSON.stringify(categoryMap[cat]));
        }
        await env.BOOKMARKS_KV.put('bookmarks:categories', JSON.stringify(categories.sort()));
        return true;
      } catch (err) {
        console.error('迁移旧数据失败：', err);
        return false;
      }
    }

    // ===================== 工具函数：密码验证 =====================
    async function verifyPassword(env, inputPwd, clientIP) {
      const lockKey = `password_lock:${clientIP}`;
      const lockDataStr = await env.BOOKMARKS_KV.get(lockKey);
      const lockData = lockDataStr ? JSON.parse(lockDataStr) : { count: 0, expire: 0 };
      
      if (Date.now() < lockData.expire) {
        return { success: false, msg: `密码输错次数过多，已锁定 ${LOCK_DURATION} 秒` };
      }

      if (inputPwd === BOOKMARK_PASSWORD) {
        await env.BOOKMARKS_KV.put(lockKey, JSON.stringify({ count: 0, expire: 0 }));
        return { success: true };
      } else {
        const newCount = lockData.count + 1;
        const expire = newCount >= MAX_ERROR_COUNT ? Date.now() + LOCK_DURATION * 1000 : 0;
        await env.BOOKMARKS_KV.put(lockKey, JSON.stringify({ count: newCount, expire }));
        
        const remain = MAX_ERROR_COUNT - newCount;
        const msg = remain > 0 ? `密码错误，还剩 ${remain} 次机会` : `已锁定 ${LOCK_DURATION} 秒`;
        return { success: false, msg };
      }
    }

    // ===================== API 接口 =====================
    // 1. 获取分类列表
    if (path === '/api/get-categories' && request.method === 'GET') {
      try {
        const categoriesStr = await env.BOOKMARKS_KV.get('bookmarks:categories');
        const categories = categoriesStr ? JSON.parse(categoriesStr) : [];
        return new Response(JSON.stringify(categories), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // 2. 获取书签
    if (path === '/api/get-bookmarks' && request.method === 'GET') {
      const category = url.searchParams.get('category') || '';
      try {
        if (category && category !== 'all') {
          const bookmarksStr = await env.BOOKMARKS_KV.get(`bookmarks:${category}`);
          const bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : [];
          return new Response(JSON.stringify(bookmarks), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const categoriesStr = await env.BOOKMARKS_KV.get('bookmarks:categories');
        let categories = categoriesStr ? JSON.parse(categoriesStr) : [];
        
        if (categories.length === 0) {
          const oldBookmarksStr = await env.BOOKMARKS_KV.get('bookmarks');
          if (oldBookmarksStr) {
            await migrateOldDataToCategories(env, JSON.parse(oldBookmarksStr));
            const newCategoriesStr = await env.BOOKMARKS_KV.get('bookmarks:categories');
            categories = newCategoriesStr ? JSON.parse(newCategoriesStr) : [];
          }
        }

        const bookmarkPromises = categories.map(cat => 
          env.BOOKMARKS_KV.get(`bookmarks:${cat}`).then(str => str ? JSON.parse(str) : [])
        );
        const categoryBookmarks = await Promise.all(bookmarkPromises);
        
        const allBookmarks = [];
        categories.forEach((cat, index) => {
          allBookmarks.push(...categoryBookmarks[index].map(item => ({ ...item, category: cat })));
        });

        return new Response(JSON.stringify(allBookmarks), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // 3. 保存书签
    if (path === '/api/save-bookmark' && request.method === 'POST') {
      try {
        const data = await request.json();
        const { name, url, category, password, isEditing } = data;
        const cat = category || '未分类';

        if (isEditing) {
          const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
          const verifyResult = await verifyPassword(env, password, clientIP);
          if (!verifyResult.success) {
            return new Response(JSON.stringify({ success: false, msg: verifyResult.msg }), {
              status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
        }

        const bookmarksStr = await env.BOOKMARKS_KV.get(`bookmarks:${cat}`);
        const bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : [];

        const existIndex = bookmarks.findIndex(item => item.name === name && item.url === url);
        if (existIndex > -1) {
          bookmarks[existIndex] = { name, url };
        } else {
          bookmarks.unshift({ name, url });
        }

        await env.BOOKMARKS_KV.put(`bookmarks:${cat}`, JSON.stringify(bookmarks));

        const categoriesStr = await env.BOOKMARKS_KV.get('bookmarks:categories');
        let categories = categoriesStr ? JSON.parse(categoriesStr) : [];
        if (!categories.includes(cat)) {
          categories.push(cat);
          categories = [...new Set(categories)].sort();
          await env.BOOKMARKS_KV.put('bookmarks:categories', JSON.stringify(categories));
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, msg: err.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // 4. 删除书签
    if (path === '/api/delete-bookmark' && request.method === 'POST') {
      try {
        const data = await request.json();
        const { name, url, category, password } = data;
        const cat = category || '未分类';

        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const verifyResult = await verifyPassword(env, password, clientIP);
        if (!verifyResult.success) {
          return new Response(JSON.stringify({ success: false, msg: verifyResult.msg }), {
            status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const bookmarksStr = await env.BOOKMARKS_KV.get(`bookmarks:${cat}`);
        const bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : [];

        const newBookmarks = bookmarks.filter(item => !(item.name === name && item.url === url));
        await env.BOOKMARKS_KV.put(`bookmarks:${cat}`, JSON.stringify(newBookmarks));

        if (newBookmarks.length === 0) {
          const categoriesStr = await env.BOOKMARKS_KV.get('bookmarks:categories');
          let categories = categoriesStr ? JSON.parse(categoriesStr) : [];
          categories = categories.filter(c => c !== cat);
          await env.BOOKMARKS_KV.put('bookmarks:categories', JSON.stringify(categories));
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, msg: err.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // ===================== 前端页面（封装为独立变量，避免模板字符串断裂）=====================
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="mobile-web-app-capable" content="yes">
  <title>我的专属网址导航</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#165DFF',
            secondary: '#36CFC9',
          },
          fontFamily: {
            sans: ['PingFang SC', 'Microsoft YaHei', 'sans-serif']
          },
          translate: {
            'custom-4px': '-4px',
          },
          boxShadow: {
            'custom-hover': '0 12px 20px -8px rgba(22,93,255,0.2)',
            'custom-sm': '0 6px 12px -4px rgba(22, 93, 255, 0.15)',
          }
        }
      }
    }
  </script>
  <style type="text/tailwindcss">
    @layer utilities {
      .glass { backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4); border-radius: 16px; }
      .glass-dark { backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; }
      .modal-glass { backdrop-filter: blur(20px); border: 1px solid rgba(22, 93, 255, 0.15); border-radius: 16px; background: rgba(255, 255, 255, 0.95); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); }
      .dark .modal-glass { background: rgba(17, 24, 39, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); }
      .category-dropdown { max-height: 180px; overflow-y: auto; z-index: 100; }
      .category-dropdown-item { transition: all 0.15s ease; }
      .category-dropdown-item:hover { background-color: rgba(22, 93, 255, 0.1); color: #165DFF; }
      .dark .category-dropdown-item:hover { background-color: rgba(22, 93, 255, 0.2); }
      .card-hover { transition: all 0.25s ease; }
      .card-hover:hover { @apply md:translate-y-custom-4px md:shadow-custom-hover; box-shadow: 0 6px 12px -4px rgba(22, 93, 255, 0.15); }
      .category-tag { transition: all 0.2s ease; }
      .category-tag.active { background: #165DFF; color: white; }
      .no-tap { -webkit-tap-highlight-color: transparent; }
    }
  </style>
  <style>
    * { box-sizing: border-box; }
    body { touch-action: manipulation; }
    ::-webkit-scrollbar { height: 4px; width: 4px; }
    ::-webkit-scrollbar-thumb { background: #165DFF33; border-radius: 2px; }
    .overflow-x-auto { scrollbar-width: thin; -ms-overflow-style: none; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-white bg-fixed">
  <header class="glass dark:glass-dark sticky top-0 z-50 px-3 py-2.5 mb-4 shadow-sm no-tap">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <h1 class="text-[clamp(1.1rem,3vw,1.6rem)] font-bold text-primary flex items-center gap-2">
        <i class="fa fa-link text-lg"></i> 我的专属网址导航
      </h1>
      <button id="addBtn" class="bg-primary text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg hover:opacity-90 transition-all text-sm">
        <i class="fa fa-plus text-sm"></i> 添加
      </button>
    </div>
  </header>

  <div class="max-w-7xl mx-auto px-3 mb-5 overflow-x-auto pb-2">
    <div id="categoryFilter" class="flex gap-2 whitespace-nowrap w-max">
      <button class="category-tag active px-3 py-2 rounded-full glass dark:glass-dark hover:bg-primary/10 no-tap text-sm min-w-[70px] text-center" data-category="all">
        全部
      </button>
    </div>
  </div>

  <main class="max-w-7xl mx-auto px-3 mb-10">
    <div id="bookmarkList" class="space-y-5">
      <div class="flex items-center justify-center h-36 text-gray-500 dark:text-gray-400">
        <i class="fa fa-spinner fa-spin mr-3 text-xl"></i> 加载常用网址中...
      </div>
    </div>
  </main>

  <div id="modal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-99 hidden backdrop-blur-sm no-tap">
    <div class="modal-glass w-[94%] max-w-md p-5 shadow-2xl">
      <div class="flex justify-between items-center mb-4">
        <h2 id="modalTitle" class="text-lg font-bold text-primary">添加新网址</h2>
        <button id="closeBtn" class="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-lg transition-colors no-tap">
          <i class="fa fa-times"></i>
        </button>
      </div>
      <form id="bookmarkForm" class="space-y-4">
        <input type="hidden" id="editCategory">
        <input type="hidden" id="isEditing" value="false">
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">网站名称</label>
          <input type="text" id="name" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base" placeholder="例如：百度、GitHub">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">网站地址</label>
          <input type="url" id="url" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base" placeholder="https://www.baidu.com">
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">✅ 无需加载图标，页面更流畅</p>
        </div>
        <div class="relative">
          <label class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">分类（必填）</label>
          <input type="text" id="category" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base" placeholder="例如：工具类、影音类、编程类">
          <div id="categoryDropdown" class="category-dropdown absolute left-0 right-0 mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800 hidden">
            <div id="categoryDropdownItems" class="p-2 space-y-1"></div>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">💡 可直接选择已有分类，或输入新分类</p>
        </div>
        <div id="passwordContainer" class="hidden">
          <label class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">操作密码</label>
          <input type="password" id="password" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base" placeholder="请输入操作密码">
        </div>
        <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg shadow-md hover:opacity-90 transition-all mt-2 text-base no-tap">保存网址</button>
      </form>
    </div>
  </div>

  <div id="deleteModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-100 hidden backdrop-blur-sm no-tap">
    <div class="modal-glass w-[94%] max-w-md p-5 shadow-2xl">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-primary">删除确认</h2>
        <button id="closeDeleteBtn" class="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-lg transition-colors no-tap">
          <i class="fa fa-times"></i>
        </button>
      </div>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-300">删除操作需要验证密码，删除后无法恢复！</p>
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">操作密码</label>
          <input type="password" id="deletePassword" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base" placeholder="请输入操作密码">
        </div>
        <input type="hidden" id="deleteName">
        <input type="hidden" id="deleteUrl">
        <input type="hidden" id="deleteCategory">
        <button id="confirmDeleteBtn" class="w-full bg-red-500 text-white py-3 rounded-lg shadow-md hover:opacity-90 transition-all mt-2 text-base no-tap">确认删除</button>
      </div>
    </div>
  </div>

  <script>
    let bookmarks = [];
    let allCategories = [];
    let filteredCategory = 'all';

    const cardColorPool = [
      'rgba(255,107,104,0.3)',
      'rgba(34,107,104,0.3)',
      'rgba(69,67,129,0.3)',
      'rgba(69,187,129,0.3)',
      'rgba(250,220,129,0.3)',
      'rgba(243,220,229,0.3)',
    ];
    const darkCardColorPool = [
      'rgba(45,35,35,0.3)',
      'rgba(35,45,35,0.3)',
      'rgba(35,35,45,0.3)',
      'rgba(45,40,35,0.3)',
      'rgba(40,35,45,0.3)',
      'rgba(35,45,45,0.3)',
    ];

    const bookmarkList = document.getElementById('bookmarkList');
    const categoryFilter = document.getElementById('categoryFilter');
    const addBtn = document.getElementById('addBtn');
    const closeBtn = document.getElementById('closeBtn');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const bookmarkForm = document.getElementById('bookmarkForm');
    const nameInput = document.getElementById('name');
    const urlInput = document.getElementById('url');
    const categoryInput = document.getElementById('category');
    const editCategoryInput = document.getElementById('editCategory');
    const isEditingInput = document.getElementById('isEditing');
    const passwordContainer = document.getElementById('passwordContainer');
    const passwordInput = document.getElementById('password');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryDropdownItems = document.getElementById('categoryDropdownItems');
    
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteBtn = document.getElementById('closeDeleteBtn');
    const deletePasswordInput = document.getElementById('deletePassword');
    const deleteNameInput = document.getElementById('deleteName');
    const deleteUrlInput = document.getElementById('deleteUrl');
    const deleteCategoryInput = document.getElementById('deleteCategory');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    function getRandomCardBg() {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const pool = isDark ? darkCardColorPool : cardColorPool;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    async function getCategories() {
      try {
        const res = await fetch('/api/get-categories');
        allCategories = await res.json();
        return allCategories;
      } catch (err) {
        const backup = localStorage.getItem('bookmarks_categories');
        allCategories = backup ? JSON.parse(backup) : [];
        return allCategories;
      }
    }

    async function getBookmarks(category = 'all') {
      try {
        const url = category === 'all' 
          ? '/api/get-bookmarks' 
          : \`/api/get-bookmarks?category=\${encodeURIComponent(category)}\`;
        const res = await fetch(url);
        const data = await res.json();
        if (category === 'all') {
          bookmarks = data;
          localStorage.setItem('bookmarks_all', JSON.stringify(data));
        }
        return data;
      } catch (err) {
        const backup = localStorage.getItem('bookmarks_all');
        bookmarks = backup ? JSON.parse(backup) : [];
        return category === 'all' ? bookmarks : bookmarks.filter(item => item.category === category);
      }
    }

    async function saveBookmark(data) {
      try {
        const res = await fetch('/api/save-bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!result.success) {
          alert(result.msg);
          return false;
        }
        await refreshBookmarks();
        return true;
      } catch (err) {
        alert('操作失败：' + err.message);
        return false;
      }
    }

    async function deleteBookmark(name, url, category, password) {
      try {
        const res = await fetch('/api/delete-bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, url, category, password })
        });
        const result = await res.json();
        if (!result.success) {
          alert(result.msg);
          return false;
        }
        await refreshBookmarks();
        return true;
      } catch (err) {
        alert('操作失败：' + err.message);
        return false;
      }
    }

    async function refreshBookmarks() {
      await getCategories();
      await getBookmarks('all');
      renderCategoryFilter();
      renderBookmarks();
    }

    function renderCategoryDropdown() {
      const inputVal = categoryInput.value.trim().toLowerCase();
      const matchedCategories = allCategories.filter(cat => 
        cat.toLowerCase().includes(inputVal)
      );

      if (matchedCategories.length === 0) {
        categoryDropdown.classList.add('hidden');
        return;
      }

      categoryDropdownItems.innerHTML = '';
      matchedCategories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-dropdown-item px-3 py-2 rounded-md cursor-pointer text-gray-800 dark:text-gray-200 no-tap';
        item.textContent = cat;
        item.addEventListener('click', () => {
          categoryInput.value = cat;
          categoryDropdown.classList.add('hidden');
        });
        categoryDropdownItems.appendChild(item);
      });

      categoryDropdown.classList.remove('hidden');
    }

    function renderCategoryFilter() {
      const allBtn = categoryFilter.querySelector('[data-category="all"]');
      categoryFilter.innerHTML = '';
      categoryFilter.appendChild(allBtn);

      allCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-tag px-3 py-2 rounded-full glass dark:glass-dark hover:bg-primary/10 no-tap text-sm min-w-[70px] text-center';
        btn.dataset.category = cat;
        btn.textContent = cat;
        btn.addEventListener('click', async () => {
          document.querySelectorAll('.category-tag').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filteredCategory = cat;
          const catBookmarks = await getBookmarks(cat);
          renderBookmarks(catBookmarks);
        });
        categoryFilter.appendChild(btn);
      });

      allBtn.addEventListener('click', async () => {
        document.querySelectorAll('.category-tag').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        filteredCategory = 'all';
        await getBookmarks('all');
        renderBookmarks();
      });
    }

    function renderBookmarks(customBookmarks = null) {
      const renderData = customBookmarks || bookmarks;

      if (renderData.length === 0) {
        bookmarkList.innerHTML = \`
          <div class="glass dark:glass-dark p-6 text-center">
            <i class="fa fa-star-o text-4xl text-primary mb-3 opacity-80"></i>
            <p class="text-base text-gray-600 dark:text-gray-300">\${filteredCategory === 'all' ? '暂无收藏的网址' : \`「\${filteredCategory}」分类下暂无网址\`}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">点击右上角「添加」，开始收藏你的常用网站吧 ✨</p>
          </div>
        \`;
        return;
      }

      const groupedBookmarks = {};
      if (filteredCategory === 'all') {
        renderData.forEach(item => {
          const cat = item.category || '未分类';
          if (!groupedBookmarks[cat]) groupedBookmarks[cat] = [];
          groupedBookmarks[cat].push(item);
        });
      } else {
        groupedBookmarks[filteredCategory] = renderData;
      }

      let html = '';
      Object.keys(groupedBookmarks).forEach(cat => {
        const items = groupedBookmarks[cat];
        html += \`
          <div class="category-group">
            <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
              <i class="fa fa-folder text-primary"></i> \${cat}（\${items.length}个）
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        \`;

        items.forEach(item => {
          const cardBg = getRandomCardBg();
          const itemId = \`bookmark-\${item.name.replace(/\\W/g, '')}-\${item.url.replace(/\\W/g, '')}\`;
          html += \`
            <div class="glass dark:glass-dark p-3 card-hover flex flex-col h-full" style="background: \${cardBg}" data-id="\${itemId}">
              <div class="flex items-center justify-between mb-2">
                <div class="flex-1">
                  <h3 class="font-bold text-xs sm:text-sm truncate" title="\${item.name}">\${item.name}</h3>
                </div>
                <div class="flex gap-1.5">
                  <button class="edit-btn text-secondary hover:text-primary p-1 rounded no-tap" title="编辑" data-name="\${item.name}" data-url="\${item.url}" data-category="\${item.category}">
                    <i class="fa fa-pencil text-xs"></i>
                  </button>
                  <button class="delete-btn text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 p-1 rounded no-tap" title="删除" data-name="\${item.name}" data-url="\${item.url}" data-category="\${item.category}">
                    <i class="fa fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
              <a href="\${item.url}" target="_blank" rel="noopener noreferrer" class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 break-all hover:text-primary transition-colors mb-2 flex-1">
                \${item.url}
              </a>
              <p class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 bg-gray-100/60 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-md">\${cat}</p>
            </div>
          \`;
        });

        html += '</div></div>';
      });

      bookmarkList.innerHTML = html;
      
      bookmarkList.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        
        if (editBtn) {
          const name = editBtn.dataset.name;
          const url = editBtn.dataset.url;
          const category = editBtn.dataset.category;
          editBookmark(name, url, category);
        }
        
        if (deleteBtn) {
          const name = deleteBtn.dataset.name;
          const url = deleteBtn.dataset.url;
          const category = deleteBtn.dataset.category;
          showDeleteModal(name, url, category);
        }
      });
    }

    function addBookmark() {
      modalTitle.textContent = '添加新网址';
      bookmarkForm.reset();
      editCategoryInput.value = '';
      isEditingInput.value = 'false';
      passwordContainer.classList.add('hidden');
      modal.classList.remove('hidden');
      nameInput.focus();
      renderCategoryDropdown();
    }

    function editBookmark(name, url, category) {
      modalTitle.textContent = '编辑网址';
      nameInput.value = name;
      urlInput.value = url;
      categoryInput.value = category;
      editCategoryInput.value = category;
      isEditingInput.value = 'true';
      passwordContainer.classList.remove('hidden');
      passwordInput.value = '';
      modal.classList.remove('hidden');
      nameInput.focus();
      renderCategoryDropdown();
    }

    function showDeleteModal(name, url, category) {
      deleteNameInput.value = name;
      deleteUrlInput.value = url;
      deleteCategoryInput.value = category;
      deletePasswordInput.value = '';
      deleteModal.classList.remove('hidden');
      deletePasswordInput.focus();
    }

    confirmDeleteBtn.addEventListener('click', async () => {
      const name = deleteNameInput.value;
      const url = deleteUrlInput.value;
      const category = deleteCategoryInput.value;
      const password = deletePasswordInput.value.trim();

      if (!password) {
        alert('请输入操作密码！');
        return;
      }

      const success = await deleteBookmark(name, url, category, password);
      if (success) {
        deleteModal.classList.add('hidden');
        renderCategoryFilter();
        renderBookmarks();
      }
    });

    bookmarkForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const url = urlInput.value.trim();
      const newCategory = categoryInput.value.trim() || '未分类';
      const oldCategory = editCategoryInput.value || newCategory;
      const isEditing = isEditingInput.value === 'true';
      const password = isEditing ? passwordInput.value.trim() : '';

      if (isEditing && !password) {
        alert('请输入操作密码！');
        return;
      }

      let success = true;
      if (isEditing && oldCategory !== newCategory) {
        success = await deleteBookmark(name, url, oldCategory, password);
        if (!success) return;
      }

      success = await saveBookmark({ 
        name, url, category: newCategory, 
        password: isEditing ? password : '', 
        isEditing 
      });
      if (success) {
        modal.classList.add('hidden');
        renderCategoryFilter();
        renderBookmarks();
      }
    });

    async function initPage() {
      await getCategories();
      await getBookmarks('all');
      renderCategoryFilter();
      renderBookmarks();
      localStorage.setItem('bookmarks_categories', JSON.stringify(allCategories));
    }

    categoryInput.addEventListener('input', renderCategoryDropdown);
    categoryInput.addEventListener('focus', renderCategoryDropdown);
    document.addEventListener('click', (e) => {
      if (!categoryInput.contains(e.target) && !categoryDropdown.contains(e.target)) {
        categoryDropdown.classList.add('hidden');
      }
    });
    addBtn.addEventListener('click', addBookmark);
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => e.target === modal && modal.classList.add('hidden'));
    closeDeleteBtn.addEventListener('click', () => deleteModal.classList.add('hidden'));
    deleteModal.addEventListener('click', (e) => e.target === deleteModal && deleteModal.classList.add('hidden'));

    window.addEventListener('DOMContentLoaded', initPage);
  </script>
</body>
</html>`;

    // 返回 HTML 响应（核心修复：使用独立变量，避免模板字符串断裂）
    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

```

---


<ol id="58">

<li id="59">回到 Workers 服务详情页，点击「编辑代码」进入代码编辑器；</li>

<li id="60">清空编辑器中默认的「Hello World」模板代码；</li>

<li id="61">将你提供的「最终修复版代码」完整复制粘贴到编辑器中（<strong>注意：全选复制，不要遗漏任何字符</strong>）；</li>

<li id="62">点击编辑器右上角「保存并部署」→ 在弹出的菜单中选择「部署」；</li>

<li id="63">等待部署完成（通常1-2秒），页面会提示「部署成功」。</li>

</ol>

<h2 id="64">步骤 6：获取访问链接</h2>

<ol id="65">

<li id="66">部署成功后，回到 Workers 服务详情页；</li>

<li id="67">在页面顶部找到「触发器」标签页，点击进入；</li>

<li id="68">在「默认路由」区域，可看到默认访问域名（如 <code id="69">my-bookmark-nav.your-account.workers.dev</code>）；</li>

<li id="70">点击该域名，即可访问你的专属网址导航页（也可复制该链接保存，方便后续访问）。</li>

</ol>

<h2 id="71">（可选）步骤 7：绑定自定义域名（优化访问体验）</h2>

若你有自己的域名（已托管在 Cloudflare），可绑定自定义域名（如 <code id="72">nav.yourdomain.com</code>）：

<ol id="73">

<li id="74">进入 Workers 服务的「触发器」标签页 → 点击「添加自定义域」；</li>

<li id="75">输入你的自定义域名（如 <code id="76">nav.yourdomain.com</code>）→ 点击「添加」；</li>

<li id="77">Cloudflare 会自动配置 DNS 记录，等待几分钟后，即可通过自定义域名访问导航页。</li>

</ol>

<h1 id="78">三、部署后验证</h1>

<h2 id="79">3.1 基础功能验证</h2>

<ol id="80">

<li id="81">访问导航页链接，确认页面正常加载（无空白、无控制台报错）；</li>

<li id="82">点击右上角「添加」按钮，填写网站名称（如「百度」）、地址（如「[https://www.baidu.com](https://www.baidu.com)」）、分类（如「搜索引擎」），点击「保存网址」→ 确认书签添加成功，页面显示新增书签；</li>

<li id="83">点击书签卡片上的「编辑」按钮，修改信息并输入部署时设置的 <code id="84">BOOKMARK_PASSWORD</code> → 确认编辑成功；</li>

<li id="85">点击书签卡片上的「删除」按钮，输入密码 → 确认书签删除成功；</li>

<li id="86">验证分类筛选：点击顶部分类标签（如「搜索引擎」），确认仅显示该分类下的书签。</li>

</ol>

<h2 id="87">3.2 密码锁定功能验证</h2>

<ol id="88">

<li id="89">编辑/删除书签时，故意输入错误密码 3 次；</li>

<li id="90">第 3 次错误后，页面会提示「密码输错次数过多，已锁定 60 秒」；</li>

<li id="91">等待 60 秒后，再次输入正确密码 → 确认操作正常生效。</li>

</ol>

<h1 id="92">四、常见问题排查</h1>

<h2 id="93">4.1 页面空白/控制台报 SyntaxError</h2>

<ul id="94">

<li id="95">原因：代码复制不完整（尤其是 <code id="96">htmlContent</code> 变量的反引号未完整包裹 HTML 内容）；</li>

<li id="97">解决：重新全选最终版代码，确保从 <code id="98">export default {</code> 到最后的 <code id="99">};</code> 完整复制，覆盖编辑器中的代码后重新部署。</li>

</ul>

<h2 id="100">4.2 无法添加/保存书签（提示操作失败）</h2>

<ul id="101">

<li id="102">原因 1：KV 命名空间绑定错误（变量名不是 <code id="103">BOOKMARKS_KV</code> 或未选择正确的 KV 命名空间）；</li>

<li id="104">解决 1：回到步骤 3，确认 KV 绑定的变量名是 <code id="105">BOOKMARKS_KV</code>，且命名空间选择正确；</li>

<li id="106">原因 2：KV 命名空间无读写权限；</li>

<li id="107">解决 2：进入 KV 命名空间详情页，确认「权限」设置为「编辑者」（默认是编辑者，无需修改）。</li>

</ul>

<h2 id="108">4.3 编辑/删除时提示密码错误（但密码正确）</h2>

<ul id="109">

<li id="110">原因：环境变量 <code id="111">BOOKMARK_PASSWORD</code> 未配置或配置错误；</li>

<li id="112">解决：回到步骤 4，确认环境变量名是 <code id="113">BOOKMARK_PASSWORD</code>，值与输入的密码一致（注意大小写、特殊字符）。</li>

</ul>

<h2 id="114">4.4 自定义域名无法访问</h2>

<ul id="115">

<li id="116">原因 1：域名未托管在 Cloudflare；</li>

<li id="117">解决 1：将域名的 DNS 服务器修改为 Cloudflare 提供的服务器（在 Cloudflare 控制台「域名」→「DNS」中查看）；</li>

<li id="118">原因 2：DNS 记录未生效；</li>

<li id="119">解决 2：等待 5-10 分钟，或在命令行执行 <code id="120">ping 你的自定义域名</code>，确认解析到 Cloudflare 的 IP。</li>

</ul>

<h1 id="121">五、后期维护说明</h1>

<h2 id="122">5.1 数据备份</h2>

<ul id="123">

<li id="124">进入 KV 命名空间详情页，可手动导出所有键值对（点击「导出」按钮）；</li>

<li id="125">建议定期备份（如每月 1 次），避免数据丢失。</li>

</ul>

<h2 id="126">5.2 密码修改</h2>

<ul id="127">

<li id="128">无需修改代码，直接进入 Workers 服务的「变量」设置页，找到 <code id="129">BOOKMARK_PASSWORD</code> 变量，修改其值后保存即可。</li>

</ul>

<h2 id="130">5.3 代码更新</h2>

<ul id="131">

<li id="132">若后续需要修改代码（如优化样式、新增功能），直接在 Workers 代码编辑器中修改，点击「保存并部署」即可覆盖旧版本；</li>

<li id="133">更新前建议备份当前代码（复制到本地文档），避免更新失败。</li>

</ul>

<callout id="134" emoji="💡">

温馨提示：本部署教程基于免费版 Cloudflare 服务，足够个人日常使用（免费版 Workers 有每日请求限额，但个人导航页完全够用）。若需要更高性能或更多请求额度，可升级 Cloudflare 付费套餐。

</callout>

</content>

</canvas_command>

这份教程涵盖了从准备到维护的全流程，适合新手跟随操作。你可以根据实际需求，对教程中的自定义名称（如KV命名空间、Workers服务名）进行调整，若有特定的补充需求（如多环境部署、高级域名配置），可告诉我进一步优化。
> （注：文档部分内容可能由 AI 生成）
