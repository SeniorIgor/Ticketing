#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(name);
  if (index === -1 || index === args.length - 1) {
    return null;
  }
  return args[index + 1];
}

const base = getArg('--base');
const head = getArg('--head');

if (!base || !head) {
  console.error('Usage: select-release-images.mjs --base <git-ref> --head <git-ref>');
  process.exit(1);
}

const appImages = new Map([
  ['auth', 'ghcr.io/seniorigor/ticketing-auth'],
  ['client', 'ghcr.io/seniorigor/ticketing-client'],
  ['tickets', 'ghcr.io/seniorigor/ticketing-tickets'],
  ['orders', 'ghcr.io/seniorigor/ticketing-orders'],
  ['expiration', 'ghcr.io/seniorigor/ticketing-expiration'],
  ['payments', 'ghcr.io/seniorigor/ticketing-payments'],
  ['event-bus-bootstrap', 'ghcr.io/seniorigor/ticketing-event-bus-bootstrap'],
]);

const diffOutput = execFileSync('git', ['diff', '--name-only', base, head], {
  encoding: 'utf8',
}).trim();

const changedFiles = diffOutput ? diffOutput.split('\n').filter(Boolean) : [];

if (changedFiles.length === 0) {
  process.exit(0);
}

const fullBuildPrefixes = ['packages/', 'package.json', 'package-lock.json', 'nx.json', 'tsconfig.base.json'];

for (const file of changedFiles) {
  if (fullBuildPrefixes.some((prefix) => file === prefix || file.startsWith(prefix))) {
    for (const image of appImages.values()) {
      console.log(image);
    }
    process.exit(0);
  }
}

const selected = new Set();

for (const file of changedFiles) {
  const match = file.match(/^apps\/([^/]+)\//);
  if (!match) {
    continue;
  }

  const appName = match[1];
  const image = appImages.get(appName);
  if (image) {
    selected.add(image);
  }
}

for (const image of selected) {
  console.log(image);
}
