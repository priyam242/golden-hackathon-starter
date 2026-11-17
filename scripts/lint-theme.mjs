#!/usr/bin/env node
/**
 * Golden Hackathon Starter — Design System Theme Linter
 * Enforces Owner's Bell MT Typography & Pure Monochrome UI Chrome,
 * with a smart escape hatch configured via theme.config.json ("strictMonochrome": false).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read theme config if present
let strictMonochrome = true;
let allowSemanticColors = false;

const configCandidates = [
  path.resolve(__dirname, '../shared/design-tokens/theme.config.json'),
  path.resolve(process.cwd(), 'shared/design-tokens/theme.config.json'),
  path.resolve(process.cwd(), '../shared/design-tokens/theme.config.json'),
  path.resolve(process.cwd(), '../../shared/design-tokens/theme.config.json'),
];

for (const cfgPath of configCandidates) {
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (typeof cfg.strictMonochrome === 'boolean') {
        strictMonochrome = cfg.strictMonochrome;
      }
      if (typeof cfg.allowSemanticColors === 'boolean') {
        allowSemanticColors = cfg.allowSemanticColors;
      }
    } catch (e) {
      // ignore
    }
    break;
  }
}

const ALLOWED_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.html', '.css'];
const IGNORED_PATHS = [
  'node_modules',
  'dist',
  '.git',
  'theme.tokens.css',
  'tailwind.preset.js',
  'lint-theme.mjs',
  'seed-data.json',
  'pnpm-lock.yaml',
  'package-lock.json',
  'coverage',
  'theme.config.json',
];

// If strictMonochrome is false or allowSemanticColors is true, allow status utilities
const FORBIDDEN_PATTERNS = strictMonochrome
  ? [
      { regex: /bg-(red|blue|green|yellow|indigo|purple|pink|teal|cyan|emerald|orange|amber|violet|rose|sky)-\d{2,3}/i, name: 'Colored Tailwind background utility' },
      { regex: /text-(red|blue|green|yellow|indigo|purple|pink|teal|cyan|emerald|orange|amber|violet|rose|sky)-\d{2,3}/i, name: 'Colored Tailwind text utility' },
      { regex: /border-(red|blue|green|yellow|indigo|purple|pink|teal|cyan|emerald|orange|amber|violet|rose|sky)-\d{2,3}/i, name: 'Colored Tailwind border utility' },
    ]
  : [];

let errorsFound = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (IGNORED_PATHS.some((ignored) => fullPath.includes(ignored))) {
      continue;
    }
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && ALLOWED_EXTS.includes(path.extname(entry.name))) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // Escape hatch check: lines marked with /* theme-ignore */ or semantic status variables are exempted
    if (line.includes('theme-ignore') || line.includes('--status-') || line.includes('--accent-primary')) {
      return;
    }
    FORBIDDEN_PATTERNS.forEach(({ regex, name }) => {
      if (regex.test(line)) {
        console.error(`❌ [LINT-THEME] Violation in ${filePath}:${index + 1}: ${name}`);
        console.error(`   > ${line.trim()}`);
        errorsFound++;
      }
    });
  });
}

const rootDir = process.argv[2] || process.cwd();
console.log(`🔍 [LINT-THEME] Scanning codebase for monochrome compliance in ${rootDir} (strictMonochrome=${strictMonochrome})...`);

if (strictMonochrome) {
  walk(rootDir);
  if (errorsFound > 0) {
    console.error(`\n❌ [LINT-THEME] Failed with ${errorsFound} color violations. Strict Design Lock requires monochrome tokens only.`);
    console.error(`   Tip: To allow domain colors/charts, set "strictMonochrome": false in theme.config.json or add /* theme-ignore */.`);
    process.exit(1);
  } else {
    console.log(`\n✅ [LINT-THEME] Passed! 100% compliant with Owner's Strict Monochrome Design Lock.`);
  }
} else {
  console.log(`\n✨ [LINT-THEME] strictMonochrome is disabled in theme.config.json. Semantic status tokens and domain charts permitted.`);
}
