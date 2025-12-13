// Cloudflare Workers 脚本
// 用于处理书签应用的API请求和KV存储交互

// 定义KV命名空间绑定
// 在实际部署时，这些将由Cloudflare自动绑定
const BOOKMARKS_KV = 'BOOKMARKS_APP_DATA';
const CONFIG_KV = 'BOOKMARKS_APP_CONFIG';

// 处理CORS请求
const handleCors = (request) => {
  // 检查是否为预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // 为实际请求设置CORS头
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
};

// 从KV存储获取数据
async function getFromKV(namespace, key) {
  try {
    const value = await BOOKMARKS_KV.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting data from KV: ${error}`);
    return null;
  }
}

// 保存数据到KV存储
async function saveToKV(namespace, key, data) {
  try {
    await BOOKMARKS_KV.put(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data to KV: ${error}`);
    return false;
  }
}

// 处理API请求
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '').split('/');
  const resource = path[0];
  const id = path[1];
  
  // 设置CORS头
  const corsHeaders = handleCors(request);
  
  // 处理书签请求
  if (resource === 'bookmarks') {
    // 获取所有书签
    if (request.method === 'GET' && !id) {
      const bookmarks = await getFromKV(BOOKMARKS_KV, 'bookmarks') || [];
      return new Response(JSON.stringify(bookmarks), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // 获取单个书签
    if (request.method === 'GET' && id) {
      const bookmarks = await getFromKV(BOOKMARKS_KV, 'bookmarks') || [];
      const bookmark = bookmarks.find(b => b.id === id);
      
      if (!bookmark) {
        return new Response(JSON.stringify({ error: 'Bookmark not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      return new Response(JSON.stringify(bookmark), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // 创建新书签
    if (request.method === 'POST') {
      try {
        const newBookmark = await request.json();
        const bookmarks = await getFromKV(BOOKMARKS_KV, 'bookmarks') || [];
        
        // 生成唯一ID和时间戳
        newBookmark.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        newBookmark.createdAt = new Date().toISOString();
        newBookmark.updatedAt = new Date().toISOString();
        
        bookmarks.push(newBookmark);
        const success = await saveToKV(BOOKMARKS_KV, 'bookmarks', bookmarks);
        
        if (!success) {
          return new Response(JSON.stringify({ error: 'Failed to save bookmark' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        return new Response(JSON.stringify(newBookmark), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
    
    // 更新书签
    if (request.method === 'PUT' && id) {
      try {
        const updatedBookmark = await request.json();
        const bookmarks = await getFromKV(BOOKMARKS_KV, 'bookmarks') || [];
        
        const index = bookmarks.findIndex(b => b.id === id);
        if (index === -1) {
          return new Response(JSON.stringify({ error: 'Bookmark not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        // 更新书签并保留创建时间
        bookmarks[index] = {
          ...bookmarks[index],
          ...updatedBookmark,
          id, // 确保ID不变
          createdAt: bookmarks[index].createdAt, // 保留创建时间
          updatedAt: new Date().toISOString() // 更新修改时间
        };
        
        const success = await saveToKV(BOOKMARKS_KV, 'bookmarks', bookmarks);
        
        if (!success) {
          return new Response(JSON.stringify({ error: 'Failed to update bookmark' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        return new Response(JSON.stringify(bookmarks[index]), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
    
    // 删除书签
    if (request.method === 'DELETE' && id) {
      const bookmarks = await getFromKV(BOOKMARKS_KV, 'bookmarks') || [];
      const filteredBookmarks = bookmarks.filter(b => b.id !== id);
      
      if (filteredBookmarks.length === bookmarks.length) {
        return new Response(JSON.stringify({ error: 'Bookmark not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      const success = await saveToKV(BOOKMARKS_KV, 'bookmarks', filteredBookmarks);
      
      if (!success) {
        return new Response(JSON.stringify({ error: 'Failed to delete bookmark' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
  
  // 处理分类请求
  if (resource === 'categories') {
    // 获取所有分类
    if (request.method === 'GET') {
      const categories = await getFromKV(BOOKMARKS_KV, 'categories') || [];
      return new Response(JSON.stringify(categories), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // 创建新分类
    if (request.method === 'POST') {
      try {
        const newCategory = await request.json();
        const categories = await getFromKV(BOOKMARKS_KV, 'categories') || [];
        
        // 检查分类名称是否已存在
        if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
          return new Response(JSON.stringify({ error: 'Category name already exists' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        // 生成唯一ID和时间戳
        newCategory.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        newCategory.createdAt = new Date().toISOString();
        
        categories.push(newCategory);
        const success = await saveToKV(BOOKMARKS_KV, 'categories', categories);
        
        if (!success) {
          return new Response(JSON.stringify({ error: 'Failed to save category' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        return new Response(JSON.stringify(newCategory), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
    
    // 更新分类
    if (request.method === 'PUT' && id) {
      try {
        const updatedCategory = await request.json();
        const categories = await getFromKV(BOOKMARKS_KV, 'categories') || [];
        
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) {
          return new Response(JSON.stringify({ error: 'Category not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        // 检查新名称是否与其他分类冲突
        if (updatedCategory.name && 
            categories.some(c => c.id !== id && c.name.toLowerCase() === updatedCategory.name.toLowerCase())) {
          return new Response(JSON.stringify({ error: 'Category name already exists' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        // 更新分类并保留创建时间
        categories[index] = {
          ...categories[index],
          ...updatedCategory,
          id // 确保ID不变
        };
        
        const success = await saveToKV(BOOKMARKS_KV, 'categories', categories);
        
        if (!success) {
          return new Response(JSON.stringify({ error: 'Failed to update category' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        return new Response(JSON.stringify(categories[index]), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
    
    // 删除分类
    if (request.method === 'DELETE' && id) {
      const categories = await getFromKV(BOOKMARKS_KV, 'categories') || [];
      const filteredCategories = categories.filter(c => c.id !== id);
      
      if (filteredCategories.length === categories.length) {
        return new Response(JSON.stringify({ error: 'Category not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // 同时更新使用此分类的书签
      const bookmarks = await getFromKV(BOOKMARKS_KV, 'bookmarks') || [];
      const updatedBookmarks = bookmarks.map(bookmark => {
        if (bookmark.category === id) {
          return { ...bookmark, category: '' };
        }
        return bookmark;
      });
      
      const success1 = await saveToKV(BOOKMARKS_KV, 'categories', filteredCategories);
      const success2 = await saveToKV(BOOKMARKS_KV, 'bookmarks', updatedBookmarks);
      
      if (!success1 || !success2) {
        return new Response(JSON.stringify({ error: 'Failed to delete category' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
  
  // 处理用户配置请求
  if (resource === 'user' && path[1] === 'config') {
    // 获取用户配置
    if (request.method === 'GET') {
      const config = await getFromKV(CONFIG_KV, 'user_config') || { theme: 'light' };
      return new Response(JSON.stringify(config), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // 更新用户配置
    if (request.method === 'PUT') {
      try {
        const updatedConfig = await request.json();
        const success = await saveToKV(CONFIG_KV, 'user_config', updatedConfig);
        
        if (!success) {
          return new Response(JSON.stringify({ error: 'Failed to save configuration' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        return new Response(JSON.stringify(updatedConfig), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
  }
  
  // 如果没有匹配的API端点
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// 处理静态文件请求
async function handleStaticRequest(request) {
  const url = new URL(request.url);
  let path = url.pathname;
  
  // 默认返回index.html
  if (path === '/') {
    path = '/index.html';
  }
  
  // 构建文件路径
  const filePath = `./${path.substring(1)}`;
  
  try {
    // 在实际部署时，这里会从Cloudflare Pages或Workers KV获取静态文件
    // 现在返回一个简单的响应
    return new Response('Static file would be served here', {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    return new Response('File not found', {
      status: 404
    });
  }
}

// 主请求处理函数
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 处理API请求
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(request);
  }
  
  // 处理静态文件请求
  return handleStaticRequest(request);
}

// 导出处理函数
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});