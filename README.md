# The *unofficial* Resend MCP

This project was started with [xmcp](https://github.com/basementstudio/xmcp) (probably the best way to create an MCP).

This is not the official Resend MCP server, the offical one is [here](https://github.com/resend/mcp-send-email).

# Usage:

You can directly install this MCP server into your Cursor using this button:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=resend-mcp-remote&config=eyJ1cmwiOiJodHRwczovL3Jlc2VuZC5leG9uLmRldi9tY3AiLCJoZWFkZXJzIjp7InJlc2VuZC1hcGkta2V5IjoicmVzZW5kLWFwaS1rZXkifX0%3D)

Or you can manually install it by using this code snippet:

```json
{
  "mcpServers": {
    "resend-mcp-remote": {
      "url": "https://resend.exon.dev/mcp",
      "headers": {
        "resend-api-key": "your-api-key"
      }
    }
  }
}
```


# Project Structure

```
resend-mcp-remote/
├── src/
│   ├── prompts/
│   └── tools/
|       ├── create-contact.ts
|       ├── list-audiences.ts
|       └── send-email.ts
```

This project uses the structured approach where tools are automatically discovered from the `src/tools` directory. 

## Tool Breakdown

### Contact Creation inside a Resend Audience
`create-contact.ts`

Required Parameters (for AI):
- `email` (string): The email address of the contact
- `audienceId` (string): The audience ID where the contact will be created. You must have an audience ID to use this tool. If you don't have an audience ID, you MUST use the list-audiences tool to get all available audiences and then ask the user to select the audience they want to use.
- `firstName` (string): The first name of the contact
- `lastName` (string): The last name of the contact
- `unsubscribed` (boolean): The subscription status of the contact

### List All Audiences
`list-audiences.ts`

Required Parameters (for AI):
- None

### Send an Email
`send-email.ts`

Required Parameters (for AI):
- `to` (string): The recipient email address
- `subject` (string): The email subject line
- `text` (string): The plain text email content
- `from` (string): The sender email address
- `html` (string): The HTML email content
- `replyTo` (string): The email addresses for the email readers to reply to
- `scheduledAt` (string): The scheduled time for the email
- `cc` (string): The CC email addresses
- `bcc` (string): The BCC email addresses

<hr>
<br>
<br>

## Prompt Breakdown

### Node.js Setup
`nodejs-setup-resend.ts`

Required Parameters (for AI):
- None

This is a helpful installation prompt for the AI to use to instantly install the Resend SDK for Node.js. 

# Usage

# Original XMCP Docs 

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

This will start the MCP server with the selected transport method.

## Project Structure

This project uses the structured approach where tools are automatically discovered from the `src/tools` directory. Each tool is defined in its own file with the following structure:

```typescript
import { z } from "zod";
import { type InferSchema } from "xmcp";

// Define the schema for tool parameters
export const schema = {
  a: z.number().describe("First number to add"),
  b: z.number().describe("Second number to add"),
};

// Define tool metadata
export const metadata = {
  name: "add",
  description: "Add two numbers together",
  annotations: {
    title: "Add Two Numbers",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function add({ a, b }: InferSchema<typeof schema>) {
  return {
    content: [{ type: "text", text: String(a + b) }],
  };
}
```

## Adding New Tools

To add a new tool:

1. Create a new `.ts` file in the `src/tools` directory
2. Export a `schema` object defining the tool parameters using Zod
3. Export a `metadata` object with tool information
4. Export a default function that implements the tool logic

## Building for Production

To build your project for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This will compile your TypeScript code and output it to the `dist` directory.

## Running the Server

You can run the server for the transport built with:

- HTTP: `node dist/http.js`
- STDIO: `node dist/stdio.js`

Given the selected transport method, you will have a custom start script added to the `package.json` file.

For HTTP:

```bash
npm run start-http
# or
yarn start-http
# or
pnpm start-http
```

For STDIO:

```bash
npm run start-stdio
# or
yarn start-stdio
# or
pnpm start-stdio
```

## Learn More

- [xmcp Documentation](https://xmcp.dev/docs)
