// Formatting utilities
export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

export function getUrgencyStyles(tier) {
  switch (tier) {
    case 'CRITICAL':
      return {
        color: '#f87171',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.4)',
        dot: '#ef4444'
      };
    case 'HIGH':
      return {
        color: '#fb923c',
        bg: 'rgba(249, 115, 22, 0.15)',
        border: 'rgba(249, 115, 22, 0.4)',
        dot: '#f97316'
      };
    case 'MEDIUM':
      return {
        color: '#facc15',
        bg: 'rgba(234, 179, 8, 0.15)',
        border: 'rgba(234, 179, 8, 0.4)',
        dot: '#eab308'
      };
    case 'LOW':
    default:
      return {
        color: '#4ade80',
        bg: 'rgba(34, 197, 94, 0.15)',
        border: 'rgba(34, 197, 94, 0.4)',
        dot: '#22c55e'
      };
  }
}
