# 多站点分流代理 Cloudflare Worker 完整版代码（最优写法）

你需要的是 **路径分流代理**：访问 `你的Worker域名/A` 就代理目标地址A1、访问 `你的Worker域名/B` 就代理目标地址B1，同时支持**多路径配置、参数原样透传、完美跨域、防盗链伪装**，我给你写了两种版本，都是可直接复制部署的成品，**优先推荐版本一（简洁易维护，99%场景够用）**。

## ✅ 版本一：简洁通用版（推荐，最多人用，易扩展）

### 核心特性

1. 访问 `https://你的worker域名/自定义路径` 代理对应接口，比如：

    - `域名/A` → 代理 `https://api.com/api.php/provide/vod` (你的A1目标站)

    - `域名/B` → 代理 `https://bbb.com/api/provide/vod` (你的B1目标站)

    - 可无限新增 `C、D、E` 等任意路径，一行配置搞定

2. GET/POST请求都支持，所有请求参数 `?wd=xxx&ac=list` 自动透传

3. 内置完整跨域+防盗链配置，不会出现403/跨域报错

4. 支持直接访问根域名返回提示页，避免空白报错

```JavaScript

// ===================== 核心配置区【重点：在这里修改你的代理规则】=====================
// 格式：{ "自定义访问路径": "目标代理地址" } ，可无限新增！！！
const PROXY_MAP = {
  "/A": "https://api.com/api.php/provide/vod",  // 你的A站点代理规则
  "/B": "https://bbb.com/api/provide/vod",     // 你的B站点代理规则
  "/C": "https://ccc.com/api/xxx/play",        // 新增C站点，复制一行改路径和地址即可
  "/D": "https://ddd.com/json/api"             // 新增D站点
};

// 主入口
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname; // 获取当前访问的路径 例如 /A 、 /B
    
    // 1. 处理 OPTIONS 预检请求，解决跨域必加
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // 2. 判断当前访问的路径是否在代理规则里
    if (PROXY_MAP[pathname]) {
      const targetUrl = new URL(PROXY_MAP[pathname]);
      targetUrl.search = url.search; // 关键：把前端的所有请求参数原样透传给目标站
      
      // 构建代理请求配置，防403+透传请求信息
      const requestConfig = {
        method: request.method,
        headers: new Headers(request.headers),
        body: request.body,
        redirect: 'follow',
        cf: { cacheTtl: 60 } // CF缓存加速，非CF环境删除此行即可
      };

      // 防盗链伪装配置【解决403的核心，必须加】
      requestConfig.headers.set('Origin', targetUrl.origin);
      requestConfig.headers.set('Referer', targetUrl.origin);
      requestConfig.headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');
      requestConfig.headers.delete('cookie');
      requestConfig.headers.delete('host');

      // 发起代理请求并返回结果
      const response = await fetch(targetUrl.toString(), requestConfig);
      const proxyRes = new Response(response.body, response);
      
      // 添加跨域响应头，前端正常接收数据
      proxyRes.headers.set('Access-Control-Allow-Origin', '*');
      proxyRes.headers.delete('Content-Security-Policy');
      proxyRes.headers.delete('X-Frame-Options');
      
      return proxyRes;
    }

    // 3. 访问根域名/未配置的路径时，返回提示页（可选）
    return new Response(`
      <div style="text-align:center;margin-top:100px;font-size:18px;">
        多站点代理服务已启动 ✔️<br><br>
        支持路径：${Object.keys(PROXY_MAP).join(' | ')}<br>
        使用示例：${url.origin}/A?wd=xxx&ac=list
      </div>
    `, { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }
};
```

## ✅ 版本二：增强完整版（生产环境推荐，带容错+超时+缓存）

在版本一的基础上，增加了 **请求超时处理、异常兜底、全局缓存加速、错误提示**，稳定性拉满，适合长期使用，代码稍微长一点，但同样好维护，配置区位置不变：

