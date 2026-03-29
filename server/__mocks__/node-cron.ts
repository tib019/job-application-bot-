import { vi } from 'vitest';
export const schedule = vi.fn().mockReturnValue({ stop: vi.fn() });
export const validate = vi.fn().mockReturnValue(true);
export default { schedule, validate };
