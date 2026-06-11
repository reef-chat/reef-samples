#!/usr/bin/env node
/**
 * Publish each plugins/<slug>/ folder to its own github.com/reef-chat/reef-plugin-* repo.
 *
 * After reef-samples is retired, each reef-plugin-* repo is canonical; this script (or CI in
 * each repo) should push from that repo's working tree, not from the monorepo plugins/ folder.
 *
 * Prerequisites: GitHub CLI (`gh`) authenticated with repo create/push access.
 *
 * Dry run (default): prints commands only.
 *   node scripts/publish-plugin-repos.mjs
 *
 * Execute pushes:
 *   node scripts/publish-plugin-repos.mjs --execute
 *
 * After publish, verify in Reef: Settings → Plugins → Install → Remote → paste
 *   https://github.com/reef-chat/<reef-plugin-name>
 * Landing copy buttons use the same URLs (reef-landing src/lib/plugin-install-urls.ts).
 *
 * Single plugin:
 *   node scripts/publish-plugin-repos.mjs --slug example-prompt-concise --execute
 */
import { access, mkdtemp, cp, rm } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pluginsDir = path.join(root, 'plugins');

/** slug → GitHub repo name (reef-chat/<name>) */
export const SLUG_TO_REPO = {
  'starter-research': 'reef-plugin-starter-research',
  'example-skill-grocery': 'reef-plugin-skill-grocery',
  'example-skill-coding': 'reef-plugin-skill-coding',
  'example-prompt-concise': 'reef-plugin-prompt-concise',
  'example-prompt-personas': 'reef-plugin-prompt-personas',
  'example-tool-weather': 'reef-plugin-tool-weather',
  'example-tool-fetch-page': 'reef-plugin-tool-fetch-page',
  'example-dynamic-tools-inline': 'reef-plugin-dynamic-inline',
  'example-dynamic-tools-files': 'reef-plugin-dynamic-files',
  'example-lens-active-inference': 'reef-plugin-lens-active-inference',
  'example-voice-native': 'reef-plugin-voice-native',
  'example-profile-research': 'reef-plugin-profile-research',
};

const org = process.env.REEF_PLUGIN_ORG?.trim() || 'reef-chat';
const branch = process.env.REEF_PLUGIN_BRANCH?.trim() || 'main';
const execute = process.argv.includes('--execute');
const slugArg = process.argv.find((a, i) => process.argv[i - 1] === '--slug');

async function publishOne(slug, repoName) {
  const src = path.join(pluginsDir, slug);
  try {
    await access(src);
  } catch {
    console.warn(`Skip ${slug}: missing ${src}`);
    return;
  }

  const remote = `https://github.com/${org}/${repoName}.git`;
  const installUrl = `https://github.com/${org}/${repoName}`;

  if (!execute) {
    console.log(`# ${slug} → ${installUrl}`);
    console.log(`  gh repo create ${org}/${repoName} --public --source=. --push  # from exported copy`);
    return;
  }

  const work = await mkdtemp(path.join(tmpdir(), `reef-plugin-${slug}-`));
  try {
    await cp(src, work, { recursive: true });
    execSync('git init && git add . && git commit -m "Initial plugin"', {
      cwd: work,
      stdio: 'inherit',
    });
    try {
      execSync(`gh repo create ${org}/${repoName} --public --source=. --remote=origin --push`, {
        cwd: work,
        stdio: 'inherit',
      });
    } catch {
      execSync(`git remote add origin ${remote} 2>/dev/null || git remote set-url origin ${remote}`, {
        cwd: work,
        shell: true,
        stdio: 'inherit',
      });
      execSync(`git push -u origin HEAD:${branch}`, { cwd: work, stdio: 'inherit' });
    }
    console.log(`Published ${installUrl}`);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

const slugs = slugArg ? [slugArg] : Object.keys(SLUG_TO_REPO);

if (!execute) {
  console.log('Dry run — pass --execute to publish.\n');
}

for (const slug of slugs) {
  const repoName = SLUG_TO_REPO[slug];
  if (!repoName) {
    console.warn(`No repo mapping for slug: ${slug}`);
    continue;
  }
  await publishOne(slug, repoName);
}
