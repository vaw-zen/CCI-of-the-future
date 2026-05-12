'use client';

import { useEffect, useId, useMemo, useRef } from 'react';
import { lenisRef } from '@/utils/initializer/initializer.func';
import styles from './AdminModalShell.module.css';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
}

let activeScrollLocks = 0;
let scrollLockSnapshot = null;

function lockDocumentScroll() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  activeScrollLocks += 1;
  if (activeScrollLocks > 1) {
    return;
  }

  const documentElement = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY || documentElement.scrollTop || body.scrollTop || 0;
  const scrollbarWidth = Math.max(0, window.innerWidth - documentElement.clientWidth);

  scrollLockSnapshot = {
    scrollY,
    documentElementOverflow: documentElement.style.overflow,
    documentElementOverscrollBehavior: documentElement.style.overscrollBehavior,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
    bodyOverscrollBehavior: body.style.overscrollBehavior
  };

  documentElement.style.overflow = 'hidden';
  documentElement.style.overscrollBehavior = 'none';
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overscrollBehavior = 'none';

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }

  if (typeof lenisRef.current?.stop === 'function') {
    lenisRef.current.stop();
  }
}

function unlockDocumentScroll() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  activeScrollLocks = Math.max(0, activeScrollLocks - 1);
  if (activeScrollLocks > 0) {
    return;
  }

  const documentElement = document.documentElement;
  const body = document.body;
  const snapshot = scrollLockSnapshot;

  if (snapshot) {
    documentElement.style.overflow = snapshot.documentElementOverflow;
    documentElement.style.overscrollBehavior = snapshot.documentElementOverscrollBehavior;
    body.style.overflow = snapshot.bodyOverflow;
    body.style.position = snapshot.bodyPosition;
    body.style.top = snapshot.bodyTop;
    body.style.left = snapshot.bodyLeft;
    body.style.right = snapshot.bodyRight;
    body.style.width = snapshot.bodyWidth;
    body.style.paddingRight = snapshot.bodyPaddingRight;
    body.style.overscrollBehavior = snapshot.bodyOverscrollBehavior;
    window.scrollTo(0, snapshot.scrollY);
  }

  scrollLockSnapshot = null;

  if (typeof lenisRef.current?.start === 'function') {
    lenisRef.current.start();
  }
}

export default function AdminModalShell({
  isOpen,
  onClose,
  title,
  subtitle = '',
  eyebrow = '',
  headerMeta = null,
  headerActions = null,
  footer = null,
  children,
  size = 'default',
  initialFocusRef = null,
  closeLabel = 'Fermer la fenêtre',
  bodyClassName = '',
  contentClassName = ''
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);

  const dialogClassName = useMemo(() => {
    if (size === 'sm') {
      return `${styles.dialog} ${styles.dialogSm}`;
    }

    if (size === 'lg') {
      return `${styles.dialog} ${styles.dialogLg}`;
    }

    return styles.dialog;
  }, [size]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    lockDocumentScroll();

    const focusTarget = initialFocusRef?.current;
    const dialogElement = dialogRef.current;

    const focusDialog = () => {
      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus();
        return;
      }

      const [firstFocusable] = getFocusableElements(dialogElement);
      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus();
        return;
      }

      dialogElement?.focus();
    };

    const frameId = window.requestAnimationFrame(focusDialog);

    const handleKeyDown = (event) => {
      if (!dialogElement) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(dialogElement);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogElement.focus();
        return;
      }

      const activeElement = document.activeElement;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (activeElement === firstElement || activeElement === dialogElement) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      unlockDocumentScroll();
      document.removeEventListener('keydown', handleKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [initialFocusRef, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={() => onClose?.()}>
      <div
        ref={dialogRef}
        className={`${dialogClassName} ${contentClassName}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? descriptionId : undefined}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            {title ? <h2 id={titleId} className={styles.title}>{title}</h2> : null}
            {subtitle ? <p id={descriptionId} className={styles.subtitle}>{subtitle}</p> : null}
            {headerMeta ? <div className={styles.headerMeta}>{headerMeta}</div> : null}
          </div>

          <div className={styles.headerActions}>
            {headerActions}
            <button type="button" className={styles.closeButton} onClick={() => onClose?.()} aria-label={closeLabel}>
              ×
            </button>
          </div>
        </div>

        <div
          className={`${styles.body} ${bodyClassName}`.trim()}
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
        >
          <div className={styles.bodyInner}>
            {children}
          </div>
        </div>

        {footer ? (
          <div className={styles.footer}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
