import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';
import { STATUS_MESSAGES, ERROR_MESSAGES } from '../constants.js';

const analyzeArgsSchema = z.object({
  prompt: z.string().min(1).describe("Analysis request. Use @ syntax to include files (e.g., '@src/main.ts explain the architecture')"),
  model: z.string().optional().describe("Optional model to use (e.g., 'gemini-2.5-flash'). If not specified, uses the default model."),
});

export const analyzeTool: UnifiedTool = {
  name: "analyze",
  description: "Read-only code analysis using Gemini. Available in plan mode. Use for code review, architecture analysis, impact assessment, and general research. Lightweight alternative to ask-gemini without sandbox or changeMode options.",
  zodSchema: analyzeArgsSchema,
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  prompt: {
    description: "Analyze code or answer questions using Gemini AI in read-only mode.",
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const { prompt, model } = args;
    if (!prompt?.trim()) {
      throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
    }

    const result = await executeGeminiCLI(
      prompt as string,
      model as string | undefined,
      false,
      false,
      onProgress
    );

    return `${STATUS_MESSAGES.GEMINI_RESPONSE}\n${result}`;
  }
};
