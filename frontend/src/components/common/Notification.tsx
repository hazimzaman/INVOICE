'use client';

import { useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { hideNotification } from '@/store/slices/notificationSlice';

export default function Notification() {
  const dispatch = useAppDispatch();
  const { message, type, isVisible } = useAppSelector((state) => state.notification);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, dispatch]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out
          ${type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        `}
      >
        <div className="flex items-center">
          {type === 'success' ? (
            <FiCheck className="w-5 h-5 mr-2 text-green-500" />
          ) : (
            <FiAlertCircle className="w-5 h-5 mr-2 text-red-500" />
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => dispatch(hideNotification())}
          className={`ml-4 hover:bg-opacity-20 p-1 rounded-full transition-colors
            ${type === 'success' ? 'hover:bg-green-200' : 'hover:bg-red-200'}`}
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 