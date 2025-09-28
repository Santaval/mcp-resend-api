import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
    email: z.string().email().describe('The email address of the contact'),
    audienceId: z.string().describe('The Audience ID where the contact will be created. You must have an audience ID to use this tool. If you don\'t have an audience ID, you MUST use the list-audiences tool to get all available audiences and then ask the user to select the audience they want to use.'),
    firstName: z.string().optional().describe('The first name of the contact'),
    lastName: z.string().optional().describe('The last name of the contact'),
    unsubscribed: z.boolean().optional().describe('The subscription status of the contact'),
};

export const metadata: ToolMetadata = {
    name: "create-contact",
    description: "Create a contact inside an audience in Resend, you must have an audience ID to use this tool. If you don't have an audience ID, you MUST use the list-audiences tool to get all available audiences and then ask the user to select the audience they want to use.",
    annotations: {
        title: "Create Contact",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
    },
};

export default async function createContact({ email, audienceId, firstName, lastName, unsubscribed }: InferSchema<typeof schema>) {
    const requestHeaders = headers();
    const apiKey = requestHeaders["resend-api-key"];
    
    if (!apiKey) {
        throw new Error('API key is required. Please provide resend-api-key header.');
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey as string);

    console.error(`Debug - Creating contact with email: ${email} in audience: ${audienceId}`);

    // Structure the request with all parameters
    const contactRequest: {
        email: string;
        audienceId: string;
        firstName?: string;
        lastName?: string;
        unsubscribed?: boolean;
    } = {
        email,
        audienceId,
    };

    // Add optional parameters conditionally
    if (firstName) {
        contactRequest.firstName = firstName;
    }

    if (lastName) {
        contactRequest.lastName = lastName;
    }

    if (unsubscribed !== undefined) {
        contactRequest.unsubscribed = unsubscribed;
    }

    console.error(`Contact request: ${JSON.stringify(contactRequest)}`);

    const response = await resend.contacts.create(contactRequest);

    if (response.error) {
        throw new Error(
            `Failed to create contact: ${JSON.stringify(response.error)}`,
        );
    }

    return `Contact created successfully! ${JSON.stringify(response.data)}`;
}
