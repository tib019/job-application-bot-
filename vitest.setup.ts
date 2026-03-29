import { vi } from 'vitest';

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn().mockReturnValue({ stop: vi.fn(), destroy: vi.fn() }),
    validate: vi.fn().mockReturnValue(true),
  },
  schedule: vi.fn().mockReturnValue({ stop: vi.fn(), destroy: vi.fn() }),
  validate: vi.fn().mockReturnValue(true),
}));
