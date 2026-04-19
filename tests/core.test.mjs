import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildProfileOpenArgs,
  normalizeMode,
  parseChromeMainInstances,
  parseProfilesFromLocalState,
  renderMultiInstanceMessage,
  renderProfiles,
  renderSessionOpenAppleScript,
  validateUrl,
} from '../scripts/lib/core.mjs';

test('validateUrl 接受 http/https', () => {
  assert.equal(validateUrl('https://example.com'), 'https://example.com');
  assert.equal(validateUrl('http://example.com'), 'http://example.com');
});

test('validateUrl 拒绝非 http/https', () => {
  assert.throws(() => validateUrl('chrome://newtab/'), /URL 必须以/);
});

test('normalizeMode 校验 mode', () => {
  assert.equal(normalizeMode('new-window'), 'new-window');
  assert.equal(normalizeMode('new-tab'), 'new-tab');
  assert.throws(() => normalizeMode('current-tab'), /mode 只支持/);
});

test('buildProfileOpenArgs 构造显式 profile 启动参数', () => {
  const args = buildProfileOpenArgs('Profile 3', 'https://example.com');
  assert.deepEqual(args, [
    '-na',
    'Google Chrome',
    '--args',
    '--profile-directory=Profile 3',
    '--new-window',
    'https://example.com',
  ]);
});

test('renderSessionOpenAppleScript 生成 new-window 脚本', () => {
  const script = renderSessionOpenAppleScript('https://example.com', 'new-window');
  assert.match(script, /make new window/);
  assert.match(script, /MODE=new-window/);
});

test('renderSessionOpenAppleScript 生成 new-tab 脚本', () => {
  const script = renderSessionOpenAppleScript('https://example.com', 'new-tab');
  assert.match(script, /make new tab/);
  assert.match(script, /MODE=new-tab/);
});

test('parseChromeMainInstances 只保留主实例，过滤 helper 进程', () => {
  const instances = parseChromeMainInstances(`
    1024 /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
    1030 /Applications/Google Chrome.app/Contents/MacOS/Google Chrome --type=renderer --lang=zh-CN
    14556 /Applications/Google Chrome.app/Contents/MacOS/Google Chrome --user-data-dir=/Users/demo/.codex/chrome-debug --remote-debugging-port=9222
  `);

  assert.equal(instances.length, 2);
  assert.equal(instances[0].pid, 1024);
  assert.match(instances[1].command, /remote-debugging-port=9222/);
});

test('renderMultiInstanceMessage 输出多实例保护提示', () => {
  const message = renderMultiInstanceMessage([
    { pid: 1024, command: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' },
    { pid: 14556, command: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --user-data-dir=/tmp/chrome-debug --remote-debugging-port=9222' },
  ]);

  assert.match(message, /多个 Google Chrome 主实例/);
  assert.match(message, /--force/);
  assert.match(message, /PID 14556/);
});

test('parseProfilesFromLocalState 解析 profiles 与 last_used', () => {
  const profiles = parseProfilesFromLocalState({
    profile: {
      last_used: 'Profile 7',
      info_cache: {
        Default: { name: '个人', user_name: '' },
        'Profile 7': { name: '工作', user_name: 'work@example.com' },
      },
    },
  });

  assert.equal(profiles.length, 2);
  assert.equal(profiles[1].profileKey, 'Profile 7');
  assert.equal(profiles[1].isLastUsed, true);
});

test('renderProfiles 输出可扫读文本', () => {
  const output = renderProfiles([
    { profileKey: 'Default', name: '个人', user: '', isLastUsed: false },
    { profileKey: 'Profile 7', name: '工作', user: 'work@example.com', isLastUsed: true },
  ]);

  assert.match(output, /PROFILE_COUNT=2/);
  assert.match(output, /PROFILE_KEY=Profile 7/);
  assert.match(output, /LAST_USED=yes/);
});
