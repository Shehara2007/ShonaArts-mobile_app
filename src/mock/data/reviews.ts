import { Review } from '../../types';

export const mockReviews: Review[] = [
  {
    id: 'REV1',
    paintingId: '1',
    userId: '3',
    userName: 'John Doe',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    comment: 'Absolutely stunning piece — the colors are even more vivid in person. Shipping was fast and packaging was excellent.',
    createdAt: '2025-11-02T10:15:00.000Z',
  },
  {
    id: 'REV2',
    paintingId: '1',
    userId: '4',
    userName: 'Jane Smith',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    rating: 4,
    comment: 'Beautiful brushwork. Slightly smaller than I expected but still a great addition to my living room.',
    createdAt: '2025-11-10T14:30:00.000Z',
  },
  {
    id: 'REV3',
    paintingId: '2',
    userId: '5',
    userName: 'Bob Wilson',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    comment: 'This is my second purchase from Shona Arts and it did not disappoint. Highly recommend this artist.',
    createdAt: '2025-11-15T09:00:00.000Z',
  },
  {
    id: 'REV4',
    paintingId: '3',
    userId: '6',
    userName: 'Alice Brown',
    userAvatar: 'https://i.pravatar.cc/150?img=6',
    rating: 4,
    comment: 'Lovely landscape, great use of light. Frame not included but that was expected.',
    createdAt: '2025-11-20T16:45:00.000Z',
  },
];
