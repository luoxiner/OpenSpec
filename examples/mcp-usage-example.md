# OpenSpec MCP Server Usage Examples

This document provides practical examples of using the OpenSpec MCP server with AI assistants.

## Setup

First, configure your MCP client (e.g., Claude Desktop) to use the OpenSpec MCP server:

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

## Example Workflow: Adding Two-Factor Authentication

This example demonstrates a complete workflow using OpenSpec through MCP.

### Step 1: Initialize OpenSpec (if not already done)

**User**: "Initialize OpenSpec in the current project"

**AI Assistant**: *Calls `openspec_init` tool*

```json
{
  "path": ".",
  "tools": "none"
}
```

**Response**:
```
OpenSpec initialized successfully
```

### Step 2: List Existing Specs

**User**: "Show me all existing specs in this project"

**AI Assistant**: *Calls `openspec_list` tool*

```json
{
  "path": ".",
  "mode": "specs"
}
```

**Response**:
```
Specs:
  auth           [requirements 3]
  user-profile   [requirements 5]
  api            [requirements 8]
```

### Step 3: View Auth Spec Details

**User**: "Show me the details of the auth spec"

**AI Assistant**: *Calls `openspec_show` tool*

```json
{
  "itemName": "auth",
  "type": "spec",
  "json": true
}
```

**Response**:
```json
{
  "id": "auth",
  "title": "Authentication Specification",
  "overview": "Authentication and session management",
  "requirementCount": 3,
  "requirements": [
    {
      "text": "### Requirement: User Authentication\nThe system SHALL issue a JWT on successful login.",
      "scenarios": [
        {
          "name": "Valid credentials",
          "steps": ["WHEN a user submits valid credentials", "THEN a JWT is returned"]
        }
      ]
    }
  ]
}
```

### Step 4: Create a Change Proposal

**User**: "I need to add two-factor authentication. Can you help me create an OpenSpec change proposal?"

**AI Assistant**: *Manually creates the change structure*

```bash
mkdir -p openspec/changes/add-2fa/specs/auth
```

Creates `openspec/changes/add-2fa/proposal.md`:
```markdown
## Why
Enhance security by requiring a second factor during authentication.

## What Changes
- Add two-factor authentication requirement
- Support TOTP-based authentication
- **BREAKING**: Login flow now requires OTP verification

## Impact
- Affected specs: auth
- Affected code: authentication service, login API, user database
```

Creates `openspec/changes/add-2fa/tasks.md`:
```markdown
## 1. Database Setup
- [ ] 1.1 Add OTP secret column to users table
- [ ] 1.2 Create OTP verification logs table

## 2. Backend Implementation  
- [ ] 2.1 Add OTP generation endpoint
- [ ] 2.2 Modify login flow to require OTP
- [ ] 2.3 Add OTP verification endpoint

## 3. Frontend Updates
- [ ] 3.1 Create OTP input component
- [ ] 3.2 Update login flow UI
```

Creates `openspec/changes/add-2fa/specs/auth/spec.md`:
```markdown
## ADDED Requirements

### Requirement: Two-Factor Authentication
The system MUST require a second factor during login.

#### Scenario: OTP required
- **WHEN** a user submits valid credentials
- **THEN** an OTP challenge is required
- **AND** the user must provide a valid OTP to complete login

#### Scenario: Invalid OTP
- **WHEN** a user submits an invalid OTP
- **THEN** access is denied
- **AND** an error message is displayed
```

### Step 5: Validate the Change

**User**: "Please validate the add-2fa change proposal"

**AI Assistant**: *Calls `openspec_validate` tool*

```json
{
  "itemName": "add-2fa",
  "type": "change",
  "strict": true,
  "json": true
}
```

**Response**:
```json
{
  "valid": true,
  "issues": []
}
```

### Step 6: List All Changes

**User**: "Show me all active changes"

**AI Assistant**: *Calls `openspec_list` tool*

```json
{
  "path": ".",
  "mode": "changes"
}
```