```JavaScript

// ===================== 核心配置区【修改这里即可】=====================
const PROXY_MAP = {
  "/A": "https://api.com/api.php/provide/vod",
  "/B": "https://bbb.com/api/provide/vod",
  "/C": "https://ccc.com/api/play"
};
const TIMEOUT = 10000; // 请求超时时间 10秒
const CACHE_TTL = 300; // 缓存时间 5分钟

// 主入口
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 处理跨域预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // 匹配代理规则
    if (PROXY_MAP[pathname]) {
      try {
        const targetUrl = new URL(PROXY_MAP[pathname]);
        targetUrl.search = url.search; // 透传所有参数
        
        const requestConfig = {
          method: request.method,
          headers: new Headers(request.headers),
          body: request.body,
          redirect: 'follow',
          cf: { cacheTtl: CACHE_TTL, cacheEverything: true }
        };

        // 防403伪装
        requestConfig.headers.set('Origin', targetUrl.origin);
        requestConfig.headers.set('Referer', targetUrl.href);
        requestConfig.headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');
        requestConfig.headers.delete('cookie');
        requestConfig.headers.delete('host');

        // 超时处理
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('请求超时'), TIMEOUT));
        const response = await Promise.race([fetch(targetUrl, requestConfig), timeoutPromise]);
        
        const proxyRes = new Response(response.body, response);
        proxyRes.headers.set('Access-Control-Allow-Origin', '*');
        proxyRes.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
        proxyRes.headers.delete('Content-Security-Policy');
        proxyRes.headers.delete('X-Frame-Options');
        
        return proxyRes;
      } catch (err) {
        // 异常兜底返回
        return new Response(JSON.stringify({
          code: 500,
          msg: '代理请求失败',
          error: String(err)
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // 根路径提示页
    return new Response(`
      <div style="text-align:center;margin-top:100px;font-size:18px;">
        ✅ 多站代理服务运行中<br><br>
        可用代理路径：<br>${Object.keys(PROXY_MAP).map(p => `${url.origin}${p}`).join('<br>')}
      </div>
    `, { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }
};
```

---

## ✅ 核心使用方法（超简单，必看）

### 1. 新增/修改代理站点

只需要修改代码最上方的 `PROXY_MAP` 对象即可，**格式永远是：** **`"访问路径": "目标代理地址"`**

```JavaScript

// 示例：新增一个 /D 代理 https://ddd.com/api/vod
const PROXY_MAP = {
  "/A": "https://api.com/api.php/provide/vod",
  "/B": "https://bbb.com/api/provide/vod",
  "/C": "https://ccc.com/api/play",
  "/D": "https://ddd.com/api/vod"  // 新增这一行即可
};
```

✅ 支持任意自定义路径：`/1`、`/tv`、`/movie`、`/api` 都可以，没有限制！

### 2. 前端调用方式（无缝替换）

比如你的Worker域名是：`https://vod-proxy.abc.workers.dev`

- 原来请求A1站：`https://api.com/api.php/provide/vod?wd=斗罗大陆&ac=list`

- 现在请求：`https://vod-proxy.abc.workers.dev/A?wd=斗罗大陆&ac=list`

- 原来请求B1站：`https://bbb.com/api/provide/vod?ac=detail&ids=123`

- 现在请求：`https://vod-proxy.abc.workers.dev/B?ac=detail&ids=123`

✅ **所有参数、请求方式(GET/POST)完全不变**，前端代码只需要改域名+路径即可，无需任何其他修改！

---

## ✅ 关键注意事项（避坑指南，解决99%问题）

### ✔️ 1. 部署兼容

- 部署到 **Cloudflare Worker**：直接复制代码，无需修改任何内容，完美兼容；

- 部署到其他Worker环境（Vercel/自建）：删除代码中所有 `cf: { ... }` 相关配置即可正常运行。

### ✔️ 2. 出现403/404错误（最常见）

原因：目标网站做了防盗链/IP拦截/UA验证，解决方案：在 `requestConfig.headers` 里加一行配置即可，加在伪装区：

```JavaScript

// 新增这一行，更强的伪装，解决403
requestConfig.headers.set('sec-ch-ua', '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"');
```

### ✔️ 3. POST请求传参失败

把代码里的 `body: request.body` 改成 `body: request.method === 'POST' ? await request.text() : null` 即可兼容所有POST表单格式。

### ✔️ 4. 支持子路径代理

比如你想让 `域名/vod/1` 代理 `xxx.com/vod`，直接在 `PROXY_MAP` 里写 `"/vod/1": "https://xxx.com/vod"` 就行，支持多级路径。

---

## ✅ 总结

1. 核心逻辑：通过 **访问路径(pathname)** 匹配对应的目标代理地址，极简配置，无限扩展站点；

2. 所有版本都内置 **完美跨域+防盗链伪装**，这是这类代理的核心，不用再单独加代码；

3. 优先用版本一，简洁易维护；追求稳定性用版本二，带超时和异常处理；

4. 新增站点只需要在配置区加一行，零基础也能改，非常方便。

部署完成后，你的一个Worker就能代理无限个站点，完美满足你的需求！🎉
> （注：文档部分内容可能由 AI 生成）