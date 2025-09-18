// src/services/BraveMCPClient.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { OpenAI } from 'openai';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Client for interacting with the Brave Search MCP server using OpenAI
 */
export class BraveMCPClient {
    private mcp: Client;
    private openaiClient: OpenAI;
    private transport: StdioClientTransport | null = null;
    private model: string;
    private tools: any[] = [];

    constructor(model: string = "gpt-4o-mini") {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is not set");
        }

        this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
        this.openaiClient = new OpenAI({ apiKey });
        this.model = model;
    }

    /**
     * Connect to an MCP server script
     */
    async connectToServer(serverScriptPath: string) {
        try {
            const isJs = serverScriptPath.endsWith(".js");
            const isPy = serverScriptPath.endsWith(".py");
            if (!isJs && !isPy) {
                throw new Error("Server script must be a .js or .py file");
            }

            const command = isPy
                ? process.platform === "win32" ? "python" : "python3"
                : process.execPath;

            this.transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });

            this.mcp.connect(this.transport);

            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            }));

            console.log(
                "Connected to server with tools:",
                this.tools.map(({ name }) => name),
            );
        } catch (e) {
            logger.error("Failed to connect to MCP server:", e);
            throw e;
        }
    }

    /**
     * Get available MCP tools in OpenAI function format
     */
    async getMcpTools(): Promise<any[]> {
        const toolsResult = await this.mcp.listTools();
        return toolsResult.tools.map(tool => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));
    }

    /**
     * Process a query via OpenAI with MCP tool usage
     */
    async processQuery(query: string): Promise<string> {
        if (!this.transport) {
            throw new Error("MCP server not connected. Call connectToServer first.");
        }

        const tools = await this.getMcpTools();

        try {
            const response = await this.openaiClient.chat.completions.create({
                model: this.model,
                messages: [{ role: "user", content: query }],
                tools,
                tool_choice: "auto",
            });

            const assistantMessage = response.choices[0].message;
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: "user", content: query },
                assistantMessage,
            ];

            if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                for (const toolCall of assistantMessage.tool_calls) {
                    const result = await this.mcp.callTool({
                        name: toolCall.function.name,
                        arguments: JSON.parse(toolCall.function.arguments)
                    });

                    // Cast the result to access its content property
                    const typedResult = result as { content: Array<{ text: string }> };

                    messages.push({
                        role: "tool" as const,
                        tool_call_id: toolCall.id,
                        content: typedResult.content[0].text,
                    });
                }

                const finalResponse = await this.openaiClient.chat.completions.create({
                    model: this.model,
                    messages,
                    tools,
                    tool_choice: "none",
                });

                return finalResponse.choices[0].message.content ?? "";
            }

            return assistantMessage.content ?? "";
        } catch (error) {
            logger.error("Error processing query with Brave MCP:", error);
            throw error;
        }
    }

    /**
     * Clean up resources (e.g., disconnect transport)
     */
    async cleanup(): Promise<void> {
        try {
            if (this.transport) {
                await this.transport.close?.();
                this.transport = null;
                logger.info("Brave MCP Client resources cleaned up");
            }
        } catch (error) {
            logger.error("Error during cleanup:", error);
            throw error;
        }
    }
    // Add direct search method to bypass OpenAI processing for simple queries
    async directSearch(query: string, count: number = 10): Promise<string> {
        if (!this.transport) {
            throw new Error("MCP server not connected. Call connectToServer first.");
        }

        try {
            // Direct MCP tool call without OpenAI processing
            const result = await this.mcp.callTool({
                name: "brave_web_search",
                arguments: { query, count }
            });

            const typedResult = result as { content: Array<{ text: string }> };
            return typedResult.content[0].text;
        } catch (error) {
            logger.error("Error in direct search:", error);
            throw error;
        }
    }

    // Batch search method
    async batchSearch(queries: Array<{ query: string, count?: number }>): Promise<string[]> {
        const promises = queries.map(({ query, count = 10 }) => this.directSearch(query, count));
        return Promise.all(promises);
    }
}