**Response**:
```
Changes:
  add-2fa           0/5
  update-api        3/4
```

### Step 7: Implement the Change

**User**: "Let's implement the tasks in the add-2fa change"

**AI Assistant**: *Implements the code according to tasks.md, then updates the checklist*

After implementation is complete, tasks.md is updated:
```markdown
## 1. Database Setup
- [x] 1.1 Add OTP secret column to users table
- [x] 1.2 Create OTP verification logs table

## 2. Backend Implementation  
- [x] 2.1 Add OTP generation endpoint
- [x] 2.2 Modify login flow to require OTP
- [x] 2.3 Add OTP verification endpoint

## 3. Frontend Updates
- [x] 3.1 Create OTP input component
- [x] 3.2 Update login flow UI
```

### Step 8: Validate Again After Implementation

**User**: "Validate the change one more time before archiving"

**AI Assistant**: *Calls `openspec_validate` tool*

```json
{
  "itemName": "add-2fa",
  "strict": true,
  "json": true
}
```

### Step 9: Archive the Completed Change

**User**: "Archive the add-2fa change"

**AI Assistant**: *Calls `openspec_archive` tool*

```json
{
  "changeName": "add-2fa",
  "yes": true,
  "skipSpecs": false,
  "validate": true
}
```

**Response**:
```
Change archived successfully
```

This moves `openspec/changes/add-2fa/` to `openspec/changes/archive/2024-11-20-add-2fa/` and merges the spec deltas into `openspec/specs/auth/spec.md`.

## Example: Querying Specific Requirements

**User**: "Show me only the second requirement from the auth spec"

**AI Assistant**: *Calls `openspec_show` tool*

```json
{
  "itemName": "auth",
  "type": "spec",
  "json": true,
  "requirement": 2
}
```

## Example: Validating All Changes

**User**: "Validate all changes in the project"

**AI Assistant**: *Calls `openspec_validate` tool*

```json
{
  "changes": true,
  "strict": true,
  "json": true
}
```

**Response**:
```json
{
  "results": [
    {
      "id": "add-2fa",
      "valid": true,
      "issues": []
    },
    {
      "id": "update-api",
      "valid": false,
      "issues": [
        {
          "level": "ERROR",
          "path": "specs/api/spec.md",
          "message": "Requirement must have at least one scenario"
        }
      ]
    }
  ]
}
```

## Example: Listing Only Requirement Names

**User**: "Show me just the requirements from the auth spec without scenarios"

**AI Assistant**: *Calls `openspec_show` tool*

```json
{
  "itemName": "auth",
  "type": "spec",
  "json": true,
  "requirements": true
}
```

## Tips for AI Assistants Using OpenSpec MCP

1. **Always validate before archiving**: Use `openspec_validate` with `strict: true` before calling `openspec_archive`

2. **Use JSON output for parsing**: Set `json: true` to get structured data that's easy to parse and present to users

3. **Check existing specs first**: Before creating a new change, use `openspec_list` and `openspec_show` to understand the current state

4. **Follow the delta format**: When creating spec deltas, use `## ADDED Requirements`, `## MODIFIED Requirements`, or `## REMOVED Requirements`

5. **Validate early and often**: Run validation after creating proposal files to catch format issues immediately

6. **Use descriptive change names**: Use kebab-case names like `add-2fa`, `update-api-auth`, `remove-legacy-endpoints`

## Troubleshooting

### Change Not Found

If you get "Unknown item" errors:
- Use `openspec_list` with `mode: "changes"` to see available changes
- Check the change ID spelling and case

### Validation Failures

If validation fails:
- Review the error messages in the response
- Check that all requirements have at least one `#### Scenario:` block
- Ensure scenario formatting uses exactly four `#` symbols
- Verify that requirement headers use `### Requirement:`

### Archive Failures

If archiving fails:
- Run `openspec_validate` first to ensure the change is valid
- Check file permissions in the openspec directory
- Ensure all tasks are marked complete if required by your workflow
