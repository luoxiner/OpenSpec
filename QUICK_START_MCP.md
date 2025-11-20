# OpenSpec MCP Server - Quick Start Guide

快速开始使用 OpenSpec MCP 服务器

## 1分钟快速配置

### 步骤 1: 安装 OpenSpec

```bash
npm install -g @fission-ai/openspec@latest
```

### 步骤 2: 配置 Claude Desktop

**macOS**: 编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: 编辑 `%APPDATA%\Claude\claude_desktop_config.json`

添加以下内容：

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

### 步骤 3: 重启 Claude Desktop

重启 Claude Desktop 使配置生效。

### 步骤 4: 开始使用

在 Claude Desktop 中尝试以下命令：

```
列出当前项目的所有规范
```

或

```
初始化 OpenSpec
```

## 常用命令示例

### 初始化项目
```
请使用 OpenSpec 初始化当前项目
```

### 查看规范列表
```
显示所有可用的规范
```

### 查看变更列表
```
列出所有活动的变更
```

### 查看详细信息
```
显示 auth 规范的详细信息
```

### 验证变更
```
验证 add-2fa 变更提案
```

### 归档变更
```
归档 add-2fa 变更
```

## 可用的 MCP 工具

1. **openspec_init** - 初始化 OpenSpec
2. **openspec_list** - 列出变更或规范
3. **openspec_show** - 显示详细信息
4. **openspec_validate** - 验证格式和结构
5. **openspec_archive** - 归档完成的变更
6. **openspec_update** - 更新配置文件
7. **openspec_spec_list** - 列出所有规范
8. **openspec_change_list** - 列出所有变更

## 获取帮助

- 详细文档: [MCP_SERVER.md](MCP_SERVER.md)
- 使用示例: [examples/mcp-usage-example.md](examples/mcp-usage-example.md)
- 配置示例: [mcp-config-examples.json](mcp-config-examples.json)

## 故障排除

### 服务器无法启动

1. 确认 Node.js 版本 >= 20.19.0: `node --version`
2. 确认 OpenSpec 已安装: `openspec --version`
3. 检查 Claude Desktop 日志

### 工具不可用

1. 确认配置文件格式正确（有效的 JSON）
2. 重启 Claude Desktop
3. 检查命令路径是否正确

### 命令失败

1. 确保在 OpenSpec 项目目录中
2. 检查文件权限
3. 查看错误消息获取详细信息

## 下一步

1. 阅读完整文档了解所有功能
2. 查看示例了解典型工作流
3. 在您的项目中开始使用 OpenSpec

---

**提示**: OpenSpec MCP 服务器使所有 OpenSpec 功能都可以通过 AI 助手原生调用，无需手动输入命令。
