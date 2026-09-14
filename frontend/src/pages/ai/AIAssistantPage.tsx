import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  MessageSquare,
  Bot,
  User as UserIcon,
  PawPrint,
  ChevronDown,
} from 'lucide-react';
import { aiApi } from '../../services/ai.service.js';
import { AIConversationItem, AIMessageItem } from '../../types/index.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { usePet } from '../../contexts/PetContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatSpecies } from '../../utils/format.js';

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, selectedPetId, selectPet } = usePet();
  const { error } = useToast();
  const location = useLocation();

  const [conversations, setConversations] = useState<AIConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Tải danh sách hội thoại
  const loadConversations = useCallback(async () => {
    try {
      const data = await aiApi.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }
      return data;
    } catch (err: any) {
      error(err.message || 'Lỗi tải lịch sử trò chuyện.');
      return [];
    } finally {
      setIsInitializing(false);
    }
  }, [activeConversationId, error]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Khi chọn một hội thoại, tải chi tiết tin nhắn
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }
      try {
        const data = await aiApi.getConversationById(activeConversationId);
        setMessages(data.messages || []);
        if (data.petId && data.petId !== selectedPetId) {
          selectPet(data.petId);
        }
      } catch (err: any) {
        error(err.message || 'Không thể tải tin nhắn.');
      }
    };

    fetchConversationDetails();
  }, [activeConversationId, selectPet, selectedPetId, error]);

  // Xử lý Quick Prompt được truyền từ Dashboard hoặc Pet Detail
  useEffect(() => {
    const state = location.state as { quickPrompt?: string; petId?: string } | undefined;
    if (state?.quickPrompt) {
      if (state.petId) {
        selectPet(state.petId);
      }
      setInputMessage(state.quickPrompt);
      // Xóa state khỏi history để không trigger lại khi reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state, selectPet]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Optimistic message update
    const tempUserMsg: AIMessageItem = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversationId || 'temp',
      role: 'USER',
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const result = await aiApi.chat({
        conversationId: activeConversationId || undefined,
        petId: selectedPetId || undefined,
        message: userText,
      });

      if (!activeConversationId) {
        setActiveConversationId(result.conversationId);
        await loadConversations();
      }

      setMessages((prev) => [...prev, result.message]);
    } catch (err: any) {
      error(err.message || 'Không thể kết nối với Trợ lý AI.');
      // Remove temp message if failed
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputMessage('');
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        handleCreateNewChat();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi xóa cuộc trò chuyện');
    }
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col md:flex-row bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
      {/* 1. Left Sidebar: Conversation History */}
      <div className="w-full md:w-80 bg-slate-50/70 border-r border-slate-100 flex flex-col shrink-0 h-48 md:h-full">
        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Lịch sử tư vấn
          </div>

          {isInitializing ? (
            <LoadingSpinner size="sm" />
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 px-4">
              Chưa có lịch sử hội thoại nào. Nhập câu hỏi để bắt đầu!
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                className={`flex items-center justify-between p-3 rounded-2xl text-xs cursor-pointer transition-all group ${
                  activeConversationId === c.id
                    ? 'bg-emerald-100/70 text-emerald-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-opacity"
                  title="Xóa hội thoại"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white min-w-0">
        {/* Top Header: Pet Context Card */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Trợ Lý PetCare AI</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Context-Aware
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Tự động lấy lịch sử tiêm phòng, đơn thuốc và nhật ký để tư vấn
              </p>
            </div>
          </div>

          {/* Active Pet Pill */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/70 shadow-xs shrink-0">
            <PawPrint className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={selectedPetId || ''}
              onChange={(e) => selectPet(e.target.value || null)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả thú cưng</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatSpecies(p.species)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Tôi có thể hỗ trợ gì cho {selectedPet ? `bé ${selectedPet.name}` : 'thú cưng của bạn'}?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tôi nắm rõ dữ liệu hồ sơ sức khỏe, đơn thuốc đang dùng và lịch chăm sóc để đưa ra câu trả lời chính xác nhất.
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full text-left">
                <button
                  onClick={() =>
                    setInputMessage(
                      selectedPet
                        ? `Hôm nay ${selectedPet.name} có những lịch chăm sóc hay thuốc gì cần uống không?`
                        : 'Hôm nay các bé có những việc gì cần làm?'
                    )
                  }
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-xs font-medium text-slate-700 transition-colors"
                >
                  📋 "Hôm nay cần làm gì?"
                </button>
                <button
                  onClick={() =>
                    setInputMessage(
                      selectedPet
                        ? `Hãy tạo routine chăm sóc 7 ngày chuẩn khoa học cho ${selectedPet.name}.`
                        : 'Gợi ý routine chăm sóc thú cưng 7 ngày.'
                    )
                  }
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-xs font-medium text-slate-700 transition-colors"
                >
                  🗓️ "Tạo routine 7 ngày"
                </button>
                <button
                  onClick={() =>
                    setInputMessage(
                      selectedPet
                        ? `Tóm tắt sức khỏe và những điều cần lưu ý cho ${selectedPet.name}.`
                        : 'Tóm tắt sức khỏe thú cưng.'
                    )
                  }
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-xs font-medium text-slate-700 transition-colors"
                >
                  🩺 "Tóm tắt hồ sơ sức khỏe"
                </button>
                <button
                  onClick={() =>
                    setInputMessage(
                      selectedPet
                        ? `Kiểm tra các mũi vaccine hoặc thuốc sắp đến hạn của ${selectedPet.name}.`
                        : 'Kiểm tra vaccine sắp tới hạn.'
                    )
                  }
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-xs font-medium text-slate-700 transition-colors"
                >
                  ⏰ "Nhắc việc sắp đến hạn"
                </button>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'USER';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3.5 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm ${
                      isUser
                        ? 'bg-slate-800'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}
                  >
                    {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-md animate-pulse">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Trợ lý AI đang tra cứu dữ liệu thú cưng và phân tích...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="px-6 py-2 bg-amber-50/50 border-t border-slate-100 text-[11px] text-amber-900/80 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">
            Thông tin do AI cung cấp chỉ nhằm mục đích tham khảo và không thay thế tư vấn, chẩn đoán của bác sĩ thú y.
          </span>
        </div>

        {/* Bottom Input Field */}
        <form onSubmit={handleSendMessage} className="p-4 sm:p-5 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Hỏi bất kỳ điều gì về ${selectedPet ? selectedPet.name : 'thú cưng'} (VD: Bella tuần này cần chăm sóc gì?)...`}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 cursor-pointer shrink-0"
              aria-label="Gửi tin nhắn"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
