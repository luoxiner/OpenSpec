# OpenSpec MCP Server

OpenSpec MCP (Model Context Protocol) Server 实现了通过 MCP 协议访问 OpenSpec 的所有核心功能，使 AI 助手能够直接使用 OpenSpec 进行规范驱动开发。

## 功能概述

MCP 服务器将 OpenSpec CLI 的所有核心能力作为工具（tools）暴露出来，包括：

- **初始化项目** (`openspec_init`) - 在项目中初始化 OpenSpec
- **列表查看** (`openspec_list`) - 查看活动的变更或规范
- **详情展示** (`openspec_show`) - 显示变更提案或规范的详细信息
- **验证** (`openspec_validate`) - 验证变更提案或规范的格式和结构
- **归档** (`openspec_archive`) - 归档完成的变更提案
- **更新** (`openspec_update`) - 更新项目的指令文件
- **规范列表** (`openspec_spec_list`) - 列出所有可用的规范
- **变更列表** (`openspec_change_list`) - 列出所有活动的变更

## 安装和配置

### 安装

首先，确保已全局安装 OpenSpec：

```bash
npm install -g @fission-ai/openspec@latest
```

或使用本地安装：

```bash
pnpm install
pnpm build
```

### MCP 客户端配置

#### Claude Desktop

在 Claude Desktop 的配置文件中添加 OpenSpec MCP 服务器：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "openspec": {
      "command": "openspec-mcp-server",
      "args": []
    }
  }
}
```

如果使用本地安装：

```json
{
  "mcpServers": {
    "openspec": {
      "command": "node",
      "args": ["/path/to/OpenSpec/bin/openspec-mcp-server.js"]
    }
  }
}
```

#### 其他 MCP 客户端

对于支持 MCP 协议的其他 AI 工具，配置方式类似，只需指向 `openspec-mcp-server` 可执行文件即可。

## 工具说明

### openspec_init

初始化 OpenSpec 项目结构。

**参数**：
- `path` (string, 可选): 目标目录路径，默认为当前目录
- `tools` (string, 可选): 非交互式配置 AI 工具，使用 "all"、"none" 或逗号分隔的工具 ID

**示例**：
```json
{
  "path": ".",
  "tools": "all"
}
```

### openspec_list

列出活动的变更或规范。

**参数**：
- `path` (string, 可选): 项目目录路径，默认为当前目录
- `mode` (string, 可选): 列表模式，"changes"（默认）或 "specs"

**示例**：
```json
{
  "path": ".",
  "mode": "changes"
}
```

### openspec_show

显示变更提案或规范的详细信息。

**参数**：
- `itemName` (string, 必需): 变更或规范的名称/ID
- `type` (string, 可选): 项目类型，"change" 或 "spec"（不指定时自动检测）
- `json` (boolean, 可选): 返回 JSON 格式输出，默认 true
- `deltasOnly` (boolean, 可选): 仅显示变更的增量（仅用于 changes）
- `requirements` (boolean, 可选): 仅显示需求（仅用于 specs）
- `noScenarios` (boolean, 可选): 排除场景内容（仅用于 specs）
- `requirement` (number, 可选): 显示特定需求（仅用于 specs，基于 1 的索引）

**示例**：
```json
{
  "itemName": "add-2fa",
  "type": "change",
  "json": true,
  "deltasOnly": true
}
```

### openspec_validate

验证变更提案或规范。

**参数**：
- `itemName` (string, 可选): 要验证的项目名称/ID（省略则验证所有）
- `type` (string, 可选): 项目类型，"change" 或 "spec"
- `all` (boolean, 可选): 验证所有变更和规范
- `changes` (boolean, 可选): 验证所有变更
- `specs` (boolean, 可选): 验证所有规范
- `strict` (boolean, 可选): 启用严格验证模式
- `json` (boolean, 可选): 以 JSON 格式输出验证结果，默认 true

**示例**：
```json
{
  "itemName": "add-2fa",
  "strict": true,
  "json": true
}
```

### openspec_archive

归档已完成的变更提案。

**参数**：
- `changeName` (string, 必需): 要归档的变更名称/ID
- `yes` (boolean, 可选): 跳过确认提示，默认 true
- `skipSpecs` (boolean, 可选): 跳过规范更新操作（用于基础设施/工具变更）
- `validate` (boolean, 可选): 归档前运行验证，默认 true

**示例**：
```json
{
  "changeName": "add-2fa",
  "yes": true,
  "skipSpecs": false
}
```

### openspec_update

更新项目中的 OpenSpec 指令文件。

**参数**：
- `path` (string, 可选): 项目目录路径，默认为当前目录

**示例**：
```json
{
  "path": "."
}
```

### openspec_spec_list

列出所有可用的规范及详细信息。

**参数**：
- `path` (string, 可选): 项目目录路径，默认为当前目录
- `json` (boolean, 可选): 以 JSON 格式输出，默认 true
- `long` (boolean, 可选): 显示详细信息，默认 true

**示例**：
```json
{
  "path": ".",
  "json": true,
  "long": true
}
```

### openspec_change_list

列出所有活动的变更及任务进度。

**参数**：
- `path` (string, 可选): 项目目录路径，默认为当前目录
- `json` (boolean, 可选): 以 JSON 格式输出，默认 true
- `long` (boolean, 可选): 显示详细信息，默认 true

**示例**：
```json
{
  "path": ".",
  "json": true,
  "long": true
}
```

## 使用示例

### 典型工作流

1. **初始化 OpenSpec**
   ```
   使用 openspec_init 工具初始化项目
   ```

2. **查看现有规范**
   ```
   使用 openspec_spec_list 查看所有规范
   使用 openspec_show 查看特定规范详情
   ```

3. **创建变更提案**
   ```
   在 openspec/changes/ 目录下手动创建变更文件夹
   或使用 AI 助手根据 OpenSpec 指南创建
   ```

4. **验证变更**
   ```
   使用 openspec_validate 验证变更格式
   ```

5. **实施变更**
   ```
   按照 tasks.md 中的任务列表实施代码变更
   ```

6. **归档变更**
   ```
   使用 openspec_archive 归档完成的变更
   ```

### 与 AI 助手交互示例

当使用支持 MCP 的 AI 助手（如 Claude Desktop）时：

**用户**: "请列出当前项目中的所有变更"

**AI**: *调用 openspec_list 工具，mode="changes"*
```
Changes:
  add-2fa           0/5
  update-api        3/4
