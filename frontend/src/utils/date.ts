export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Chưa cập nhật';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return 'Chưa cập nhật';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${d.toLocaleDateString('vi-VN')}`;
  } catch {
    return dateStr;
  }
};

export const formatRelativeTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
};

export const toInputDateFormat = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};
