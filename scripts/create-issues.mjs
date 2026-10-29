// Creates the labels and one GitHub issue per backlog story (docs/backlog.json).
// Needs the GitHub CLI (https://cli.github.com) signed in with:  gh auth login
// Run from the repository root:  node scripts/create-issues.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const backlog = JSON.parse(readFileSync(new URL('../docs/backlog.json', import.meta.url), 'utf8'));
const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8' }).trim();

const labels = [
  ['priority: high', 'B60205'], ['priority: medium', 'FBCA04'], ['priority: low', '0E8A16'],
  ['application', '1D76DB'], ['devops', '5319E7'],
];
for (const [name, color] of labels) {
  try { gh('label', 'create', name, '--color', color, '--force'); } catch { /* already exists */ }
}

for (const s of backlog) {
  const title = `${s.id}: ${s.story.replace(/^As an? /, '').split(', I want')[0]} - ${s.story.split('I want ')[1].split(' so that')[0]}`.slice(0, 120);
  const body = `${s.story}\n\n**Priority:** ${s.priority} (rank ${s.rank} of ${backlog.length})\n**Type:** ${s.type}\n**Suggested branch:** \`${s.branch}\`\n\n**Acceptance criteria**\n- ${s.acceptance}\n`;
  const url = gh('issue', 'create', '--title', title, '--body', body,
    '--label', `priority: ${s.priority.toLowerCase()}`, '--label', s.type.toLowerCase().replace('application', 'application'));
  console.log(url);
}
console.log('\nDone. Next: add the issues to your GitHub Project board (see the evidence guide).');
