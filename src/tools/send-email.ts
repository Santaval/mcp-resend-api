import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
    to: z.string().email().describe('Recipient email address'),
    subject: z.string().describe('Email subject line'),
    text: z.string().describe('Plain text email content'),
    from: z
        .string()
        .email()
        .nonempty()
        .optional()
        .describe(
            'Sender email address. You MUST ask the user for this parameter. Under no circumstance provide it yourself. If the user doesn\'t provide a sender email address, you can use `onboarding@resend.dev`',
        ),
    html: z
        .string()
        .optional()
        .describe(
            'HTML email content, only do this if you need special formatting or the user asks for it.',
        ),
    cc: z
        .string()
        .email()
        .array()
        .optional()
        .describe(
            'Optional array of CC email addresses. You MUST ask the user for this parameter. Under no circumstance provide it yourself',
        ),
    bcc: z
        .string()
        .email()
        .array()
        .optional()
        .describe(
            'Optional array of BCC email addresses. You MUST ask the user for this parameter. Under no circumstance provide it yourself',
        ),
    replyTo: z
        .string()
        .email()
        .array()
        .optional()
        .describe(
            'Optional email addresses for the email readers to reply to. You MUST ask the user for this parameter. Under no circumstance provide it yourself',
        ),
    scheduledAt: z
        .string()
        .optional()
        .describe(
            "Optional parameter to schedule the email. This uses natural language. Examples would be 'tomorrow at 10am' or 'in 2 hours' or 'next day at 9am PST' or 'Friday at 3pm ET'.",
        ),
};

export const metadata: ToolMetadata = {
    name: "send-email",
    description: "Send an email using Resend",
    annotations: {
        title: "Send Email",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
    },
};

export default async function sendEmail({ from, to, subject, text, html, replyTo, scheduledAt, cc, bcc }: InferSchema<typeof schema>) {
    const requestHeaders = headers();
    const apiKey = requestHeaders["resend-api-key"];
    
    if (!apiKey) {
        throw new Error('API key is required. Please provide resend-api-key header.');
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey as string);

    console.error(`Debug - Sending email with from: ${from}`);

    // Explicitly structure the request with all parameters to ensure they're passed correctly
    const emailRequest: {
        to: string;
        subject: string;
        text: string;
        from: string;
        replyTo?: string[];
        html?: string;
        scheduledAt?: string;
        cc?: string[];
        bcc?: string[];
    } = {
        to,
        subject,
        text,
        from: from ?? 'Resend MCP <onboarding@resend.dev>',
    };

    // Add optional parameters conditionally
    if (replyTo) {
        emailRequest.replyTo = replyTo;
    }

    // Add optional parameters conditionally
    if (html) {
        emailRequest.html = html;
    }

    if (scheduledAt) {
        emailRequest.scheduledAt = scheduledAt;
    }

    if (cc) {
        emailRequest.cc = cc;
    }

    if (bcc) {
        emailRequest.bcc = bcc;
    }

    console.error(`Email request: ${JSON.stringify(emailRequest)}`);

    const response = await resend.emails.send(emailRequest);

    if (response.error) {
        throw new Error(
            `Email failed to send: ${JSON.stringify(response.error)}`,
        );
    }

    return `Email sent successfully! ${JSON.stringify(response.data)}`;
}
