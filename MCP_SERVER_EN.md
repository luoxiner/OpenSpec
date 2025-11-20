# OpenSpec MCP Server

OpenSpec MCP (Model Context Protocol) Server exposes all core OpenSpec capabilities through the MCP protocol, enabling AI assistants to directly use OpenSpec for spec-driven development.

## Overview

The MCP server exposes all core OpenSpec CLI capabilities as tools, including:

- **Initialize Project** (`openspec_init`) - Initialize OpenSpec in a project
- **List Items** (`openspec_list`) - View active changes or specs
- **Show Details** (`openspec_show`) - Display detailed information about changes or specs
- **Validate** (`openspec_validate`) - Validate change proposals or spec format and structure
- **Archive** (`openspec_archive`) - Archive completed change proposals
- **Update** (`openspec_update`) - Update project instruction files
- **List Specs** (`openspec_spec_list`) - List all available specs
- **List Changes** (`openspec_change_list`) - List all active changes

## Installation and Configuration

### Installation

First, ensure OpenSpec is installed globally:

```bash
npm install -g @fission-ai/openspec@latest
```

Or use local installation:

```bash
pnpm install
pnpm build
```

### MCP Client Configuration

#### Claude Desktop

Add the OpenSpec MCP server to Claude Desktop's configuration file:

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

For local installation:

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

#### Other MCP Clients

For other AI tools that support the MCP protocol, the configuration is similar - just point to the `openspec-mcp-server` executable.

## Tool Reference

### openspec_init

Initialize OpenSpec project structure.

**Parameters**:
- `path` (string, optional): Target directory path, defaults to current directory
- `tools` (string, optional): Non-interactive AI tool configuration, use "all", "none", or comma-separated tool IDs

**Example**:
```json
{
  "path": ".",
  "tools": "all"
}
```

### openspec_list

List active changes or specs.

**Parameters**:
- `path` (string, optional): Project directory path, defaults to current directory
- `mode` (string, optional): List mode, "changes" (default) or "specs"

**Example**:
```json
{
  "path": ".",
  "mode": "changes"
}
```

### openspec_show

Display detailed information about a change proposal or spec.

**Parameters**:
- `itemName` (string, required): Name/ID of the change or spec
- `type` (string, optional): Item type, "change" or "spec" (auto-detected if not specified)
- `json` (boolean, optional): Return JSON format output, defaults to true
- `deltasOnly` (boolean, optional): Show only deltas (for changes only)
- `requirements` (boolean, optional): Show only requirements (for specs only)
- `noScenarios` (boolean, optional): Exclude scenario content (for specs only)
- `requirement` (number, optional): Show specific requirement (for specs only, 1-based index)

**Example**:
```json
{
  "itemName": "add-2fa",
  "type": "change",
  "json": true,
  "deltasOnly": true
}
```

### openspec_validate

Validate change proposals or specs.

**Parameters**:
- `itemName` (string, optional): Name/ID of item to validate (omit to validate all)
- `type` (string, optional): Item type, "change" or "spec"
- `all` (boolean, optional): Validate all changes and specs
- `changes` (boolean, optional): Validate all changes
- `specs` (boolean, optional): Validate all specs
- `strict` (boolean, optional): Enable strict validation mode
- `json` (boolean, optional): Output validation results as JSON, defaults to true

**Example**:
```json
{
  "itemName": "add-2fa",
  "strict": true,
  "json": true
}
```

### openspec_archive

Archive a completed change proposal.

**Parameters**:
- `changeName` (string, required): Name/ID of the change to archive
- `yes` (boolean, optional): Skip confirmation prompts, defaults to true
- `skipSpecs` (boolean, optional): Skip spec update operations (for infrastructure/tooling changes)
- `validate` (boolean, optional): Run validation before archiving, defaults to true

**Example**:
```json
{
  "changeName": "add-2fa",
  "yes": true,
  "skipSpecs": false
}
```

### openspec_update

Update OpenSpec instruction files in the project.

