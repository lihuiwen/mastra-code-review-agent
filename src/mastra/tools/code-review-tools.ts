import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import type { ToolExecutionContext } from '@mastra/core/tools';

// 定义类型常量，确保类型安全
const IssueType = z.enum(['bug', 'performance', 'security', 'style', 'maintainability']);
type IssueTypeEnum = z.infer<typeof IssueType>;

const SeverityType = z.enum(['low', 'medium', 'high', 'critical']);
type SeverityEnum = z.infer<typeof SeverityType>;

export const analyzeCodeTool = createTool({
  id: 'analyze-code',
  description: 'Analyze code and identify potential issues, bugs, and improvements',
  inputSchema: z.object({
    code: z.string().describe('The code snippet to review'),
    language: z.string().describe('The programming language of the code (e.g. JavaScript, Python, Go)'),
    context: z.string().optional().describe('Additional context about the code (e.g. purpose, requirements)')
  }),
  outputSchema: z.object({
    issues: z.array(z.object({
      type: IssueType,
      description: z.string(),
      severity: SeverityType,
      lineNumbers: z.array(z.number()).optional(),
    })),
    strengths: z.array(z.string()),
    summary: z.string(),
  }),
  execute: async (
    context: ToolExecutionContext<z.ZodObject<{
      code: z.ZodString;
      language: z.ZodString;
      context: z.ZodOptional<z.ZodString>;
    }>>
  ) => {
    
    // 从context中获取输入参数
    const { code, language } = context.context;
    
    // 样本分析 - 在实际应用中，这可能由LLM或代码分析工具完成
    const codeLines = code.split('\n').length;
    const hasComments = code.includes('//') || code.includes('/*') || code.includes('#');
    const hasLongFunctions = code.includes('function') && code.length > 500;
    
    // 确保返回值类型严格匹配outputSchema
    return {
      issues: [
        {
          type: hasComments ? 'style' as IssueTypeEnum : 'maintainability' as IssueTypeEnum,
          description: hasComments 
            ? 'Good use of comments' 
            : 'Code lacks sufficient comments for clarity',
          severity: 'medium' as SeverityEnum,
        },
        hasLongFunctions ? {
          type: 'maintainability' as IssueTypeEnum,
          description: 'Consider breaking down long functions into smaller, more focused ones',
          severity: 'medium' as SeverityEnum,
        } : {
          type: 'style' as IssueTypeEnum,
          description: 'Good function length and organization',
          severity: 'low' as SeverityEnum,
        },
      ],
      strengths: [
        `Code is written in ${language}`,
        `Total of ${codeLines} lines makes it manageable`,
      ],
      summary: `This is ${codeLines > 100 ? 'a relatively large' : 'a concise'} ${language} code sample with ${hasComments ? 'good documentation' : 'room for improved documentation'}.`,
    };
  },
});

export const suggestImprovementsTool = createTool({
  id: 'suggest-improvements',
  description: 'Suggest specific improvements for the code based on identified issues',
  inputSchema: z.object({
    code: z.string().describe('The code to improve'),
    issues: z.array(z.object({
      type: z.string(),
      description: z.string(),
      severity: z.string(),
    })).describe('List of identified issues'),
    language: z.string().describe('The programming language of the code'),
  }),
  outputSchema: z.object({
    suggestions: z.array(z.object({
      issue: z.string(),
      improvement: z.string(),
      codeExample: z.string().optional(),
    })),
    refactoredCode: z.string().optional(),
  }),
  execute: async (
    context: ToolExecutionContext<z.ZodObject<{
      code: z.ZodString;
      issues: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        description: z.ZodString;
        severity: z.ZodString;
      }>>;
      language: z.ZodString;
    }>>
  ) => {
  

    // 从context中获取输入参数
    const { issues, language } = context.context;
    
    return {
      suggestions: issues.map(issue => ({
        issue: issue.description,
        improvement: `Consider addressing this ${issue.type} issue: ${issue.description}`,
        codeExample: `// Example improvement for ${language}\n// This would be generated specifically for the issue`,
      })),
      refactoredCode: `// This would be a refactored version of the original code\n// addressing the identified issues`,
    };
  },
});