/**
 * Badge Component
 *
 * Displays colored badges for channels, types, and statuses
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'channel' | 'type' | 'status' | 'default';
  value?: string;
}

export function Badge({ children, variant = 'default', value }: BadgeProps) {
  const getVariantClasses = () => {
    if (variant === 'channel') {
      const channelColors: Record<string, string> = {
        hostaway: 'bg-blue-100 text-blue-800',
        airbnb: 'bg-pink-100 text-pink-800',
        booking: 'bg-purple-100 text-purple-800',
        vrbo: 'bg-orange-100 text-orange-800',
      };
      return channelColors[value?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800';
    }

    if (variant === 'type') {
      return value === 'guest-to-host'
        ? 'bg-green-100 text-green-800'
        : 'bg-indigo-100 text-indigo-800';
    }

    if (variant === 'status') {
      const statusColors: Record<string, string> = {
        approved: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        rejected: 'bg-red-100 text-red-800',
      };
      return statusColors[value?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800';
    }

    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantClasses()}`}>
      {children}
    </span>
  );
}