```

**用户**: "显示 add-2fa 变更的详细信息"

**AI**: *调用 openspec_show 工具，itemName="add-2fa", json=true*
```json
{
  "id": "add-2fa",
  "proposal": "...",
  "tasks": [...],
  "deltas": [...]
}
```

**用户**: "验证这个变更"

**AI**: *调用 openspec_validate 工具，itemName="add-2fa", strict=true*
```json
{
  "valid": true,
  "issues": []
}
```

## 技术细节

### 架构

MCP 服务器使用 `@modelcontextprotocol/sdk` 实现，通过标准输入/输出（stdio）进行通信。服务器：

1. 监听来自 MCP 客户端的请求
2. 将请求路由到相应的 OpenSpec 命令类
3. 捕获命令输出并返回给客户端
4. 处理错误并提供有意义的错误消息

### 输出格式

- 默认情况下，工具返回 JSON 格式的输出以便于解析
- 所有工具都支持 `json` 参数来控制输出格式
- 错误会以结构化的方式返回，包含错误消息和上下文

### 性能考虑

- MCP 服务器为每个请求创建新的命令实例
- 输出通过拦截 console.log/console.error 来捕获
- 大型项目可能需要较长时间来验证所有变更和规范

## 故障排除

### MCP 服务器无法启动

1. 确保已正确安装 OpenSpec：`npm install -g @fission-ai/openspec`
2. 检查 Node.js 版本：需要 >= 20.19.0
3. 查看 MCP 客户端日志以获取详细错误信息

### 工具调用失败

1. 确保当前目录是 OpenSpec 项目（包含 `openspec/` 目录）
2. 检查文件权限
3. 验证传递的参数是否正确

### 输出格式问题

1. 使用 `json: true` 参数获取结构化输出
2. 查看返回的错误消息以了解具体问题
3. 使用 `strict: true` 进行更严格的验证

## 开发和调试

### 本地测试

```bash
# 构建项目
pnpm build

# 运行 MCP 服务器
node bin/openspec-mcp-server.js
```

服务器会在 stderr 输出启动消息，并在 stdio 上监听 MCP 协议消息。

### 调试技巧

1. MCP 服务器输出调试信息到 stderr
2. 使用 MCP 客户端的日志查看完整的请求/响应
3. 可以在 `src/mcp/server.ts` 中添加额外的日志语句

## 贡献

欢迎贡献！如果你想为 MCP 服务器添加新功能或修复 bug：

1. Fork 仓库
2. 创建特性分支
3. 提交你的更改
4. 创建 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件
