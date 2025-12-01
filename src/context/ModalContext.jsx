import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/Modal';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
  });

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showModal = useCallback((options) => {
    setModalState({
      isOpen: true,
      title: options.title || '',
      message: options.message || '',
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: options.showCancel || false,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
    });
  }, []);

  // Shorthand methods
  const showSuccess = useCallback((message, title = 'Success!') => {
    showModal({ type: 'success', title, message });
  }, [showModal]);

  const showError = useCallback((message, title = 'Error!') => {
    showModal({ type: 'error', title, message });
  }, [showModal]);

  const showWarning = useCallback((message, title = 'Warning!') => {
    showModal({ type: 'warning', title, message });
  }, [showModal]);

  const showInfo = useCallback((message, title = 'Information') => {
    showModal({ type: 'info', title, message });
  }, [showModal]);

  const showConfirm = useCallback((message, onConfirm, options = {}) => {
    showModal({
      type: options.type || 'warning',
      title: options.title || 'Confirm',
      message,
      showCancel: true,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      onConfirm,
      onCancel: options.onCancel,
    });
  }, [showModal]);

  return (
    <ModalContext.Provider value={{ 
      showModal, 
      showSuccess, 
      showError, 
      showWarning, 
      showInfo, 
      showConfirm,
      closeModal 
    }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
      />
    </ModalContext.Provider>
  );
};
