const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const POPUP_STORAGE_PREFIX = 'yogananda:monastic-visit-popup';
export const POPUP_FREQUENCY_CONTENT_UPDATE = 'content_update';
export const POPUP_FREQUENCY_DAILY = 'daily';
export const POPUP_FREQUENCY_SESSION = 'session';

export function storageKeyFor(version, { frequency = POPUP_FREQUENCY_CONTENT_UPDATE, now = new Date() } = {}) {
  const normalisedVersion = String(version || 'default').trim() || 'default';
  const normalisedFrequency = normaliseFrequency(frequency);

  if (normalisedFrequency === POPUP_FREQUENCY_DAILY) {
    return `${POPUP_STORAGE_PREFIX}:${normalisedVersion}:daily:${dateStamp(now)}`;
  }

  if (normalisedFrequency === POPUP_FREQUENCY_SESSION) {
    return `${POPUP_STORAGE_PREFIX}:${normalisedVersion}:session`;
  }

  return `${POPUP_STORAGE_PREFIX}:${normalisedVersion}`;
}

export function shouldOpenPopup({
  version,
  storage,
  frequency = POPUP_FREQUENCY_CONTENT_UPDATE,
  now = new Date(),
} = {}) {
  try {
    return storage?.getItem(storageKeyFor(version, { frequency, now })) !== 'dismissed';
  } catch {
    return true;
  }
}

export function rememberPopupDismissal({
  version,
  storage,
  frequency = POPUP_FREQUENCY_CONTENT_UPDATE,
  now = new Date(),
} = {}) {
  try {
    storage?.setItem(storageKeyFor(version, { frequency, now }), 'dismissed');
  } catch {
    // Storage can fail in private browsing or strict privacy modes.
  }
}

export function setImageViewerExpanded({ viewer, trigger, expanded } = {}) {
  if (!viewer || !trigger) {
    return;
  }

  viewer.hidden = !expanded;
  viewer.setAttribute('aria-hidden', expanded ? 'false' : 'true');
  trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

export function initMonasticVisitPopup(
  root = globalThis.document,
  storage = globalThis.localStorage,
  sessionStorage = globalThis.sessionStorage,
) {
  const popup = root?.querySelector?.('[data-monastic-visit-popup]');

  if (!popup) {
    return null;
  }

  const version = popup.dataset.popupVersion;
  const frequency = normaliseFrequency(popup.dataset.popupFrequency || POPUP_FREQUENCY_DAILY);
  const dismissalStorage = storageForFrequency(frequency, storage, sessionStorage);

  if (!shouldOpenPopup({ version, frequency, storage: dismissalStorage })) {
    return null;
  }

  const documentElement = popup.ownerDocument;
  const dialog = popup.querySelector('[role="dialog"]');
  const closeControls = popup.querySelectorAll('[data-monastic-visit-popup-close]');
  const dismissControls = popup.querySelectorAll('[data-monastic-visit-popup-dismiss]');
  const imageViewerController = createImageViewerController({ popup, dialog });
  const previouslyFocused = documentElement.activeElement;

  if (!dialog) {
    return null;
  }

  function open() {
    popup.hidden = false;
    popup.setAttribute('aria-hidden', 'false');
    documentElement.body.classList.add('monastic-visit-popup-open');
    closeControls.forEach((control) => control.addEventListener('click', close));
    dismissControls.forEach((control) => control.addEventListener('click', close));
    imageViewerController.bind();
    documentElement.addEventListener('keydown', handleKeydown);
    focusFirstElement(dialog);
  }

  function close() {
    imageViewerController.unbind();
    popup.hidden = true;
    popup.setAttribute('aria-hidden', 'true');
    documentElement.body.classList.remove('monastic-visit-popup-open');
    closeControls.forEach((control) => control.removeEventListener('click', close));
    dismissControls.forEach((control) => control.removeEventListener('click', close));
    documentElement.removeEventListener('keydown', handleKeydown);
    rememberPopupDismissal({ version, frequency, storage: dismissalStorage });

    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      if (imageViewerController.isExpanded()) {
        imageViewerController.close();
        return;
      }

      close();
      return;
    }

    if (event.key === 'Tab') {
      trapFocus(event, imageViewerController.focusContainer());
    }
  }

  open();

  return { close };
}

function createImageViewerController({ popup, dialog }) {
  const trigger = popup.querySelector('[data-monastic-popup-image-trigger]');
  const viewer = popup.querySelector('[data-monastic-popup-image-viewer]');
  const panel = viewer?.querySelector('[role="dialog"]');
  const closeControls = viewer?.querySelectorAll('[data-monastic-popup-image-close]') || [];
  let expanded = false;

  function open() {
    if (!trigger || !viewer || !panel) {
      return;
    }

    expanded = true;
    setImageViewerExpanded({ viewer, trigger, expanded });
    dialog.setAttribute('aria-hidden', 'true');
    closeControls.forEach((control) => control.addEventListener('click', close));
    focusFirstElement(panel) || panel.focus();
  }

  function close({ restoreFocus = true } = {}) {
    if (!expanded || !trigger || !viewer) {
      return;
    }

    expanded = false;
    setImageViewerExpanded({ viewer, trigger, expanded });
    dialog.setAttribute('aria-hidden', 'false');
    closeControls.forEach((control) => control.removeEventListener('click', close));

    if (restoreFocus && typeof trigger.focus === 'function') {
      trigger.focus();
    }
  }

  return {
    bind() {
      trigger?.addEventListener('click', open);
    },
    close,
    focusContainer() {
      return expanded && panel ? panel : dialog;
    },
    isExpanded() {
      return expanded;
    },
    unbind() {
      close({ restoreFocus: false });
      trigger?.removeEventListener('click', open);
    },
  };
}

function normaliseFrequency(frequency) {
  if (
    frequency === POPUP_FREQUENCY_DAILY ||
    frequency === POPUP_FREQUENCY_SESSION ||
    frequency === POPUP_FREQUENCY_CONTENT_UPDATE
  ) {
    return frequency;
  }

  return POPUP_FREQUENCY_DAILY;
}

function storageForFrequency(frequency, localStorage, browserSessionStorage) {
  if (frequency === POPUP_FREQUENCY_SESSION) {
    return browserSessionStorage;
  }

  return localStorage;
}

function dateStamp(value) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function focusFirstElement(container) {
  const firstElement = getFocusableElements(container)[0];

  if (!firstElement) {
    return false;
  }

  firstElement.focus();
  return true;
}

function getFocusableElements(container) {
  const activeElement = container.ownerDocument.activeElement;

  return [...container.querySelectorAll(focusableSelector)].filter(
    (element) =>
      element.getAttribute('aria-hidden') !== 'true' &&
      (element.offsetParent !== null ||
        element === activeElement ||
        element.getClientRects().length > 0),
  );
}

export function trapFocus(event, dialog) {
  const focusableElements = getFocusableElements(dialog);

  if (focusableElements.length === 0) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = dialog.ownerDocument.activeElement;

  if (!focusableElements.includes(activeElement)) {
    event.preventDefault();
    (event.shiftKey ? lastElement : firstElement).focus();
    return;
  }

  if (event.shiftKey && activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}
