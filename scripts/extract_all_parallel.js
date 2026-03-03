// @ts-nocheck
/* global require, process */
const path = require('path');
const { spawn } = require('child_process');

const repoRoot = process.cwd();

const TASKS = [
  { key: 'sr', file: 'extract_serbian.js' },
  { key: 'fa', file: 'extract_farsi.js' },
  { key: 'af', file: 'extract_afrikaans.js' },
  { key: 'hi', file: 'extract_hindi.js' },
  { key: 'bn', file: 'extract_bengali.js' },
  { key: 'id', file: 'extract_indonesian.js' },
  { key: 'ur', file: 'extract_urdu.js' },
  { key: 'fr', file: 'extract_french.js' },
];

const maxConcurrency = Math.max(
  1,
  Math.min(
    TASKS.length,
    Number(process.env.EXTRACT_MAX_CONCURRENCY || 3) || 3
  )
);

function prefixLines(stream, prefix) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += String(chunk);
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.trim().length) {
        process.stdout.write(`[${prefix}] ${line}\n`);
      }
    }
  });
  stream.on('end', () => {
    if (buffer.trim().length) {
      process.stdout.write(`[${prefix}] ${buffer}\n`);
    }
  });
}

function runTask(task) {
  return new Promise((resolve) => {
    const scriptPath = path.join(repoRoot, 'scripts', task.file);
    const child = spawn(process.execPath, [scriptPath], {
      cwd: repoRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    prefixLines(child.stdout, task.key);
    prefixLines(child.stderr, `${task.key}:err`);

    child.on('close', (code) => {
      resolve({ task: task.key, code: Number(code || 0) });
    });
  });
}

(async () => {
  process.stdout.write(`Running ${TASKS.length} extractors (parallel=${maxConcurrency})...\n`);

  const queue = TASKS.slice();
  const active = new Set();
  const results = [];

  async function scheduleNext() {
    if (!queue.length) return;
    const task = queue.shift();
    if (!task) return;

    const p = runTask(task).then((result) => {
      results.push(result);
      active.delete(p);
    });

    active.add(p);
  }

  while (queue.length || active.size) {
    while (queue.length && active.size < maxConcurrency) {
      await scheduleNext();
    }
    if (active.size) {
      await Promise.race(active);
    }
  }

  const failed = results.filter((r) => r.code !== 0);
  if (failed.length) {
    process.stdout.write(`\nFailed extractors: ${failed.map((f) => `${f.task}(${f.code})`).join(', ')}\n`);
    process.exit(1);
  }

  process.stdout.write('\nAll extractors completed successfully.\n');
})();
