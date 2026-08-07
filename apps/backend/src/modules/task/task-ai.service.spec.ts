import { ConfigService } from '@nestjs/config';
import { TaskAiService } from './task-ai.service';

describe('TaskAiService', () => {
  let service: TaskAiService;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockImplementation((key: string, fallback?: unknown) => {
        if (key === 'AI_PROVIDER') return 'mock';
        return fallback;
      }),
    } as unknown as ConfigService;

    service = new TaskAiService(configService);
  });

  it('improves clarity in fix mode and adds a richer description in enhance mode', async () => {
    const fixResult = await service.improveTask({
      mode: 'fix',
      title: 'test',
      description: 'do thing',
    });

    expect(fixResult.title).toContain('Test');
    expect(fixResult.description.length).toBeGreaterThan(0);

    const enhanceResult = await service.improveTask({
      mode: 'enhance',
      title: 'Ship onboarding flow',
      description: '',
    });

    expect(enhanceResult.title).toContain('Ship');
    expect(enhanceResult.description).toContain('steps');
  });
});
