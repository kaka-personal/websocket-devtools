# Chrome Web Store listing copy

Drop these into the Web Store developer console when submitting the extension.
Keep the structure but trim/extend per locale field limits.

---

## English

### Short description (≤132 chars)

Inspect WebSocket traffic directly inside Chrome DevTools — live frames, lifecycle events, filtering, and offline log replay.

### Detailed description

websocket-tools adds a dedicated WebSocket panel to Chrome DevTools, giving frontend and backend engineers a calm, focused workflow for debugging real-time traffic — chat apps, dashboards, AI streaming, collaboration tools, telemetry pipelines, trading clients, and internal control channels.

Everything runs locally inside your browser. No account, no backend, no telemetry.

WHAT YOU CAN DO

Connections & Messages
• Watch every WebSocket connection on the inspected page in real time
• Review connection lifecycle events (open / close / error) alongside frame history
• System events get their own tab so they never get lost in message noise
• Clear messages for the current connection or wipe all connections in one click
• Automatic circuit-breaker pause when message rate spikes, so the panel never floods the inspector

Message Viewing
• Automatic JSON detection with a collapsible / expandable tree view
• Nested JSON parsing — JSON embedded inside string payloads stays expandable

Search & Filter
• Full-text filter across message content
• Save the current filter as a named Filter Favorite and reuse it any time

Import & Export
• Export all messages for the current connection to a log file
• Import a previously exported log back into a connection for offline review

Other
• Seven UI languages: English, 简体中文, 繁體中文, 日本語, 한국어, Français, Deutsch
• Fully local — no backend service required
• Runs inside Chrome DevTools, no extra window needed

PRIVACY

websocket-tools does not collect, transmit, sell, or share any data. All inspected WebSocket traffic stays in memory inside DevTools, and the only items written to local storage are your own UI preferences (filter favorites, language, layout). See the privacy policy for details.

OPEN SOURCE

https://github.com/kaka-personal/websocket-tools

---

## 简体中文 (Simplified Chinese)

### 简短说明 (≤132 字符)

在 Chrome DevTools 中直接查看 WebSocket 流量：实时帧、生命周期事件、过滤搜索、离线日志回放。

### 详细说明

websocket-tools 在 Chrome DevTools 中嵌入一个独立的 WebSocket 调试面板，让前后端工程师能够更专注地排查实时通信问题——聊天、看板、AI 流式输出、协作工具、遥测管线、交易客户端、以及各类内部控制通道。

所有数据都保留在浏览器本地，无需账号、无后端服务、不上报任何遥测。

主要功能

连接与消息
• 实时查看页面里所有 WebSocket 连接
• 同时查看连接生命周期事件（open / close / error）和消息历史
• 系统事件独立 Tab，不会被消息流淹没
• 一键清空当前连接消息或全部连接
• 消息速率过高时自动熔断暂停，避免面板被刷爆

消息查看
• 自动识别 JSON 并提供折叠 / 展开的树形视图
• 嵌套 JSON 解析：字符串里的 JSON 也能继续展开

搜索与过滤
• 按文本内容全文过滤
• 把当前过滤条件保存为命名收藏（Filter Favorites），随时复用

数据导入导出
• 一键导出当前连接的全部消息为日志文件
• 导入之前导出的日志到连接中，便于离线复盘

其他
• 7 种界面语言：English、简体中文、繁體中文、日本語、한국어、Français、Deutsch
• 完全本地处理，无需任何后端服务
• 直接嵌入 Chrome DevTools，无需额外窗口

隐私

websocket-tools 不收集、传输、出售或共享任何数据。所有抓取的 WebSocket 流量仅保留在 DevTools 内存中；写入本地存储的只有你自己的 UI 偏好（筛选收藏、语言、布局）。详见隐私政策。

开源仓库

https://github.com/kaka-personal/websocket-tools

---

## Single-purpose statement (for Privacy Practices form)

Inspect WebSocket traffic on the currently inspected tab from within Chrome DevTools, with filtering, JSON formatting, and local export/import of message logs.

## Permission justifications

- **activeTab** — Required to attach the DevTools panel to the tab being inspected and to relay messages between the panel, the content script, and the page.
- **storage** — Required to persist user-created Filter Favorites, language selection, and minor UI layout preferences locally via `chrome.storage`. No remote sync.
- **host_permissions (http://\*/\* and https://\*/\*)** — Required because the user can open DevTools on any site, and the content script must inject the WebSocket proxy at `document_start` on that page to observe its WebSocket connections. The extension only activates capture when the DevTools panel is open; it never exfiltrates page content.

## Category

Developer Tools

## Distribution suggestion

Start as **Unlisted** for the first submission so you can verify the listing and validate against real Chrome installs, then switch to **Public** once everything looks right.
