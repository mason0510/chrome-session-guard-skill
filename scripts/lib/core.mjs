#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { homedir, platform } from 'node:os';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const SUPPORTED_MODES = new Set(['new-window', 'new-tab']);
export const CHROME_APP = 'Google Chrome';
export const CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const CHROME_LOCAL_STATE = path.join(
  homedir(),
  'Library',
  'Application Support',
  'Google',
  'Chrome',
  'Local State',
);

export function ensureMacOS() {
  if (platform() !== 'darwin') {
    throw new Error('当前版本仅支持 macOS。');
  }
}

export function validateUrl(url) {
  if (!/^https?:\/\//.test(url)) {
    throw new Error('URL 必须以 http:// 或 https:// 开头。');
  }
  return url;
}

export function normalizeMode(mode = 'new-window') {
  if (!SUPPORTED_MODES.has(mode)) {
    throw new Error('mode 只支持 new-window 或 new-tab。');
  }
  return mode;
}

export function escapeAppleScriptString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

export function buildProfileOpenArgs(profile, url) {
  return ['-na', CHROME_APP, '--args', `--profile-directory=${profile}`, '--new-window', url];
}

export function parseChromeMainInstances(psOutput) {
  return String(psOutput)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.includes(CHROME_EXECUTABLE))
    .filter((line) => !line.includes(' --type='))
    .map((line) => {
      const match = line.match(/^(\d+)\s+(.*)$/);
      if (!match) {
        return null;
      }
      return {
        pid: Number(match[1]),
        command: match[2],
      };
    })
    .filter(Boolean);
}

export async function listChromeMainInstances() {
  const { stdout } = await execFileAsync('ps', ['-ax', '-o', 'pid=,command=']);
  return parseChromeMainInstances(stdout);
}

export function renderMultiInstanceMessage(instances) {
  const lines = [
    '检测到多个 Google Chrome 主实例正在运行，默认复用当前/默认会话不可靠。',
    '请先关闭其他 Chrome 主实例后重试，或改用 --profile 显式指定。',
    '如你明确接受风险，可追加 --force 继续。',
    '检测到的主实例：',
    ...instances.map((instance) => `- PID ${instance.pid}: ${instance.command}`),
  ];
  return lines.join('\n');
}

export async function ensureSingleChromeMainInstance({ force = false } = {}) {
  const instances = await listChromeMainInstances();
  if (!force && instances.length > 1) {
    throw new Error(renderMultiInstanceMessage(instances));
  }
  return instances;
}

export function renderSessionOpenAppleScript(url, mode) {
  const safeUrl = escapeAppleScriptString(url);
  if (mode === 'new-tab') {
    return `
tell application "${CHROME_APP}"
  activate
  if (count of windows) = 0 then
    set newWindow to make new window
    delay 1
    set URL of active tab of newWindow to "${safeUrl}"
  else
    tell front window
      make new tab at end of tabs with properties {URL:"${safeUrl}"}
      set active tab index to (count of tabs)
    end tell
  end if
  delay 1
  set tabTitle to title of active tab of front window
  set tabUrl to URL of active tab of front window
  return "STATUS=ok" & linefeed & "MODE=new-tab" & linefeed & "URL=" & tabUrl & linefeed & "TITLE=" & tabTitle
end tell`.trim();
  }

  return `
tell application "${CHROME_APP}"
  activate
  if (count of windows) = 0 then
    set newWindow to make new window
    delay 1
    set URL of active tab of newWindow to "${safeUrl}"
  else
    set newWindow to make new window
    delay 1
    set URL of active tab of newWindow to "${safeUrl}"
  end if
  delay 1
  set tabTitle to title of active tab of front window
  set tabUrl to URL of active tab of front window
  return "STATUS=ok" & linefeed & "MODE=new-window" & linefeed & "URL=" & tabUrl & linefeed & "TITLE=" & tabTitle
end tell`.trim();
}

