export interface D1PreparedStatementBinding {
  bind(...values: Array<string | number | null>): D1PreparedStatementBinding;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: unknown }>;
}

export interface D1DatabaseBinding {
  prepare(query: string): D1PreparedStatementBinding;
}
