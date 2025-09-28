import express from 'express';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import minimist from 'minimist';
import dotenv from 'dotenv';

dotenv.config();
const argv = minimist(process.argv.slice(2));
const port = argv.port || process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Store active MCP processes
const mcpProcesses = new Map();

// Function to create and manage MCP server process
function createMCPProcess(apiKey, sender, replyTo) {
    const args = [process.env.MCP_SERVER_PATH || 'build/index.js'];
    if (apiKey) args.push('--key', apiKey);
    if (sender) args.push('--sender', sender);
    if (replyTo) {
        if (Array.isArray(replyTo)) {
            replyTo.forEach(email => args.push('--reply-to', email));
        } else {
            args.push('--reply-to', replyTo);
        }
    }

    const child = spawn('node', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
    });

    const processId = uuidv4();
    
    const mcpClient = {
        id: processId,
        process: child,
        send: (message) => {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('MCP request timeout'));
                }, 30000);

                const messageHandler = (data) => {
                    try {
                        const response = JSON.parse(data.toString());
                        clearTimeout(timeout);
                        child.stdout.off('data', messageHandler);
                        resolve(response);
                    } catch (err) {
                        // Continue listening for more data
                    }
                };

                child.stdout.on('data', messageHandler);
                child.stdin.write(JSON.stringify(message) + '\n');
            });
        }
    };

    mcpProcesses.set(processId, mcpClient);

    child.on('error', (err) => {
        console.error('MCP process error:', err);
        mcpProcesses.delete(processId);
    });

    child.on('exit', (code) => {
        console.log(`MCP process ${processId} exited with code ${code}`);
        mcpProcesses.delete(processId);
    });

    return mcpClient;
}

// Get or create MCP process for request
function getMCPProcess(req) {
    const apiKey = req.headers['x-api-key'] || process.env.RESEND_API_KEY;
    const sender = req.headers['x-sender'] || process.env.SENDER_EMAIL_ADDRESS;
    const replyTo = req.headers['x-reply-to'] || process.env.REPLY_TO_EMAIL_ADDRESSES?.split(',');
    
    if (!apiKey) {
        throw new Error('API key required');
    }

    // For simplicity, create a new process for each request
    // In production, you might want to pool/reuse processes
    return createMCPProcess(apiKey, sender, replyTo);
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'express-mcp-bridge',
        version: '1.0.0',
        activeMCPProcesses: mcpProcesses.size
    });
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
    try {
        const mcpClient = getMCPProcess(req);
        
        const mcpRequest = {
            jsonrpc: '2.0',
            id: uuidv4(),
            method: 'tools/call',
            params: {
                name: 'send-email',
                arguments: req.body
            }
        };

        console.log('Sending MCP request:', JSON.stringify(mcpRequest, null, 2));
        
        const response = await mcpClient.send(mcpRequest);
        
        // Clean up process
        mcpClient.process.kill();
        mcpProcesses.delete(mcpClient.id);

        if (response.error) {
            return res.status(400).json({
                error: 'MCP server error',
                details: response.error
            });
        }

        res.json({
            success: true,
            data: response.result
        });

    } catch (error) {
        console.error('Error calling MCP server:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// List audiences endpoint
app.get('/list-audiences', async (req, res) => {
    try {
        const mcpClient = getMCPProcess(req);
        
        const mcpRequest = {
            jsonrpc: '2.0',
            id: uuidv4(),
            method: 'tools/call',
            params: {
                name: 'list-audiences',
                arguments: {}
            }
        };

        console.log('Sending MCP request:', JSON.stringify(mcpRequest, null, 2));
        
        const response = await mcpClient.send(mcpRequest);
        
        // Clean up process
        mcpClient.process.kill();
        mcpProcesses.delete(mcpClient.id);

        if (response.error) {
            return res.status(400).json({
                error: 'MCP server error',
                details: response.error
            });
        }

        res.json({
            success: true,
            data: response.result
        });

    } catch (error) {
        console.error('Error calling MCP server:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Generic MCP endpoint for n8n compatibility
app.post('/mcp', async (req, res) => {
    let mcpClient;
    
    try {
        if (!req.body.jsonrpc || req.body.jsonrpc !== '2.0') {
            return res.status(400).json({
                error: 'Invalid JSON-RPC request'
            });
        }

        mcpClient = getMCPProcess(req);
        
        // Forward the JSON-RPC request directly
        const mcpRequest = req.body;
        
        console.log('Forwarding MCP request:', JSON.stringify(mcpRequest, null, 2));

        // Set up SSE for streaming responses
        if (req.headers.accept === 'text/event-stream') {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Handle stream data
            const streamHandler = (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    res.write(`data: ${JSON.stringify(response)}\n\n`);
                } catch (err) {
                    // Continue listening for valid JSON
                }
            };

            mcpClient.process.stdout.on('data', streamHandler);

            // Handle client disconnect
            req.on('close', () => {
                mcpClient.process.stdout.off('data', streamHandler);
                mcpClient.process.kill();
                mcpProcesses.delete(mcpClient.id);
            });

            // Send the request
            mcpClient.process.stdin.write(JSON.stringify(mcpRequest) + '\n');
        } else {
            // Regular JSON-RPC request/response
            const response = await mcpClient.send(mcpRequest);
            
            // Clean up process
            mcpClient.process.kill();
            mcpProcesses.delete(mcpClient.id);

            res.json(response);
        }
    } catch (error) {
        console.error('Error in MCP endpoint:', error);
        
        // Clean up process if it exists
        if (mcpClient) {
            mcpClient.process.kill();
            mcpProcesses.delete(mcpClient.id);
        }

        res.status(500).json({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Internal server error',
                data: error.message
            },
            id: req.body.id
        });
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Endpoint ${req.method} ${req.path} not found`
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down Express server...');
    mcpProcesses.forEach(client => {
        client.process.kill();
    });
    process.exit(0);
});

app.listen(port, () => {
    console.log(`Express MCP Bridge running on port ${port}`);
    console.log('Available endpoints:');
    console.log('  GET  /health');
    console.log('  POST /send-email');
    console.log('  GET  /list-audiences');
    console.log('');
    console.log('Headers for configuration:');
    console.log('  x-api-key: Resend API key');
    console.log('  x-sender: Sender email address');
    console.log('  x-reply-to: Reply-to email address');
});