export function renderListWindowsAppleScript() {
  return `
tell application "System Events"
  if not (exists process "${CHROME_APP}") then
    return "WINDOW_COUNT=0"
  end if

  tell process "${CHROME_APP}"
    set outText to "WINDOW_COUNT=" & (count of windows) & linefeed
    set i to 1
    repeat with w in windows
      try
        set outText to outText & "INDEX=" & i & linefeed
        set outText to outText & "TITLE=" & (name of w) & linefeed
        set outText to outText & "---" & linefeed
      on error
        set outText to outText & "INDEX=" & i & linefeed
        set outText to outText & "TITLE=<无法读取标题>" & linefeed
        set outText to outText & "---" & linefeed
      end try
      set i to i + 1
    end repeat
    return outText
  end tell
end tell`.trim();
}

export async function runAppleScript(script) {
  const { stdout } = await execFileAsync('osascript', ['-e', script]);
  return stdout.trim();
}

export async function isChromeRunning() {
  const script = `
tell application "System Events"
  if exists process "${CHROME_APP}" then
    return "yes"
  end if
  return "no"
end tell`.trim();
  return (await runAppleScript(script)) === 'yes';
}

export async function readLocalState() {
  const content = await readFile(CHROME_LOCAL_STATE, 'utf8');
  return JSON.parse(content);
}

export function parseProfilesFromLocalState(localStateJson) {
  const profileBlock = localStateJson?.profile ?? {};
  const infoCache = profileBlock.info_cache ?? {};
  const lastUsed = profileBlock.last_used ?? '';

  return Object.entries(infoCache)
    .map(([profileKey, info]) => ({
      profileKey,
      name: info?.name ?? '',
      user: info?.user_name ?? '',
      isLastUsed: profileKey === lastUsed,
    }))
    .sort((a, b) => a.profileKey.localeCompare(b.profileKey, 'en', { numeric: true, sensitivity: 'base' }));
}

export function renderProfiles(profiles) {
  if (profiles.length === 0) {
    return 'PROFILE_COUNT=0';
  }

  const lines = [`PROFILE_COUNT=${profiles.length}`];
  for (const profile of profiles) {
    lines.push(
      [
        `PROFILE_KEY=${profile.profileKey}`,
        `NAME=${profile.name}`,
        `USER=${profile.user}`,
        `LAST_USED=${profile.isLastUsed ? 'yes' : 'no'}`,
      ].join('\t'),
    );
  }
  return lines.join('\n');
}

export async function ensureChromeAppExists() {
  await access(CHROME_EXECUTABLE, constants.X_OK);
  return CHROME_EXECUTABLE;
}

export async function openWithExplicitProfile(url, profile) {
  const args = buildProfileOpenArgs(profile, url);
  await execFileAsync('open', args);
  return ['STATUS=ok', 'OPEN_STYLE=explicit-profile', `PROFILE=${profile}`, `URL=${url}`].join('\n');
}

export async function openWithDefaultProfile(url, mode) {
  if (await isChromeRunning()) {
    return runAppleScript(renderSessionOpenAppleScript(url, mode));
  }

  await execFileAsync('open', ['-a', CHROME_APP, url]);
  return ['STATUS=ok', 'OPEN_STYLE=system-default', 'MODE=launch-default', `URL=${url}`].join('\n');
}

export function printHelp() {
  return `
Chrome Session Guard helper CLI

用法：
  chrome-session-guard open <URL> [--mode new-window|new-tab] [--profile <PROFILE_KEY>] [--force]
  chrome-session-guard list-profiles
  chrome-session-guard list-windows
  chrome-session-guard --help

说明：
  1. 默认不写死私人 profile，优先复用用户当前/默认 Chrome 会话。
  2. 显式指定 --profile 时，当前版本只支持 new-window。
  3. 若检测到多个 Chrome 主实例，默认模式会拒绝执行；可改用 --profile，或显式追加 --force。
  4. 当前版本仅支持 macOS + Google Chrome；但 --help 可在其他平台查看。

示例：
  chrome-session-guard open https://example.com
  chrome-session-guard open https://example.com --mode new-tab
  chrome-session-guard open https://example.com --profile "Default"
  chrome-session-guard open https://example.com --force
  chrome-session-guard list-profiles
  chrome-session-guard list-windows
`.trim();
}
