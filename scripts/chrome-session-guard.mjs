#!/usr/bin/env node

import { parseArgs } from 'node:util';
import {
  CHROME_LOCAL_STATE,
  ensureChromeAppExists,
  ensureMacOS,
  ensureSingleChromeMainInstance,
  listChromeMainInstances,
  normalizeMode,
  openWithDefaultProfile,
  openWithExplicitProfile,
  parseProfilesFromLocalState,
  printHelp,
  readLocalState,
  renderListWindowsAppleScript,
  renderProfiles,
  runAppleScript,
  validateUrl,
} from './lib/core.mjs';

function fail(message, code = 1) {
  console.error('STATUS=error');
  console.error(`MESSAGE=${message}`);
  process.exit(code);
}

async function handleOpen(argv) {
  ensureMacOS();

  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      mode: { type: 'string', short: 'm' },
      profile: { type: 'string', short: 'p' },
      help: { type: 'boolean', short: 'h' },
      force: { type: 'boolean' },
    },
  });

  if (values.help) {
    console.log(printHelp());
    return;
  }

  const url = positionals[1];
  if (!url) {
    fail('缺少 URL 参数。', 2);
  }

  validateUrl(url);
  const mode = normalizeMode(values.mode);
  const profile = values.profile?.trim();
  const force = Boolean(values.force);

  await ensureChromeAppExists();

  if (profile) {
    if (mode !== 'new-window') {
      fail('显式指定 --profile 时，当前版本只支持 --mode new-window。');
    }
    console.log(await openWithExplicitProfile(url, profile));
    return;
  }

  await ensureSingleChromeMainInstance({ force });
  console.log(await openWithDefaultProfile(url, mode));
}

async function handleListProfiles() {
  ensureMacOS();
  const localState = await readLocalState();
  const profiles = parseProfilesFromLocalState(localState);
  console.log(renderProfiles(profiles));
}

async function handleListWindows() {
  ensureMacOS();
  const instances = await listChromeMainInstances();
  if (instances.length > 1) {
    console.log(`WARNING=multiple-main-instances\nINSTANCE_COUNT=${instances.length}`);
  }
  console.log(await runAppleScript(renderListWindowsAppleScript()));
}

async function main() {
  try {
    const argv = process.argv.slice(2);
    const command = argv[0];

    if (!command || command === '--help' || command === '-h') {
      console.log(printHelp());
      return;
    }

    switch (command) {
      case 'open':
        await handleOpen(argv);
        return;
      case 'list-profiles':
        await handleListProfiles();
        return;
      case 'list-windows':
        await handleListWindows();
        return;
      default:
        fail(`未知命令：${command}`);
    }
  } catch (error) {
    if (error?.code === 'ENOENT' && String(error?.path).includes(CHROME_LOCAL_STATE)) {
      fail(`未找到 Chrome Local State：${CHROME_LOCAL_STATE}`);
    }

    fail(error instanceof Error ? error.message : String(error));
  }
}

await main();
