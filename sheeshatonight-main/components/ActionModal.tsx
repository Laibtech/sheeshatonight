'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Loader } from './Loader';

export type ActionType = 'approve' | 'reject' | 'delete' | 'accept' | 'decline' | 'toggle' | 'cancel' | 'custom';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionType: ActionType;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  itemName?: string;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actionType,
  onConfirm,
  isLoading = false,
  confirmText,
  cancelText = 'Cancel',
  isDangerous = false,
  itemName,
}) => {
  const [localLoading, setLocalLoading] = useState(false);

  const getDefaultText = () => {
    switch (actionType) {
      case 'approve':
        return 'Approve';
      case 'reject':
        return 'Reject';
      case 'delete':
        return 'Delete';
      case 'accept':
        return 'Accept';
      case 'decline':
        return 'Decline';
      case 'toggle':
        return 'Toggle';
      case 'cancel':
        return 'Cancel Order';
      default:
        return 'Confirm';
    }
  };

  const handleConfirm = async () => {
    setLocalLoading(true);
    try {
      await onConfirm();
    } finally {
      setLocalLoading(false);
    }
  };

  const isProcessing = isLoading || localLoading;

  return (
    <Modal open={isOpen} onClose={onClose} title={title}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
          {itemName && <span className="font-semibold block mt-2">&quot;{itemName}&quot;</span>}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              isDangerous
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50`}
          >
            {isProcessing && <Loader size={16} />}
            {confirmText || getDefaultText()}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ActionModal;
