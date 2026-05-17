import { Readability } from '@mozilla/readability';
import type { Article } from '../types/models';

export class ExtractionError extends Error {}

interface RawPage {
  html: string;
  url: string;
  title: string;
}

/** Injected into the active tab. Returns serialized DOM + metadata. */
function grabPage(): RawPage {
  return {
    html: document.documentElement.outerHTML,
    url: location.href,
    title: document.title,
  };
}

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab || tab.id == null) {
    throw new ExtractionError('Kein aktiver Tab gefunden.');
  }
  return tab;
}

/**
 * Pulls the current tab's HTML via scripting.executeScript, then runs Mozilla
 * Readability *here* in the side panel (DOM is available) so we never inject
 * a heavy parser into the page.
 */
export async function extractArticle(): Promise<Article> {
  const tab = await getActiveTab();

  let injected: RawPage;
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: grabPage,
    });
    injected = result.result as RawPage;
  } catch {
    throw new ExtractionError(
      'Diese Seite kann nicht gelesen werden (z. B. chrome:// oder Web Store).',
    );
  }

  const doc = new DOMParser().parseFromString(injected.html, 'text/html');
  const base = doc.createElement('base');
  base.href = injected.url;
  doc.head.appendChild(base);

  const parsed = new Readability(doc).parse();
  const text = parsed?.textContent?.trim() ?? '';

  if (!parsed || text.length < 200) {
    throw new ExtractionError(
      'Auf dieser Seite wurde kein lesbarer Artikel gefunden.',
    );
  }

  return {
    title: parsed.title || injected.title || injected.url,
    textContent: text,
    url: injected.url,
  };
}
