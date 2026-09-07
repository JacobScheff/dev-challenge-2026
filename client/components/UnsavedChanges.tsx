'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const LEAVE_MESSAGE = 'Leave without saving? Your changes will be lost.';

const UnsavedChangesContext = createContext<
  (formId: string, hasUnsavedChanges: boolean) => void
>(() => {});

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const formsWithUnsavedChanges = useRef(new Set<string>());
  const [shouldConfirmLeave, setShouldConfirmLeave] = useState(false);

  const setFormUnsaved = useCallback((formId: string, hasUnsavedChanges: boolean) => {
    const wasConfirming = formsWithUnsavedChanges.current.size > 0;
    if (hasUnsavedChanges) formsWithUnsavedChanges.current.add(formId);
    else formsWithUnsavedChanges.current.delete(formId);
    const nextConfirming = formsWithUnsavedChanges.current.size > 0;
    if (nextConfirming !== wasConfirming) setShouldConfirmLeave(nextConfirming);
  }, []);

  useLeaveConfirmation(shouldConfirmLeave);

  return (
    <UnsavedChangesContext.Provider value={setFormUnsaved}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges(formId: string, hasUnsavedChanges: boolean) {
  const setFormUnsaved = useContext(UnsavedChangesContext);
  useEffect(() => {
    setFormUnsaved(formId, hasUnsavedChanges);
    return () => setFormUnsaved(formId, false);
  }, [formId, hasUnsavedChanges, setFormUnsaved]);
}

function useLeaveConfirmation(shouldConfirmLeave: boolean) {
  const shouldConfirmLeaveRef = useRef(shouldConfirmLeave);
  shouldConfirmLeaveRef.current = shouldConfirmLeave;

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!shouldConfirmLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    }

    function onClick(event: MouseEvent) {
      if (!shouldConfirmLeaveRef.current) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank') return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const next = new URL(anchor.href, window.location.href);
      if (next.href === window.location.href) return;
      if (window.confirm(LEAVE_MESSAGE)) return;

      event.preventDefault();
      event.stopPropagation();
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, []);
}
