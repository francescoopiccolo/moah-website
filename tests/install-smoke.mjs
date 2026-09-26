import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = mkdtempSync(join(tmpdir(), 'moah-install-smoke-'));
let project;
const win = process.platform === 'win32';
function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd: project, env, encoding: 'utf8', shell: win, windowsHide: true, timeout: 300000, maxBuffer: 8 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw Error(`${command} failed: ${result.error ?? result.status}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
project = root;
const version = run('npm', ['view', 'moah-ai', 'version']).trim();
assert.match(version, /^\d+\.\d+\.\d+$/);
for (const manager of ['npm', 'pnpm', 'bun']) {
  project = join(root, `${manager}-project`);
  mkdirSync(project);
  const prefix = join(root, manager);
  const bin = manager === 'npm' ? (win ? prefix : join(prefix, 'bin')) : join(prefix, 'bin');
  mkdirSync(bin, { recursive: true });
  const env = { ...process.env, PATH: `${bin}${win ? ';' : ':'}${process.env.PATH}` };
  if (manager === 'npm') run('npm', ['install', '-g', '--prefix', prefix, '--no-audit', '--no-fund', 'moah-ai@latest'], env);
  if (manager === 'pnpm') {
    env.PNPM_HOME = prefix;
    run('pnpm', ['add', '-g', '--store-dir', join(prefix, 'store'), `moah-ai@${version}`], env);
  }
  if (manager === 'bun') {
    env.BUN_INSTALL_GLOBAL_DIR = join(prefix, 'global');
    env.BUN_INSTALL_BIN = bin;
    run('bun', ['add', '-g', 'moah-ai@latest'], env);
  }
  const launcher = ['moah', 'moah.cmd', 'moah.exe'].map(name => join(bin, name)).find(existsSync);
  assert.ok(launcher, `${manager}: global launcher missing at ${bin}`);
  assert.ok(run('moah', ['about'], env).includes(`MoAH ${version}`), `${manager}: wrong installed version`);
  run('moah', ['init'], env);
  run('moah', ['index'], env);
  assert.match(run('moah', ['pi', '--help'], env), /moah/i);
  console.log(`PASS ${manager}: global launcher, about, bundled runtime, init, index`);
}
