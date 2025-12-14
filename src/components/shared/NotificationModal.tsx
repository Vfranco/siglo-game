import { motion } from 'framer-motion';
import './NotificationModal.css';

interface NotificationModalProps {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  onClose: () => void;
  showCloseButton?: boolean;
}

export const NotificationModal = ({ 
  title, 
  message, 
  type = 'info',
  onClose,
  showCloseButton = true
}: NotificationModalProps) => {
  const getIcon = () => {
    switch(type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <motion.div
      className="notification-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={showCloseButton ? onClose : undefined}
    >
      <motion.div
        className={`notification-modal notification-modal-${type}`}
        initial={{ scale: 0.8, opacity: 0, y: -50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notification-icon">
          {getIcon()}
        </div>

        <h2 className="notification-title">{title}</h2>
        <p className="notification-message">{message}</p>

        {showCloseButton && (
          <button 
            className={`btn-notification btn-notification-${type}`}
            onClick={onClose}
          >
            Entendido
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};
