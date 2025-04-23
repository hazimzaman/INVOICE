'use client';

import { useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearNotification } from '@/store/slices/notificationSlice';
import { toast } from 'react-hot-toast';

export default function Notification() {
  const dispatch = useAppDispatch();
  const notification = useAppSelector((state) => state.notification);

  useEffect(() => {
    if (notification.message) {
      if (notification.type === 'error') {
        toast.error(notification.message);
      } else if (notification.type === 'success') {
        toast.success(notification.message);
      } else {
        toast(notification.message);
      }
      
      // Clear notification after showing
      setTimeout(() => {
        dispatch(clearNotification());
      }, 3000);
    }
  }, [notification.message, notification.type, dispatch]);

  return null; // This component doesn't render anything, just handles notifications
} 