**Parameters**:
- `path` (string, optional): Project directory path, defaults to current directory

**Example**:
```json
{
  "path": "."
}
```

### openspec_spec_list

List all available specs with detailed information.

**Parameters**:
- `path` (string, optional): Project directory path, defaults to current directory
- `json` (boolean, optional): Output as JSON, defaults to true
- `long` (boolean, optional): Show detailed information, defaults to true

**Example**:
```json
{
  "path": ".",
  "json": true,
  "long": true
}
```

### openspec_change_list

List all active changes with task progress.

**Parameters**:
- `path` (string, optional): Project directory path, defaults to current directory
- `json` (boolean, optional): Output as JSON, defaults to true
- `long` (boolean, optional): Show detailed information, defaults to true

**Example**:
```json
{
  "path": ".",
  "json": true,
  "long": true
}
```

## Usage Examples

### Typical Workflow

1. **Initialize OpenSpec**
   ```
   Use openspec_init tool to initialize the project
   ```

2. **View Existing Specs**
   ```
   Use openspec_spec_list to see all specs
   Use openspec_show to view specific spec details
   ```

3. **Create Change Proposal**
   ```
   Manually create a change folder in openspec/changes/
   Or use an AI assistant following OpenSpec guidelines
   ```

4. **Validate Changes**
   ```
   Use openspec_validate to verify change format
   ```

5. **Implement Changes**
   ```
   Follow the task list in tasks.md to implement code changes
   ```

6. **Archive Changes**
   ```
   Use openspec_archive to archive completed changes
   ```

### AI Assistant Interaction Example

When using an MCP-enabled AI assistant (like Claude Desktop):

**User**: "Please list all changes in the current project"

**AI**: *Calls openspec_list tool with mode="changes"*
```
Changes:
  add-2fa           0/5
  update-api        3/4
```

**User**: "Show details of the add-2fa change"

**AI**: *Calls openspec_show tool with itemName="add-2fa", json=true*
```json
{
  "id": "add-2fa",
  "proposal": "...",
  "tasks": [...],
  "deltas": [...]
}
```

**User**: "Validate this change"

**AI**: *Calls openspec_validate tool with itemName="add-2fa", strict=true*
```json
{
  "valid": true,
  "issues": []
}
```

## Technical Details

### Architecture

The MCP server is implemented using `@modelcontextprotocol/sdk` and communicates via standard input/output (stdio). The server:

1. Listens for requests from MCP clients
2. Routes requests to appropriate OpenSpec command classes
3. Captures command output and returns it to the client
4. Handles errors and provides meaningful error messages

### Output Format

- By default, tools return JSON format output for easy parsing
- All tools support a `json` parameter to control output format
- Errors are returned in a structured way with error messages and context

### Performance Considerations

- The MCP server creates new command instances for each request
- Output is captured by intercepting console.log/console.error
- Large projects may take longer to validate all changes and specs

## Troubleshooting

### MCP Server Won't Start

1. Ensure OpenSpec is properly installed: `npm install -g @fission-ai/openspec`
2. Check Node.js version: requires >= 20.19.0
3. Check MCP client logs for detailed error information

### Tool Calls Fail

1. Ensure current directory is an OpenSpec project (contains `openspec/` directory)
2. Check file permissions
3. Verify passed parameters are correct

### Output Format Issues

1. Use `json: true` parameter to get structured output
2. Check returned error messages for specific issues
3. Use `strict: true` for more rigorous validation

## Development and Debugging

### Local Testing

```bash
# Build the project
pnpm build

# Run the MCP server
node bin/openspec-mcp-server.js
```

The server will output startup messages to stderr and listen for MCP protocol messages on stdio.

### Debugging Tips

1. MCP server outputs debug info to stderr
2. Use MCP client logs to view complete request/response
3. Add additional logging statements in `src/mcp/server.ts`

## Contributing

Contributions are welcome! If you want to add new features or fix bugs in the MCP server:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Create a Pull Request

## License

MIT License - See LICENSE file for details
