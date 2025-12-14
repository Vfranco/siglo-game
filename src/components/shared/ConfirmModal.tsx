import { motion } from 'framer-motion';
import './ConfirmModal.css';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmModal = ({ 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm, 
  onCancel,
  type = 'warning'
}: ConfirmModalProps) => {
  const getIcon = () => {
    switch(type) {
      case 'danger': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <motion.div
      className="confirm-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className={`confirm-modal confirm-modal-${type}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-icon">
          {getIcon()}
        </div>

        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button 
            className="btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`btn-confirm btn-confirm-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
