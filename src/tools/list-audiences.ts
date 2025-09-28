import { type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {};

export const metadata: ToolMetadata = {
    name: "list-audiences",
    description: "List all audiences from Resend. This tool is useful for getting the audience ID to help the user find the audience they want to use for other tools. If you need an audience ID, you MUST use this tool to get all available audiences and then ask the user to select the audience they want to use.",
    annotations: {
        title: "List Audiences",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
    },
};

export default async function listAudiences() {
    const requestHeaders = headers();
    const apiKey = requestHeaders["resend-api-key"];
    
    if (!apiKey) {
        throw new Error('API key is required. Please provide resend-api-key header.');
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey as string);

    console.error('Debug - Listing audiences');

    const response = await resend.audiences.list();

    if (response.error) {
        throw new Error(
            `Failed to list audiences: ${JSON.stringify(response.error)}`,
        );
    }

    return `Audiences found: ${JSON.stringify(response.data)}`;
}
