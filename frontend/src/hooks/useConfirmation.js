import { useState, useCallback } from 'react';

/**
 * Custom hook for confirmation dialogs
 * @returns {Object} Confirmation dialog controls and component props
 */
const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => {}
  });

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      const confirmAction = () => {
        resolve(true);
        if (options.onConfirm) {
          options.onConfirm();
        }
      };

      setConfig({
        ...config,
        ...options,
        onConfirm: confirmAction
      });
      
      setIsOpen(true);
    });
  }, [config]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const modalProps = {
    isOpen,
    onClose: handleClose,
    onConfirm: config.onConfirm,
    title: config.title,
    message: config.message,
    confirmText: config.confirmText,
    cancelText: config.cancelText,
    type: config.type
  };

  return {
    confirm,
    modalProps
  };
};

export default useConfirmation;