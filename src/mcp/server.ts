#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { InitCommand } from '../core/init.js';
import { UpdateCommand } from '../core/update.js';
import { ListCommand } from '../core/list.js';
import { ArchiveCommand } from '../core/archive.js';
import { ValidateCommand } from '../commands/validate.js';
import { ShowCommand } from '../commands/show.js';

// Define the tools available in the MCP server
const tools: Tool[] = [
  {
    name: 'openspec_init',
    description: 'Initialize OpenSpec in a project directory. Creates the openspec/ folder structure and configures AI tool integrations.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Target directory path (defaults to current directory)',
          default: '.',
        },
        tools: {
          type: 'string',
          description: 'Configure AI tools non-interactively. Use "all", "none", or comma-separated tool IDs',
        },
      },
    },
  },
  {
    name: 'openspec_list',
    description: 'List active changes or specs in the OpenSpec project. By default lists changes; use mode parameter to list specs.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Project directory path',
          default: '.',
        },
        mode: {
          type: 'string',
          enum: ['changes', 'specs'],
          description: 'What to list: "changes" (default) or "specs"',
          default: 'changes',
        },
      },
    },
  },
  {
    name: 'openspec_show',
    description: 'Display details of a change proposal or spec. Returns structured information including requirements, scenarios, tasks, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        itemName: {
          type: 'string',
          description: 'Name/ID of the change or spec to show',
        },
        type: {
          type: 'string',
          enum: ['change', 'spec'],
          description: 'Type of item to show (auto-detected if not specified)',
        },
        json: {
          type: 'boolean',
          description: 'Return output as JSON',
          default: true,
        },
        deltasOnly: {
          type: 'boolean',
          description: 'For changes: show only deltas (JSON only)',
        },
        requirements: {
          type: 'boolean',
          description: 'For specs: show only requirements (exclude scenarios)',
        },
        noScenarios: {
          type: 'boolean',
          description: 'For specs: exclude scenario content',
        },
        requirement: {
          type: 'number',
          description: 'For specs: show specific requirement by ID (1-based)',
        },
      },
      required: ['itemName'],
    },
  },
  {
    name: 'openspec_validate',
    description: 'Validate change proposals or specs. Checks formatting, structure, and required elements. Returns validation report.',
    inputSchema: {
      type: 'object',
      properties: {
        itemName: {
          type: 'string',
          description: 'Name/ID of item to validate (omit to validate all)',
        },
        type: {
          type: 'string',
          enum: ['change', 'spec'],
          description: 'Type of item to validate',
        },
        all: {
          type: 'boolean',
          description: 'Validate all changes and specs',
        },
        changes: {
          type: 'boolean',
          description: 'Validate all changes',
        },
        specs: {
          type: 'boolean',
          description: 'Validate all specs',
        },
        strict: {
          type: 'boolean',
          description: 'Enable strict validation mode',
        },
        json: {
          type: 'boolean',
          description: 'Output validation results as JSON',
          default: true,
        },
      },
    },
  },
  {
    name: 'openspec_archive',
    description: 'Archive a completed change proposal. Moves it to archive/ and optionally updates main specs with the approved deltas.',
    inputSchema: {
      type: 'object',
      properties: {
        changeName: {
          type: 'string',
          description: 'Name/ID of the change to archive',
        },
        yes: {
          type: 'boolean',
          description: 'Skip confirmation prompts',
          default: true,
        },
        skipSpecs: {
          type: 'boolean',
          description: 'Skip spec update operations (for infrastructure/tooling changes)',
        },
        validate: {
          type: 'boolean',
          description: 'Run validation before archiving',
          default: true,
        },
      },
      required: ['changeName'],
    },
  },
  {
    name: 'openspec_update',
    description: 'Update OpenSpec instruction files in a project. Refreshes AI agent instructions and slash commands.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Project directory path',
          default: '.',
        },
      },
    },
  },
  {
    name: 'openspec_spec_list',
    description: 'List all available specs with detailed information. Returns spec IDs and requirement counts.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Project directory path',
          default: '.',
        },
        json: {
          type: 'boolean',
          description: 'Output as JSON',
          default: true,
        },
        long: {
          type: 'boolean',
          description: 'Show detailed information',
          default: true,
        },
      },
    },
  },
  {
    name: 'openspec_change_list',
    description: 'List all active changes with task progress. Returns change IDs and completion status.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Project directory path',
          default: '.',
        },
        json: {
          type: 'boolean',
          description: 'Output as JSON',
          default: true,
        },
        long: {
          type: 'boolean',
          description: 'Show detailed information',
          default: true,
        },
      },
    },
  },
];

