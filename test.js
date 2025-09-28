import axios from 'axios';

const API_URL = 'http://localhost:7504';
const API_KEY = 'render_api_key'; // Replace with your Resend API key

async function testHealthCheck() {
    try {
        const response = await axios.get(`${API_URL}/health`);
        console.log('Health Check:', response.data);
    } catch (error) {
        console.error('Health Check Failed:', error.message);
    }
}

async function testSendEmail() {
    try {
        const response = await axios.post(
            `${API_URL}/send-email`,
            {
                to: 'test@example.com',
                subject: 'Test Email',
                text: 'This is a test email'
            },
            {
                headers: {
                    'x-api-key': API_KEY
                }
            }
        );
        console.log('Send Email Response:', response.data);
    } catch (error) {
        console.error('Send Email Failed:', error.response?.data || error.message);
    }
}

async function testListAudiences() {
    try {
        const response = await axios.get(`${API_URL}/list-audiences`, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        console.log('List Audiences Response:', response.data);
    } catch (error) {
        console.error('List Audiences Failed:', error.response?.data || error.message);
    }
}

async function testMCPEndpoint() {
    try {
        const response = await axios.post(
            `${API_URL}/mcp`,
            {
                jsonrpc: '2.0',
                id: '1',
                method: 'tools/call',
                params: {
                    name: 'send-email',
                    arguments: {
                        to: 'test@example.com',
                        subject: 'Test from MCP endpoint',
                        text: 'This is a test email from the MCP endpoint'
                    }
                }
            },
            {
                headers: {
                    'x-api-key': API_KEY
                }
            }
        );
        console.log('MCP Endpoint Response:', response.data);
    } catch (error) {
        console.error('MCP Endpoint Failed:', error.response?.data || error.message);
    }
}

async function testMCPStreamingEndpoint() {
    try {
        const response = await fetch(`${API_URL}/mcp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: '2',
                method: 'tools/call',
                params: {
                    name: 'send-email',
                    arguments: {
                        to: 'test@example.com',
                        subject: 'Test Streaming',
                        text: 'This is a streaming test'
                    }
                }
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const text = decoder.decode(value);
            console.log('Streaming Response:', text);
        }
    } catch (error) {
        console.error('MCP Streaming Failed:', error);
    }
}

// Run all tests
async function runTests() {
    console.log('Starting Tests...\n');
    
    await testHealthCheck();
    console.log('\n-------------------\n');
    
    await testSendEmail();
    console.log('\n-------------------\n');
    
    await testListAudiences();
    console.log('\n-------------------\n');
    
    await testMCPEndpoint();
    console.log('\n-------------------\n');
    
    await testMCPStreamingEndpoint();
}

runTests().catch(console.error);