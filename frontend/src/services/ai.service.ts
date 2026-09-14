import { api } from './api.js';
import { AIConversationItem, AIMessageItem, ApiResponse } from '../types/index.js';

export const aiApi = {
  getConversations: async () => {
    const res = await api.get<ApiResponse<AIConversationItem[]>>('/ai/conversations');
    return res.data.data;
  },

  getConversationById: async (id: string) => {
    const res = await api.get<ApiResponse<AIConversationItem>>(`/ai/conversations/${id}`);
    return res.data.data;
  },

  createConversation: async (data: { petId?: string; title?: string }) => {
    const res = await api.post<ApiResponse<AIConversationItem>>('/ai/conversations', data);
    return res.data.data;
  },

  deleteConversation: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/ai/conversations/${id}`);
    return res.data.data;
  },

  chat: async (data: { conversationId?: string; petId?: string; message: string }) => {
    const res = await api.post<ApiResponse<{ conversationId: string; message: AIMessageItem }>>('/ai/chat', data);
    return res.data.data;
  },
};
