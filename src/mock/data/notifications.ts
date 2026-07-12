import { AppNotification } from '../../types';

export const mockNotifications: AppNotification[] = [
  {
    id: 'NTF1',
    userId: '1',
    title: 'Welcome to Shona Arts!',
    message: 'Discover handpicked paintings from local artists. Start exploring the gallery today.',
    type: 'system',
    read: true,
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'NTF2',
    userId: '1',
    title: 'Weekend Sale',
    message: 'Enjoy up to 20% off selected Abstract paintings this weekend only.',
    type: 'promo',
    read: false,
    createdAt: '2025-11-28T09:00:00.000Z',
  },
];
