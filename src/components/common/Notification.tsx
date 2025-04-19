'use client';

import { useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { hideNotification } from '@/store/slices/notificationSlice';

export default function Notification() {
  const dispatch = useAppDispatch();
  const { message, type, isVisible } = useAppSelector((state) => state.notification);

  // ... rest of component
} 