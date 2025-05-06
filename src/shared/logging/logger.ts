export type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

function getTimestamp(): string {
  return new Date().toISOString();
}

function summarize(value: any, depth = 1): any {
  if (value === null || typeof value !== 'object') return value;
  if (depth === 0) {
    const typeName = value.constructor?.name || 'Object';
    const keys = Object.keys(value).length;
    return `[${typeName} object, ${keys} keys]`;
  }  

  if (Array.isArray(value)) {
    return value.map(v => summarize(v, depth - 1));
  }

  const summary: Record<string, any> = {
    _type: value.constructor?.name || 'Object'
  };

  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;

    const val = value[key];

    if (val instanceof HTMLElement) {
      summary[key] = `[HTMLElement: ${val.tagName}]`;
    } else if (val instanceof AudioContext || val instanceof AudioNode) {
      summary[key] = `[AudioNode]`;
    } else if (typeof val === 'function') {
      summary[key] = `[Function]`;
    } else if (typeof val === 'object') {
      try {
        summary[key] = summarize(val, depth - 1);
      } catch {
        summary[key] = `[Unserializable Object]`;
      }
    } else {
      summary[key] = val;
    }
  }

  return summary;
}

function safeSerialize(value: unknown): string {
  try {
    const summarized = summarize(value, 2);
    return JSON.stringify(summarized, null, 2);
  } catch (err) {
    return JSON.stringify({
      error: 'Could not serialize log payload',
      reason: (err as Error).message,
      type: typeof value
    }, null, 2);
  }
}

export function logMessage(
  message: string,
  data?: any,
  level: LogLevel = 'log'
): void {
  const timestamp = getTimestamp();
  const entry: Record<string, any> = {
    timestamp,
    level,
    message
  };

  if (data !== undefined) {
    entry.data = data;
  }

  const output = safeSerialize(entry);

  switch (level) {
    case 'warn':
      console.warn(output);
      break;
    case 'error':
      console.error(output);
      break;
    case 'info':
      console.info(output);
      break;
    case 'debug':
      console.debug(output);
      break;
    case 'log':
    default:
      console.log(output);
      break;
  }
}
