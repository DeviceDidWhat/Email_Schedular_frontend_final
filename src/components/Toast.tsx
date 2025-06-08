import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center justify-between ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white max-w-md`}>
      <p>{message}</p>
      <button onClick={onClose} className="ml-4 focus:outline-none">
        <X size={20} />
      </button>
    </div>
  );
};

export default Toast;