// Capture console output
function captureConsoleOutput(fn: () => Promise<void>): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const originalLog = console.log;
    const originalError = console.error;
    const output: string[] = [];

    console.log = (...args: any[]) => {
      output.push(args.map(a => String(a)).join(' '));
    };
    console.error = (...args: any[]) => {
      output.push(args.map(a => String(a)).join(' '));
    };

    try {
      await fn();
      console.log = originalLog;
      console.error = originalError;
      resolve(output.join('\n'));
    } catch (error) {
      console.log = originalLog;
      console.error = originalError;
      reject(error);
    }
  });
}

// Create the MCP server
const server = new Server(
  {
    name: 'openspec-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool list requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'openspec_init': {
        const { path = '.', tools } = args as { path?: string; tools?: string };
        const initCommand = new InitCommand({ tools });
        const output = await captureConsoleOutput(() => initCommand.execute(path));
        return {
          content: [
            {
              type: 'text',
              text: output || 'OpenSpec initialized successfully',
            },
          ],
        };
      }

      case 'openspec_list': {
        const { path = '.', mode = 'changes' } = args as { path?: string; mode?: 'changes' | 'specs' };
        const listCommand = new ListCommand();
        const output = await captureConsoleOutput(() => listCommand.execute(path, mode));
        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      }

      case 'openspec_show': {
        const { itemName, type, json = true, ...options } = args as any;
        const showCommand = new ShowCommand();
        
        // For JSON output, we need to capture it differently
        if (json) {
          const output = await captureConsoleOutput(() => 
            showCommand.execute(itemName, { type, json, noInteractive: true, ...options })
          );
          return {
            content: [
              {
                type: 'text',
                text: output,
              },
            ],
          };
        }
        
        const output = await captureConsoleOutput(() => 
          showCommand.execute(itemName, { type, json: false, noInteractive: true, ...options })
        );
        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      }

      case 'openspec_validate': {
        const { itemName, type, all, changes, specs, strict, json = true } = args as any;
        const validateCommand = new ValidateCommand();
        const output = await captureConsoleOutput(() => 
          validateCommand.execute(itemName, { type, all, changes, specs, strict, json, noInteractive: true })
        );
        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      }

      case 'openspec_archive': {
        const { changeName, yes = true, skipSpecs, validate = true } = args as any;
        const archiveCommand = new ArchiveCommand();
        const output = await captureConsoleOutput(() => 
          archiveCommand.execute(changeName, { yes, skipSpecs, noValidate: !validate })
        );
        return {
          content: [
            {
              type: 'text',
              text: output || 'Change archived successfully',
            },
          ],
        };
      }

      case 'openspec_update': {
        const { path = '.' } = args as { path?: string };
        const updateCommand = new UpdateCommand();
        const output = await captureConsoleOutput(() => updateCommand.execute(path));
        return {
          content: [
            {
              type: 'text',
              text: output || 'OpenSpec updated successfully',
            },
          ],
        };
      }

      case 'openspec_spec_list': {
        const { path = '.', json = true, long = true } = args as any;
        const listCommand = new ListCommand();
        const output = await captureConsoleOutput(() => 
          listCommand.execute(path, 'specs')
        );
        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      }

      case 'openspec_change_list': {
        const { path = '.', json = true, long = true } = args as any;
        const listCommand = new ListCommand();
        const output = await captureConsoleOutput(() => 
          listCommand.execute(path, 'changes')
        );
        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('OpenSpec MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
