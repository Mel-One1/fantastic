import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

// NOTE on built-in AI permissions:
// On Chrome >= 138 the Prompt / Translator / Language Detector globals are
// generally available to extension pages with NO dedicated permission. Sources
// disagree on whether a "languageModel" permission is required. We ship without
// it. If, in a real Chrome, `LanguageModel`/`Translator`/`LanguageDetector` are
// `undefined` on extension pages while the on-device model is present, add
// "languageModel" (and/or "translator") to `permissions` below and reload.
export default defineManifest({
  manifest_version: 3,
  name: 'LinguaTab',
  description: pkg.description,
  version: pkg.version,
  minimum_chrome_version: '138',
  icons: {
    16: 'public/icons/icon-16.png',
    32: 'public/icons/icon-32.png',
    48: 'public/icons/icon-48.png',
    128: 'public/icons/icon-128.png',
  },
  action: {
    default_title: 'LinguaTab – open lesson panel',
    default_icon: {
      16: 'public/icons/icon-16.png',
      32: 'public/icons/icon-32.png',
      48: 'public/icons/icon-48.png',
      128: 'public/icons/icon-128.png',
    },
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'index.html',
  },
  permissions: ['sidePanel', 'storage', 'activeTab', 'scripting'],
  // Broad host access is required because the side panel extracts whatever
  // tab is active *when the user presses the button*. `activeTab` only covers
  // the tab that was focused at the moment the toolbar icon was clicked, so it
  // breaks as soon as the user switches tabs with the panel open.
  host_permissions: ['http://*/*', 'https://*/*'],
});
