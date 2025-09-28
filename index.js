import express from 'express';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const port = argv.port || process.env.PORT || 7505;
const mcpServerPath = argv.mcp || argv['mcp-server'] || './mcp/build/index.js';

const app = express();
app.use(express.json());

// Store active MCP processes
const mcpProcesses = new Map();

// Function to create and manage MCP server process
function createMCPProcess(apiKey, sender, replyTo) {
    const args = [mcpServerPath];
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
        activeMCPProcesses: mcpProcesses.size,
        mcpServerPath: mcpServerPath
    });
});

// ...existing code...

app.listen(port, () => {
    console.log(`Express MCP Bridge running on port ${port}`);
    console.log(`Using MCP server: ${mcpServerPath}`);
    console.log('Available endpoints:');
    console.log('  GET  /health');
    console.log('  POST /send-email');
    console.log('  GET  /list-audiences');
    console.log('');
    console.log('Headers for configuration:');
    console.log('  x-api-key: Resend API key');
    console.log('  x-sender: Sender email address');
    console.log('  x-reply-to: Reply-to email address');
    console.log('');
    console.log('Command line arguments:');
    console.log('  --mcp <path>: Path to MCP server (default: /home/savaldev/Documents/projects/mcp-send-email/build/index.js)');
    console.log('  --port <port>: Port to run on (default: 7505)');
});