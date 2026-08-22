const { spawn } = require('node:child_process');
const path = require('node:path');

const core = path.join(__dirname, 'visual-ci-core.cjs');
const child = spawn(process.execPath, [core], {
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let sawFailure = false;
let finished = false;

child.stdout.on('data', (chunk) => process.stdout.write(chunk));
child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
  sawFailure = true;
  if (!finished) {
    setTimeout(() => {
      if (!finished) child.kill('SIGKILL');
    }, 150);
  }
});

const watchdog = setTimeout(() => {
  if (finished) return;
  sawFailure = true;
  process.stderr.write('VISUAL_CI_WATCHDOG_TIMEOUT=90s\n');
  child.kill('SIGKILL');
}, 90_000);

child.on('error', (error) => {
  sawFailure = true;
  process.stderr.write(`${error.stack || error}\n`);
});

child.on('exit', (code, signal) => {
  finished = true;
  clearTimeout(watchdog);
  if (sawFailure || code !== 0) {
    process.stderr.write(`VISUAL_CI_CORE_EXIT=${code ?? 'null'} SIGNAL=${signal || 'none'}\n`);
    process.exit(1);
  }
  process.stdout.write('VISUAL_CI_SUPERVISOR=PASS\n');
  process.exit(0);
});
