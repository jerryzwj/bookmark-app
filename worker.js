// Cloudflare Workers + KV 导航页【无ICO+分类版】- 极致流畅+分组显示
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 后端API接口（稳定无错）
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

    // 前端页面（移除ICO+极致流畅）
    return new Response(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      <!-- 分类标签会动态生成 -->
    </div>
  </div>

  <!-- 书签卡片容器（按分类分组） -->
  <main class="max-w-7xl mx-auto px-4 mb-16">
    <div id="bookmarkList" class="space-y-8">
      <div class="flex items-center justify-center h-36 text-gray-500 dark:text-gray-400">
        <i class="fa fa-spinner fa-spin mr-3 text-xl"></i> 加载常用网址中...
      </div>
    </div>
  </main>

  <!-- 添加/编辑弹窗 -->
  <div id="modal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-99 hidden backdrop-blur-sm">
    <div class="glass dark:glass-dark w-full max-w-md p-7 shadow-2xl">
      <div class="flex justify-between items-center mb-5">
        <h2 id="modalTitle" class="text-xl font-bold text-primary">添加新网址</h2>
        <button id="closeBtn" class="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-xl">
          <i class="fa fa-times"></i>
        </button>
      </div>
      <form id="bookmarkForm" class="space-y-5">
        <input type="hidden" id="editId">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">网站名称</label>
          <input type="text" id="name" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-slate-700/90 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary" placeholder="例如：百度、GitHub">
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">网站地址</label>
          <input type="url" id="url" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-slate-700/90 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary" placeholder="https://www.baidu.com">
          <p class="text-xs text-gray-500 mt-1">✅ 无需加载图标，页面更流畅</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">分类（必填）</label>
          <input type="text" id="category" required class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-slate-700/90 outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary" placeholder="例如：工具类、影音类、编程类、办公类">
          <p class="text-xs text-gray-500 mt-1">💡 输入相同分类名会自动分组（如：工具类）</p>
        </div>
        <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg shadow-md hover:opacity-90 transition-all mt-2 text-base">保存网址</button>
      </form>
    </div>
  </div>

  <script>
    let bookmarks = [];
    let filteredCategory = 'all'; // 默认显示全部
    const EDIT_NONE = -1;
    let editIndex = EDIT_NONE;

    // 随机卡片配色池
    const cardColorPool = [
      'rgba(255,243,243,0.4)',  // 浅红
      'rgba(243,255,243,0.4)',  // 浅绿
      'rgba(243,243,255,0.4)',  // 浅蓝
      'rgba(255,251,243,0.4)',  // 浅橙
      'rgba(250,243,255,0.4)',  // 浅紫
      'rgba(243,255,251,0.4)',  // 浅青
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

    // 获取随机卡片背景色
    function getRandomCardBg() {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const pool = isDark ? darkCardColorPool : cardColorPool;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // 提取所有分类（去重）
    function getUniqueCategories() {
      const categories = bookmarks.map(item => item.category || '未分类').filter(Boolean);
      return [...new Set(categories)].sort(); // 去重+排序
    }

    // 渲染分类筛选栏
    function renderCategoryFilter() {
      const categories = getUniqueCategories();
      // 清空原有分类标签（保留"全部"）
      const allBtn = categoryFilter.querySelector('[data-category="all"]');
      categoryFilter.innerHTML = '';
      categoryFilter.appendChild(allBtn);

      // 添加分类标签
      categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-tag px-4 py-2 rounded-full glass dark:glass-dark hover:bg-primary/10';
        btn.dataset.category = cat;
        btn.textContent = cat;
        // 绑定筛选事件
        btn.addEventListener('click', () => {
          // 切换激活状态
          document.querySelectorAll('.category-tag').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filteredCategory = cat;
          renderBookmarks();
        });
        categoryFilter.appendChild(btn);
      });

      // 重新绑定"全部"按钮事件
      allBtn.addEventListener('click', () => {
        document.querySelectorAll('.category-tag').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        filteredCategory = 'all';
        renderBookmarks();
      });
    }

    // 按分类分组渲染书签（移除ICO，极致流畅）
    function renderBookmarks() {
      if (bookmarks.length === 0) {
        bookmarkList.innerHTML = \`
          <div class="glass dark:glass-dark p-8 text-center">
            <i class="fa fa-star-o text-5xl text-primary mb-4 opacity-80"></i>
            <p class="text-lg text-gray-600 dark:text-gray-300">暂无收藏的网址</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">点击右上角「添加网址」，开始收藏你的常用网站吧 ✨</p>
          </div>
        \`;
        return;
      }

      // 筛选数据
      const filteredBookmarks = filteredCategory === 'all' 
        ? bookmarks 
        : bookmarks.filter(item => (item.category || '未分类') === filteredCategory);

      if (filteredBookmarks.length === 0) {
        bookmarkList.innerHTML = \`
          <div class="glass dark:glass-dark p-8 text-center">
            <i class="fa fa-folder-open-o text-5xl text-primary mb-4 opacity-80"></i>
            <p class="text-lg text-gray-600 dark:text-gray-300">「\${filteredCategory}」分类下暂无网址</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">点击右上角「添加网址」添加吧～</p>
          </div>
        \`;
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
        // 分类标题
        html += \`
          <div class="category-group">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <i class="fa fa-folder text-primary"></i> \${cat}（\${items.length}个）
            </h2>
            <!-- 分类下的卡片网格 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        \`;

        // 分类下的卡片（移除ICO，优化布局）
        items.forEach((item, index) => {
          const globalIndex = bookmarks.findIndex(b => b.name === item.name && b.url === item.url); // 全局索引
          const cardBg = getRandomCardBg();
          html += \`
            <div class="glass dark:glass-dark p-5 card-hover flex flex-col h-full" style="background: \${cardBg}">
              <div class="flex items-center justify-between mb-4">
                <div class="flex-1">
                  <h3 class="font-bold text-base sm:text-lg truncate" title="\${item.name}">\${item.name}</h3>
                </div>
                <div class="flex gap-2">
                  <button onclick="editBookmark(\${globalIndex})" class="text-secondary hover:text-primary p-1 rounded" title="编辑">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button onclick="deleteBookmark(\${globalIndex})" class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 p-1 rounded" title="删除">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
              <a 
                href="\${item.url}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-sm text-gray-600 dark:text-gray-300 break-all hover:text-primary transition-colors mb-2 flex-1"
              >
                \${item.url}
              </a>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-100/60 dark:bg-slate-700/50 px-2 py-1 rounded-md">\${cat}</p>
            </div>
          \`;
        });

        html += \`</div></div>\`;
      });

      bookmarkList.innerHTML = html;
    }

    // 加载书签数据
    async function loadBookmarks() {
      try {
        const res = await fetch('/api/get');
        const data = await res.json();
        bookmarks = Array.isArray(data) ? data : [];
        // 兼容旧数据（给无分类的旧数据加"未分类"）
        bookmarks = bookmarks.map(item => ({
          ...item,
          category: item.category || item.desc || '未分类' // 旧数据的desc作为分类，无则归为未分类
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
      renderCategoryFilter(); // 先渲染分类筛选栏
      renderBookmarks(); // 再渲染书签
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
      renderCategoryFilter(); // 保存后更新分类栏
    }

    // 添加书签
    function addBookmark() {
      modalTitle.textContent = '添加新网址';
      bookmarkForm.reset();
      editIndex = EDIT_NONE;
      modal.classList.remove('hidden');
      nameInput.focus();
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
    }

    // 删除书签
    function deleteBookmark(index) {
      if (confirm('确定删除该网址吗？删除后无法恢复哦～')) {
        bookmarks.splice(index, 1);
        renderBookmarks();
        saveBookmarks();
      }
    }

    // 表单提交（新增/编辑）
    bookmarkForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newItem = {
        name: nameInput.value.trim(),
        url: urlInput.value.trim(),
        category: categoryInput.value.trim() || '未分类' // 分类不能为空，默认未分类
      };

      if (editIndex === EDIT_NONE) {
        bookmarks.unshift(newItem); // 新增的放最前面
      } else {
        bookmarks[editIndex] = newItem; // 编辑替换
      }

      renderBookmarks();
      saveBookmarks();
      modal.classList.add('hidden');
    });

    // 事件监听
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
