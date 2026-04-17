#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(name);
  if (index === -1 || index === args.length - 1) {
    return null;
  }
  return args[index + 1];
}

const partialPath = getArg('--partial');
const currentInfraPath = getArg('--current-infra');
const currentAppPath = getArg('--current-app');
const outputPath = getArg('--output');

if (!partialPath || !currentInfraPath || !currentAppPath || !outputPath) {
  console.error(
    'Usage: merge-release-artifacts.mjs --partial <file> --current-infra <file> --current-app <file> --output <file>',
  );
  process.exit(1);
}

const expectedImages = [
  'ghcr.io/seniorigor/ticketing-client',
  'ghcr.io/seniorigor/ticketing-auth',
  'ghcr.io/seniorigor/ticketing-tickets',
  'ghcr.io/seniorigor/ticketing-orders',
  'ghcr.io/seniorigor/ticketing-expiration',
  'ghcr.io/seniorigor/ticketing-payments',
  'ghcr.io/seniorigor/ticketing-event-bus-bootstrap',
];

const imageMap = new Map();

function collectFromRelease(path) {
  const content = readFileSync(path, 'utf8');
  const matches = content.matchAll(/image:\s*(ghcr\.io\/seniorigor\/ticketing-[^\s]+)/g);
  for (const match of matches) {
    const fullTag = match[1];
    const imageName = fullTag.split(':')[0];
    imageMap.set(imageName, fullTag);
  }
}

collectFromRelease(currentInfraPath);
collectFromRelease(currentAppPath);

const partial = JSON.parse(readFileSync(partialPath, 'utf8'));
for (const build of partial.builds ?? []) {
  imageMap.set(build.imageName, build.tag);
}

const builds = expectedImages.map((imageName) => {
  const tag = imageMap.get(imageName);
  if (!tag) {
    throw new Error(`Missing image reference for ${imageName}`);
  }
  return { imageName, tag };
});

writeFileSync(outputPath, JSON.stringify({ builds }, null, 2));
