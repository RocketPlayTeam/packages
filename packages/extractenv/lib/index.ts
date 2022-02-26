import { existsSync, readFileSync } from "fs";
import { join } from "path";

export const production = process.env.NODE_ENV === 'production';

const envMap: {
  [key: string]: Record<string, string>
} = {};

export function getEnv (dirname: string, maxIteration: number = 10, currentIteration: number = 0): Record<string, string> {
  const cached = envMap[dirname];
  if (cached && typeof cached === 'object') return cached;
  if (currentIteration >= maxIteration) return;
  const filePath = join(`${dirname}/${new Array(currentIteration).fill(0).map(i => '../').join('')}.env`);
  if (!existsSync(filePath)) return getEnv(dirname, maxIteration, currentIteration + 1);
  const file = readFileSync(filePath).toString();
  if (file.toUpperCase().includes('X-EXTRACTENV-IGNORE')) return getEnv(dirname, maxIteration, currentIteration + 1);
  const env = {};
  for (const line of file.split('\n')) {
    const [key, ...rest] = line.split('=');
    env[key] = rest.join('=').toString();
  }
  envMap[dirname] = env;
  return env;
}

export function extractEnv (key: string, defaultValue?: string, dirname: string = __dirname) {
  if (production) return process.env[key] ?? defaultValue;
  const env = getEnv(dirname);
  return env[key] ?? defaultValue;
}