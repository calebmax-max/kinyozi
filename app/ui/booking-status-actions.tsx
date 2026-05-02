'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type BookingStatusActionsProps = {
  bookingId: string;
  currentStatus: string;
};

const statuses = ['pending', 'completed', 'cancelled'] as const;

export function BookingStatusActions({
  bookingId,
  currentStatus,
}: BookingStatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateStatus(status: (typeof statuses)[number]) {
    setIsUpdating(true);

    const response = await fetch('/api/bookings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: bookingId, status }),
    });

    setIsUpdating(false);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="actions">
      {statuses.map((status) => (
        <button
          key={status}
          className={status === currentStatus ? 'button' : 'button-secondary'}
          type="button"
          disabled={isUpdating || status === currentStatus}
          onClick={() => updateStatus(status)}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
