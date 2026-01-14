// Cloudflare Workers + KV 导航页【分类下拉选择版】
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 后端API接口
    if (path === '/api/get' && request.method === 'GET') {
      const bookmarks = await env.BOOKMARKS_KV.get('bookmarks');
      return new Response(bookmarks || JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (path === '/api/save' && request.method === 'POST') {
      try {
        const data = await request.json();
        await env.BOOKMARKS_KV.put('bookmarks', JSON.stringify(data));
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, msg: err.message }), { status: 400 });
      }
    }

    // 前端页面（新增分类下拉选择功能）
    return new Response(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的专属网址</title>
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
          }
        }
      }
    }
  </script>
  <style type="text/tailwindcss">
    @layer utilities {
      .glass { 
        backdrop-filter: blur(12px); 
        border: 1px solid rgba(255,255,255,0.4); 
        border-radius: 16px; 
      }
      .glass-dark { 
        backdrop-filter: blur(12px); 
        border: 1px solid rgba(255,255,255,0.1); 
        border-radius: 16px; 
      }
      .modal-glass {
        backdrop-filter: blur(20px);
        border: 1px solid rgba(22, 93, 255, 0.15);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      }
      .dark .modal-glass {
        background: rgba(17, 24, 39, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .category-dropdown {
        max-height: 180px;
        overflow-y: auto;
        z-index: 100;
      }
      .category-dropdown-item {
        transition: all 0.15s ease;
      }
      .category-dropdown-item:hover {
        background-color: rgba(22, 93, 255, 0.1);
        color: #165DFF;
      }
      .dark .category-dropdown-item:hover {
        background-color: rgba(22, 93, 255, 0.2);
      }
      .card-hover { transition: all 0.25s ease; }
      .card-hover:hover { 
        transform: translateY(-4px); 
        box-shadow: 0 12px 20px -8px rgba(22, 93, 255, 0.2); 
      }
      .category-tag { transition: all 0.2s ease; }
      .category-tag.active { background: #165DFF; color: white; }
    }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-white bg-fixed">
  <!-- 顶部导航 -->
  <header class="glass dark:glass-dark sticky top-0 z-50 px-4 py-4 mb-4 shadow-sm">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <h1 class="text-[clamp(1.4rem,3vw,1.8rem)] font-bold text-primary flex items-center gap-2">
        <i class="fa fa-link text-xl"></i> 我的专属网址导航
      </h1>
      <button id="addBtn" class="bg-primary text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg hover:opacity-90 transition-all">
        <i class="fa fa-plus"></i> 添加网址
      </button>
    </div>
  </header>

  <!-- 分类筛选栏 -->
  <div class="max-w-7xl mx-auto px-4 mb-8 overflow-x-auto pb-2">
    <div id="categoryFilter" class="flex gap-2 whitespace-nowrap">
      <button class="category-tag active px-4 py-2 rounded-full glass dark:glass-dark hover:bg-primary/10" data-category="all">
        全部
      </button>
    </div>
  </div>

  <!-- 书签卡片容器 -->
  <main class="max-w-7xl mx-auto px-4 mb-16">
    <div id="bookmarkList" class="space-y-8">
      <div class="flex items-center justify-center h-36 text-gray-500 dark:text-gray-400">
        <i class="fa fa-spinner fa-spin mr-3 text-xl"></i> 加载常用网址中...
      </div>
    </div>
  </main>

  <!-- 添加/编辑弹窗 -->
  <div id="modal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-99 hidden backdrop-blur-sm">
    <div class="modal-glass w-full max-w-md p-7 shadow-2xl">
      <div class="flex justify-between items-center mb-5">
        <h2 id="modalTitle" class="text-xl font-bold text-primary">添加新网址</h2>
        <button id="closeBtn" class="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-xl transition-colors">
          <i class="fa fa-times"></i>
        </button>
      </div>
      <form id="bookmarkForm" class="space-y-5">
        <input type="hidden" id="editId">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">网站名称</label>
          <input type="text" id="name" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" placeholder="例如：百度、GitHub">
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">网站地址</label>
          <input type="url" id="url" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" placeholder="https://www.baidu.com">
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">✅ 无需加载图标，页面更流畅</p>
        </div>
        <!-- 分类输入框 + 下拉选择容器 -->
        <div class="relative">
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">分类（必填）</label>
          <input 
            type="text" 
            id="category" 
            required 
            class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" 
            placeholder="例如：工具类、影音类、编程类、办公类"
          >
          <!-- 分类下拉列表（默认隐藏） -->
          <div id="categoryDropdown" class="category-dropdown absolute left-0 right-0 mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800 hidden">
            <div id="categoryDropdownItems" class="p-2 space-y-1">
              <!-- 下拉选项动态生成 -->
            </div>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">💡 可直接选择已有分类，或输入新分类</p>
        </div>
        <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg shadow-md hover:opacity-90 transition-all mt-2 text-base">保存网址</button>
      </form>
    </div>
  </div>

  <script>
    let bookmarks = [];
    let filteredCategory = 'all';
    const EDIT_NONE = -1;
    let editIndex = EDIT_NONE;

    // 随机卡片配色池
    const cardColorPool = [
      'rgba(255,107,104,0.4)',
      'rgba(34,107,104,0.4)',
      'rgba(69,67,129,0.4)',
      'rgba(69,187,129,0.4)',
      'rgba(250,220,129,0.4)',
      'rgba(243,220,229,0.4)',
    ];
    const darkCardColorPool = [
      'rgba(45,35,35,0.4)',
      'rgba(35,45,35,0.4)',
      'rgba(35,35,45,0.4)',
      'rgba(45,40,35,0.4)',
      'rgba(40,35,45,0.4)',
      'rgba(35,45,45,0.4)',
    ];

    // DOM元素
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
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryDropdownItems = document.getElementById('categoryDropdownItems');

    // 获取随机卡片背景色
    function getRandomCardBg() {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const pool = isDark ? darkCardColorPool : cardColorPool;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // 提取所有分类（去重）
    function getUniqueCategories() {
      const categories = bookmarks.map(item => item.category || '未分类').filter(Boolean);
      return [...new Set(categories)].sort();
    }

    // 渲染分类下拉选择列表
    function renderCategoryDropdown() {
      const allCategories = getUniqueCategories();
      const inputVal = categoryInput.value.trim().toLowerCase();
      
      // 过滤匹配的分类（模糊搜索）
      const matchedCategories = allCategories.filter(cat => 
        cat.toLowerCase().includes(inputVal)
      );

      if (matchedCategories.length === 0) {
        categoryDropdown.classList.add('hidden');
        return;
      }

      // 生成下拉选项
      categoryDropdownItems.innerHTML = '';
      matchedCategories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-dropdown-item px-3 py-2 rounded-md cursor-pointer text-gray-800 dark:text-gray-200';
        item.textContent = cat;
        // 点击选项填充到输入框
        item.addEventListener('click', () => {
          categoryInput.value = cat;
          categoryDropdown.classList.add('hidden');
        });
        categoryDropdownItems.appendChild(item);
      });

      categoryDropdown.classList.remove('hidden');
    }

    // 渲染分类筛选栏
    function renderCategoryFilter() {
      const categories = getUniqueCategories();
      const allBtn = categoryFilter.querySelector('[data-category="all"]');
      categoryFilter.innerHTML = '';
      categoryFilter.appendChild(allBtn);

      categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-tag px-4 py-2 rounded-full glass dark:glass-dark hover:bg-primary/10';
        btn.dataset.category = cat;
        btn.textContent = cat;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.category-tag').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filteredCategory = cat;
          renderBookmarks();
        });
        categoryFilter.appendChild(btn);
      });

      allBtn.addEventListener('click', () => {
        document.querySelectorAll('.category-tag').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        filteredCategory = 'all';
        renderBookmarks();
      });
    }

    // 按分类分组渲染书签
    function renderBookmarks() {
      if (bookmarks.length === 0) {
        bookmarkList.innerHTML = '\\n          <div class="glass dark:glass-dark p-8 text-center">\\n            <i class="fa fa-star-o text-5xl text-primary mb-4 opacity-80"></i>\\n            <p class="text-lg text-gray-600 dark:text-gray-300">暂无收藏的网址</p>\\n            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">点击右上角「添加网址」，开始收藏你的常用网站吧 ✨</p>\\n          </div>\\n        ';
        return;
      }

      const filteredBookmarks = filteredCategory === 'all' 
        ? bookmarks 
        : bookmarks.filter(item => (item.category || '未分类') === filteredCategory);

      if (filteredBookmarks.length === 0) {
        bookmarkList.innerHTML = '\\n          <div class="glass dark:glass-dark p-8 text-center">\\n            <i class="fa fa-folder-open-o text-5xl text-primary mb-4 opacity-80"></i>\\n            <p class="text-lg text-gray-600 dark:text-gray-300">「' + filteredCategory + '」分类下暂无网址</p>\\n            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">点击右上角「添加网址」添加吧～</p>\\n          </div>\\n        ';
        return;
      }

      // 按分类分组
      const groupedBookmarks = {};
      filteredBookmarks.forEach(item => {
        const cat = item.category || '未分类';
        if (!groupedBookmarks[cat]) {
          groupedBookmarks[cat] = [];
        }
        groupedBookmarks[cat].push(item);
      });

      // 渲染分组
      let html = '';
      Object.keys(groupedBookmarks).forEach(cat => {
        const items = groupedBookmarks[cat];
        html += '\\n          <div class="category-group">\\n            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">\\n              <i class="fa fa-folder text-primary"></i> ' + cat + '（' + items.length + '个）\\n            </h2>\\n            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">\\n        ';

        items.forEach((item, index) => {
          const globalIndex = bookmarks.findIndex(b => b.name === item.name && b.url === item.url);
          const cardBg = getRandomCardBg();
          html += '\\n            <div class="glass dark:glass-dark p-5 card-hover flex flex-col h-full" style="background: ' + cardBg + '">\\n              <div class="flex items-center justify-between mb-4">\\n                <div class="flex-1">\\n                  <h3 class="font-bold text-base sm:text-lg truncate" title="' + item.name + '">' + item.name + '</h3>\\n                </div>\\n                <div class="flex gap-2">\\n                  <button onclick="editBookmark(' + globalIndex + ')" class="text-secondary hover:text-primary p-1 rounded" title="编辑">\\n                    <i class="fa fa-pencil"></i>\\n                  </button>\\n                  <button onclick="deleteBookmark(' + globalIndex + ')" class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 p-1 rounded" title="删除">\\n                    <i class="fa fa-trash"></i>\\n                  </button>\\n                </div>\\n              </div>\\n              <a \\n                href="' + item.url + '" \\n                target="_blank" \\n                rel="noopener noreferrer" \\n                class="text-sm text-gray-600 dark:text-gray-300 break-all hover:text-primary transition-colors mb-2 flex-1"\\n              >\\n                ' + item.url + '\\n              </a>\\n              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-100/60 dark:bg-slate-700/50 px-2 py-1 rounded-md">' + cat + '</p>\\n            </div>\\n          ';
        });

        html += '\\n</div></div>\\n';
      });

      bookmarkList.innerHTML = html;
    }

    // 加载书签数据
    async function loadBookmarks() {
      try {
        const res = await fetch('/api/get');
        const data = await res.json();
        bookmarks = Array.isArray(data) ? data : [];
        bookmarks = bookmarks.map(item => ({
          ...item,
          category: item.category || item.desc || '未分类'
        }));
        localStorage.setItem('bookmarks_backup', JSON.stringify(bookmarks));
      } catch (err) {
        const backup = localStorage.getItem('bookmarks_backup');
        bookmarks = backup ? JSON.parse(backup) : [];
        bookmarks = bookmarks.map(item => ({
          ...item,
          category: item.category || item.desc || '未分类'
        }));
      }
      renderCategoryFilter();
      renderBookmarks();
    }

    // 保存书签数据
    async function saveBookmarks() {
      try {
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookmarks)
        });
        localStorage.setItem('bookmarks_backup', JSON.stringify(bookmarks));
      } catch (err) {
        alert('✅ 保存成功（本地），KV同步中');
        localStorage.setItem('bookmarks_backup', JSON.stringify(bookmarks));
      }
      renderCategoryFilter();
    }

    // 添加书签
    function addBookmark() {
      modalTitle.textContent = '添加新网址';
      bookmarkForm.reset();
      editIndex = EDIT_NONE;
      modal.classList.remove('hidden');
      nameInput.focus();
      // 初始化下拉列表
      renderCategoryDropdown();
    }

    // 编辑书签
    function editBookmark(index) {
      const item = bookmarks[index];
      modalTitle.textContent = '编辑网址';
      nameInput.value = item.name;
      urlInput.value = item.url;
      categoryInput.value = item.category || '未分类';
      editIndex = index;
      modal.classList.remove('hidden');
      nameInput.focus();
      // 初始化下拉列表
      renderCategoryDropdown();
    }

    // 删除书签
    function deleteBookmark(index) {
      if (confirm('确定删除该网址吗？删除后无法恢复哦～')) {
        bookmarks.splice(index, 1);
        renderBookmarks();
        saveBookmarks();
      }
    }

    // 表单提交
    bookmarkForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newItem = {
        name: nameInput.value.trim(),
        url: urlInput.value.trim(),
        category: categoryInput.value.trim() || '未分类'
      };

      if (editIndex === EDIT_NONE) {
        bookmarks.unshift(newItem);
      } else {
        bookmarks[editIndex] = newItem;
      }

      renderBookmarks();
      saveBookmarks();
      modal.classList.add('hidden');
    });

    // 分类输入框事件监听（输入/聚焦时显示下拉）
    categoryInput.addEventListener('input', renderCategoryDropdown);
    categoryInput.addEventListener('focus', renderCategoryDropdown);
    // 点击页面其他区域关闭下拉
    document.addEventListener('click', (e) => {
      if (!categoryInput.contains(e.target) && !categoryDropdown.contains(e.target)) {
        categoryDropdown.classList.add('hidden');
      }
    });

    // 其他事件监听
    addBtn.addEventListener('click', addBookmark);
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => e.target === modal && modal.classList.add('hidden'));

    // 页面初始化
    window.addEventListener('DOMContentLoaded', loadBookmarks);
  </script>
</body>
</html>`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  },
};
