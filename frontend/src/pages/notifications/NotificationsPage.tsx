import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ArrowRight, Syringe, Pill, CalendarClock, AlertCircle, Info } from 'lucide-react';
import { notificationApi } from '../../services/notification.service.js';
import { NotificationItem } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';
import { PageHeader } from '../../components/common/PageHeader.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { CardSkeleton } from '../../components/common/LoadingSpinner.js';
import { formatRelativeTime } from '../../utils/date.js';

export const NotificationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách thông báo.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      error(err.message || 'Lỗi đánh dấu đã đọc');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      success('Đã đánh dấu đọc tất cả thông báo.');
    } catch (err: any) {
      error(err.message || 'Lỗi đánh dấu tất cả');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      success('Đã xóa thông báo.');
    } catch (err: any) {
      error(err.message || 'Lỗi xóa thông báo');
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'VACCINATION':
        return <Syringe className="w-5 h-5 text-amber-600" />;
      case 'MEDICATION':
        return <Pill className="w-5 h-5 text-purple-600" />;
      case 'SCHEDULE':
        return <CalendarClock className="w-5 h-5 text-emerald-600" />;
      case 'HEALTH_ALERT':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'SYSTEM':
      default:
        return <Info className="w-5 h-5 text-sky-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.isRead : true
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="Trung Tâm Thông Báo"
        subtitle="Cập nhật lời nhắc thuốc, lịch tiêm phòng và các sự kiện chăm sóc quan trọng"
      >
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </PageHeader>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-emerald-50 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-emerald-50 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Không có thông báo nào"
          description={
            filter === 'unread'
              ? 'Tuyệt vời! Bạn đã đọc hết toàn bộ thông báo.'
              : 'Hệ thống sẽ gửi thông báo khi có lịch uống thuốc, tiêm phòng sắp tới hạn.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !notif.isRead
                  ? 'bg-white border-emerald-200/80 shadow-sm ring-1 ring-emerald-500/10'
                  : 'bg-slate-50/60 border-slate-100 text-slate-500'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold truncate ${
                        !notif.isRead ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>{formatRelativeTime(notif.createdAt)}</span>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                    title="Đánh dấu đã đọc"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Xóa thông báo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
