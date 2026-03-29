export function schedule(_expr: string, _cb: () => void) {
  return { stop: () => {}, destroy: () => {} };
}
export function validate(_expr: string): boolean {
  return true;
}
export default { schedule, validate };
