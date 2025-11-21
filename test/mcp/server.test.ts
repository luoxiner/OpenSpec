import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';

describe('MCP Server', () => {
  let serverProcess: ChildProcess | null = null;
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(tmpdir(), `openspec-mcp-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up server process
    if (serverProcess) {
      serverProcess.kill();
      serverProcess = null;
    }
    
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should start successfully', async () => {
    const serverPath = join(process.cwd(), 'bin', 'openspec-mcp-server.js');
    
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server did not start within 5 seconds'));
      }, 5000);

      serverProcess = spawn('node', [serverPath], {
        cwd: testDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stderrOutput = '';
      
      serverProcess.stderr?.on('data', (data: Buffer) => {
        stderrOutput += data.toString();
        if (stderrOutput.includes('OpenSpec MCP Server running on stdio')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      serverProcess.on('error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });

      serverProcess.on('exit', (code: number | null) => {
        if (code !== null && code !== 0) {
          clearTimeout(timeout);
          reject(new Error(`Server exited with code ${code}`));
        }
      });
    });
  });

  it('should respond to list tools request', async () => {
    const serverPath = join(process.cwd(), 'bin', 'openspec-mcp-server.js');
    
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server did not respond within 10 seconds'));
      }, 10000);

      serverProcess = spawn('node', [serverPath], {
        cwd: testDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdoutOutput = '';
      let serverReady = false;

      serverProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        if (output.includes('OpenSpec MCP Server running on stdio')) {
          serverReady = true;
          // Send list tools request
          const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {}
          };
          serverProcess?.stdin?.write(JSON.stringify(request) + '\n');
        }
      });

      serverProcess.stdout?.on('data', (data: Buffer) => {
        stdoutOutput += data.toString();
        
        // Look for JSON-RPC response
        try {
          const lines = stdoutOutput.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('{')) {
              const response = JSON.parse(line);
              if (response.id === 1 && response.result?.tools) {
                clearTimeout(timeout);
                
                // Verify we have the expected tools
                const toolNames = response.result.tools.map((t: any) => t.name);
                expect(toolNames).toContain('openspec_init');
                expect(toolNames).toContain('openspec_list');
                expect(toolNames).toContain('openspec_show');
                expect(toolNames).toContain('openspec_validate');
                expect(toolNames).toContain('openspec_archive');
                expect(toolNames).toContain('openspec_update');
                
                resolve();
                return;
              }
            }
          }
        } catch (error) {
          // Continue accumulating output
        }
      });

      serverProcess.on('error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });

      serverProcess.on('exit', (code: number | null) => {
        if (code !== null && code !== 0 && !serverReady) {
          clearTimeout(timeout);
          reject(new Error(`Server exited with code ${code} before responding`));
        }
      });
    });
  });

  it('should have correct tool schemas', async () => {
    const serverPath = join(process.cwd(), 'bin', 'openspec-mcp-server.js');
    
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server did not respond within 10 seconds'));
      }, 10000);

      serverProcess = spawn('node', [serverPath], {
        cwd: testDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdoutOutput = '';

      serverProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        if (output.includes('OpenSpec MCP Server running on stdio')) {
          // Send list tools request
          const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {}
          };
          serverProcess?.stdin?.write(JSON.stringify(request) + '\n');
        }
      });

      serverProcess.stdout?.on('data', (data: Buffer) => {
        stdoutOutput += data.toString();
        
        try {
          const lines = stdoutOutput.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('{')) {
              const response = JSON.parse(line);
              if (response.id === 1 && response.result?.tools) {
                clearTimeout(timeout);
                
                const tools = response.result.tools;
                
                // Check openspec_show tool schema
                const showTool = tools.find((t: any) => t.name === 'openspec_show');
                expect(showTool).toBeDefined();
                expect(showTool.inputSchema.properties.itemName).toBeDefined();
                expect(showTool.inputSchema.required).toContain('itemName');
                
                // Check openspec_validate tool schema
                const validateTool = tools.find((t: any) => t.name === 'openspec_validate');
                expect(validateTool).toBeDefined();
                expect(validateTool.inputSchema.properties.strict).toBeDefined();
                expect(validateTool.inputSchema.properties.json).toBeDefined();
                
                resolve();
                return;
              }
            }
          }
        } catch (error) {
          // Continue accumulating output
        }
      });

      serverProcess.on('error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  });
});
