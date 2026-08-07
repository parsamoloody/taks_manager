import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TaskAiMode = 'fix' | 'enhance';

export interface ImproveTaskInput {
  mode: TaskAiMode;
  title?: string | null;
  description?: string | null;
}

export interface ImprovedTaskOutput {
  title: string;
  description: string;
  mode: TaskAiMode;
}

@Injectable()
export class TaskAiService {
  constructor(private readonly configService: ConfigService) {}

  async improveTask(input: ImproveTaskInput): Promise<ImprovedTaskOutput> {
    const mode = input.mode === 'enhance' ? 'enhance' : 'fix';
    const title = this.normalizeText(input.title);
    const description = this.normalizeText(input.description);

    try {
      const provider = this.configService?.get<string>('AI_PROVIDER', 'mock') ?? 'mock';
      if (provider === 'openai') {
        const key = this.configService?.get<string>('OPENAI_API_KEY');
        if (key) {
          return await this.requestOpenAi({ mode, title, description });
        }
      }
    } catch (error) {
      // Fall back to a deterministic local enhancement when the provider is unavailable.
      // eslint-disable-next-line no-console
      console.warn('Falling back to local task AI:', error);
    }

    return this.buildLocalImprovement({ mode, title, description });
  }

  private async requestOpenAi(input: ImproveTaskInput): Promise<ImprovedTaskOutput> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.configService?.get<string>('OPENAI_API_KEY') ?? ''}`,
      },
      body: JSON.stringify({
        model: this.configService?.get<string>('OPENAI_MODEL', 'gpt-4o-mini') ?? 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful task-writing assistant. Rewrite the task title and description in a concise, clear way. Return JSON with title and description fields only.',
          },
          {
            role: 'user',
            content: JSON.stringify(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    const parsed = JSON.parse(content) as Partial<ImprovedTaskOutput>;
    return {
      title: this.normalizeText(parsed.title) || this.normalizeText(input.title) || 'Untitled task',
      description: this.normalizeText(parsed.description) || this.buildDescriptionFromTitle(this.normalizeText(parsed.title) || this.normalizeText(input.title) || 'Untitled task', input.mode),
      mode: input.mode === 'enhance' ? 'enhance' : 'fix',
    };
  }

  private buildLocalImprovement(input: ImproveTaskInput): ImprovedTaskOutput {
    const mode = input.mode === 'enhance' ? 'enhance' : 'fix';
    const title = this.normalizeText(input.title) || 'Untitled task';
    const descriptionValue = this.normalizeText(input.description);

    if (mode === 'enhance') {
      const enhancedTitle = this.enhanceTitle(title);
      const enhancedDescription = descriptionValue
        ? this.expandDescription(descriptionValue, enhancedTitle)
        : this.buildDescriptionFromTitle(enhancedTitle, mode);

      return {
        title: enhancedTitle,
        description: enhancedDescription,
        mode,
      };
    }

    const fixedTitle = this.fixTitle(title);
    const fixedDescription = descriptionValue
      ? this.fixDescription(descriptionValue)
      : this.buildDescriptionFromTitle(fixedTitle, mode);

    return {
      title: fixedTitle,
      description: fixedDescription,
      mode,
    };
  }

  private normalizeText(value?: string | null) {
    return value?.replace(/\s+/g, ' ').trim() ?? '';
  }

  private fixTitle(title: string) {
    const cleaned = title.replace(/^\s*[-–:•]\s*/, '').trim();
    if (!cleaned) return 'Untitled task';
    const withoutTrailingPunctuation = cleaned.replace(/[.?!]+$/, '');
    return withoutTrailingPunctuation
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word.toLowerCase();
      })
      .join(' ');
  }

  private enhanceTitle(title: string) {
    const cleaned = this.fixTitle(title);
    if (cleaned === 'Untitled task') return 'Deliver a polished task outcome';
    return `${cleaned}`;
  }

  private fixDescription(description: string) {
    const cleaned = description.replace(/\s+/g, ' ').trim();
    if (!cleaned) return 'Define the concrete next step and confirm the expected outcome before moving forward.';
    return `Refine this task so the intent is clear: ${cleaned}. Focus on the next action, the expected outcome, and how success will be measured.`;
  }

  private expandDescription(description: string, title: string) {
    const cleaned = description.replace(/\s+/g, ' ').trim();
    if (!cleaned) {
      return this.buildDescriptionFromTitle(title, 'enhance');
    }

    return `${cleaned} Add a few practical steps, define success criteria, and note any dependencies or follow-up work.`;
  }

  private buildDescriptionFromTitle(title: string, mode: TaskAiMode) {
    if (mode === 'enhance') {
      return `Break this into clear steps, define the expected outcome, and note any key dependencies or follow-up work for ${title}.`;
    }

    return `Clarify the next action for ${title} and make the success criteria easy to verify.`;
  }
}
