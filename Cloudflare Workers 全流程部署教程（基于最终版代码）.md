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