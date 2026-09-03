import { css } from '@emotion/css';
import { useCallback, useEffect, useState } from 'react';
import { type Location, useLocation } from 'react-router-dom';

import { Trans, t } from '@grafana/i18n';
import { Button, Modal } from '@grafana/ui';

import { type NavigationBlocker, Prompt } from './Prompt';

export interface Props {
  confirmRedirect?: boolean;
  onDiscard: () => void;
  /** Extra check to invoke when location changes.
   * Could be useful in multistep forms where each step has a separate URL
   */
  onLocationChange?: (location: Location) => void;
}

/**
 * Component handling redirects when a form has unsaved changes.
 * Page reloads are handled in useEffect via beforeunload event.
 * URL navigation is handled by react-router's components since it does not trigger beforeunload event.
 */
export const FormPrompt = ({ confirmRedirect, onDiscard, onLocationChange }: Props) => {
  const currentLocation = useLocation();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [blocker, setBlocker] = useState<NavigationBlocker>();

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (confirmRedirect) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [confirmRedirect]);

  // Returning 'false' from this function will prevent navigation to the next URL
  const handleRedirect = (location: Location) => {
    // Do not show the unsaved changes modal if only the URL params have changed
    if (currentLocation.pathname === location.pathname) {
      return true;
    }

    const locationChangeCheck = onLocationChange?.(location);

    let blockRedirect = confirmRedirect;
    if (locationChangeCheck !== undefined) {
      blockRedirect = blockRedirect && locationChangeCheck;
    }

    if (blockRedirect) {
      setModalIsOpen(true);
      return false;
    }

    if (locationChangeCheck) {
      onDiscard();
    }

    return true;
  };

  const onBackToForm = () => {
    setModalIsOpen(false);
    blocker?.reset();
    setBlocker(undefined);
  };

  const onDiscardChanges = () => {
    setModalIsOpen(false);
    onDiscard();
    blocker?.proceed();
    setBlocker(undefined);
  };

  const onBlocked = useCallback((blocker: NavigationBlocker) => setBlocker(blocker), []);

  return (
    <>
      <Prompt when={true} message={handleRedirect} onBlocked={onBlocked} />
      <UnsavedChangesModal isOpen={modalIsOpen} onDiscard={onDiscardChanges} onBackToForm={onBackToForm} />
    </>
  );
};

interface UnsavedChangesModalProps {
  onDiscard: () => void;
  onBackToForm: () => void;
  isOpen: boolean;
}

const UnsavedChangesModal = ({ onDiscard, onBackToForm, isOpen }: UnsavedChangesModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title={t('form-prompt.title', 'Leave page?')}
      onDismiss={onBackToForm}
      className={css({ width: '500px' })}
    >
      <h5>
        <Trans i18nKey="form-prompt.description">Changes that you made may not be saved.</Trans>
      </h5>
      <Modal.ButtonRow>
        <Button variant="secondary" onClick={onBackToForm} fill="outline">
          <Trans i18nKey="form-prompt.continue-button">Continue editing</Trans>
        </Button>
        <Button variant="destructive" onClick={onDiscard}>
          <Trans i18nKey="form-prompt.discard-button">Discard unsaved changes</Trans>
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};
