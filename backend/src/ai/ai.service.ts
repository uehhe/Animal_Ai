import { prisma } from '../prisma/client.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/response.js';
import { PET_CARE_SYSTEM_PROMPT } from './ai.prompt.js';

export interface ChatMessageInput {
  conversationId?: string;
  petId?: string;
  message: string;
}

export class AIService {
  async getConversations(userId: string) {
    return prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        pet: { select: { id: true, name: true, species: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getConversationById(userId: string, id: string) {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            avatar: true,
            weight: true,
            healthStatus: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new AppError('Không tìm thấy cuộc trò chuyện.', 404);
    }

    if (conversation.userId !== userId) {
      throw new AppError('Bạn không có quyền truy cập cuộc trò chuyện này.', 403);
    }

    return conversation;
  }

  async createConversation(userId: string, data: { petId?: string; title?: string }) {
    if (data.petId) {
      const pet = await prisma.pet.findUnique({
        where: { id: data.petId },
        select: { userId: true, name: true },
      });
      if (!pet || pet.userId !== userId) {
        throw new AppError('Thú cưng không hợp lệ.', 400);
      }
    }

    return prisma.aIConversation.create({
      data: {
        userId,
        petId: data.petId ?? null,
        title: data.title || 'Cuộc trò chuyện mới',
      },
      include: {
        pet: { select: { id: true, name: true, species: true, avatar: true } },
        messages: true,
      },
    });
  }

  async deleteConversation(userId: string, id: string) {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!conversation) {
      throw new AppError('Không tìm thấy cuộc trò chuyện để xóa.', 404);
    }

    if (conversation.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa cuộc trò chuyện này.', 403);
    }

    await prisma.aIConversation.delete({ where: { id } });
    return { message: 'Đã xóa cuộc trò chuyện thành công.' };
  }

  async chat(userId: string, input: ChatMessageInput) {
    const { petId, message } = input;
    let conversationId = input.conversationId;

    // 1. Kiểm tra hoặc tạo cuộc hội thoại
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: { pet: true },
      });
      if (!conversation || conversation.userId !== userId) {
        throw new AppError('Cuộc trò chuyện không hợp lệ.', 400);
      }
    } else {
      const title = message.length > 40 ? `${message.substring(0, 40)}...` : message;
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          petId: petId ?? null,
          title,
        },
        include: { pet: true },
      });
      conversationId = conversation.id;
    }

    // 2. Lưu tin nhắn của User vào DB
    await prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: message,
      },
    });

    // 3. Thu thập dữ liệu thực tế của Thú cưng để làm context
    const targetPetId = petId || conversation.petId;
    let petContext = 'Không có thú cưng cụ thể nào được chọn.';

    let petData = null;
    if (targetPetId) {
      petData = await prisma.pet.findUnique({
        where: { id: targetPetId },
        include: {
          healthRecords: { orderBy: { date: 'desc' }, take: 3 },
          vaccinations: { orderBy: { nextDueDate: 'asc' }, take: 3 },
          medications: { where: { status: { in: ['ACTIVE', 'EXPIRING_SOON'] } }, take: 3 },
          careSchedules: { orderBy: { scheduledDate: 'asc' }, take: 5 },
          diaries: { orderBy: { date: 'desc' }, take: 2 },
        },
      });

      if (petData && petData.userId === userId) {
        petContext = `
[NGỮ CẢNH DỮ LIỆU THÚ CƯNG]:
- Tên thú cưng: ${petData.name}
- Loài: ${petData.species === 'DOG' ? 'Chó' : petData.species === 'CAT' ? 'Mèo' : 'Khác'}
- Giống: ${petData.breed}
- Giới tính: ${petData.gender === 'MALE' ? 'Đực' : petData.gender === 'FEMALE' ? 'Cái' : 'Chưa rõ'}
- Tuổi: ${petData.age ?? 'Chưa rõ'} tuổi
- Cân nặng: ${petData.weight ?? 'Chưa rõ'} kg
- Tình trạng sức khỏe: ${petData.healthStatus}
- Ghi chú: ${petData.notes || 'Không có'}

LỊCH SỬ SỨC KHỎE GẦN ĐÂY:
${
  petData.healthRecords.length > 0
    ? petData.healthRecords
        .map(
          (h) =>
            `- Ngày ${new Date(h.date).toLocaleDateString('vi-VN')}: Chẩn đoán: "${h.diagnosis}", Điều trị: "${h.treatment || 'N/A'}", Cân nặng: ${h.weight || 'N/A'}kg, Thân nhiệt: ${h.temperature || 'N/A'}°C, Khám tại: ${h.clinicName || 'N/A'}`
        )
        .join('\n')
    : '- Chưa có hồ sơ khám bệnh.'
}

LỊCH TIÊM PHÒNG:
${
  petData.vaccinations.length > 0
    ? petData.vaccinations
        .map(
          (v) =>
            `- Vaccine: ${v.vaccineName}, Trạng thái: ${v.status}, Ngày tiêm: ${new Date(v.administeredDate).toLocaleDateString('vi-VN')}, Hạn tiêm nhắc: ${v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString('vi-VN') : 'Không có'}`
        )
        .join('\n')
    : '- Chưa có hồ sơ tiêm chủng.'
}

ĐƠN THUỐC ĐANG DÙNG:
${
  petData.medications.length > 0
    ? petData.medications
        .map(
          (m) =>
            `- Tên thuốc: ${m.name}, Liều lượng: ${m.dosage} ${m.unit}, Tần suất: ${m.frequency}, Bác sĩ kê: ${m.prescribedBy || 'N/A'}, Hướng dẫn: ${m.instructions || 'N/A'}`
        )
        .join('\n')
    : '- Hiện không dùng thuốc nào.'
}

LỊCH CHĂM SÓC SẮP TỚI:
${
  petData.careSchedules.length > 0
    ? petData.careSchedules
        .map(
          (s) =>
            `- ${s.title} (${s.careType}) lúc ${s.scheduledTime || 'Cả ngày'} ngày ${new Date(s.scheduledDate).toLocaleDateString('vi-VN')}, Trạng thái: ${s.status}`
        )
        .join('\n')
    : '- Chưa có lịch chăm sóc sắp tới.'
}

NHẬT KÝ GẦN NHẤT:
${
  petData.diaries.length > 0
    ? petData.diaries
        .map(
          (d) =>
            `- Ngày ${new Date(d.date).toLocaleDateString('vi-VN')}: "${d.title}" - Tâm trạng: ${d.mood}, Hoạt động: ${d.activity || 'N/A'}`
        )
        .join('\n')
    : '- Chưa có nhật ký.'
}
`;
      }
    }

    // 4. Lấy lịch sử hội thoại gần nhất (tối đa 8 tin nhắn)
    const recentMessages = await prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    recentMessages.reverse();

    // 5. Gọi LLM API hoặc Fallback Rule-Engine
    let aiResponseText = '';
    const hasValidKey = config.ai.apiKey && config.ai.apiKey.trim() !== '' && !config.ai.apiKey.includes('your_llm_api_key');

    if (hasValidKey) {
      try {
        const payloadMessages = [
          { role: 'system', content: `${PET_CARE_SYSTEM_PROMPT}\n\n${petContext}` },
          ...recentMessages.map((m) => ({
            role: m.role.toLowerCase() === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ];

        const response = await fetch(`${config.ai.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.ai.apiKey}`,
          },
          body: JSON.stringify({
            model: config.ai.model,
            messages: payloadMessages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
          aiResponseText = data.choices?.[0]?.message?.content || '';
        } else {
          console.warn('⚠️ [AI API Warning]:', await response.text());
        }
      } catch (err) {
        console.error('❌ [AI Service Error]:', err);
      }
    }

    // Nếu không có API Key hoặc gọi API lỗi, dùng Dynamic Context-Aware Intelligent Synthesizer
    if (!aiResponseText) {
      aiResponseText = this.generateContextualResponse(message, petData);
    }

    // 6. Lưu tin nhắn của Assistant vào DB
    const assistantMessage = await prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: aiResponseText,
      },
    });

    // Cập nhật updatedAt cho cuộc hội thoại
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      conversationId,
      message: assistantMessage,
    };
  }

  private generateContextualResponse(userPrompt: string, pet: any): string {
    const promptLower = userPrompt.toLowerCase();

    if (!pet) {
      return `Chào bạn! Tôi là Trợ lý PetCare AI. Bạn có thể chọn một bé thú cưng cụ thể (như Bella hoặc Mimi) ở phía trên để tôi có thể hỗ trợ kiểm tra lịch chăm sóc, nhắc thuốc, vaccine hoặc tư vấn chế độ dinh dưỡng chính xác nhất nhé!

### 💡 Gợi ý câu hỏi bạn có thể thử:
- *"Hôm nay thú cưng của tôi có lịch gì cần làm?"*
- *"Tạo routine chăm sóc 7 ngày cho bé."*
- *"Tóm tắt tình hình sức khỏe và vaccine."*

⚠️ *Thông tin do AI cung cấp chỉ nhằm mục đích tham khảo và không thay thế tư vấn, chẩn đoán hoặc điều trị của bác sĩ thú y.*`;
    }

    const petName = pet.name;
    const petType = pet.species === 'DOG' ? 'chó' : pet.species === 'CAT' ? 'mèo' : 'thú cưng';

    // 1. Hỏi về lịch hôm nay / tuần này / việc cần làm
    if (promptLower.includes('hôm nay') || promptLower.includes('tuần này') || promptLower.includes('lịch') || promptLower.includes('cần làm')) {
      const pendingSchedules = pet.careSchedules?.filter((s: any) => s.status === 'PENDING') || [];
      const schedulesList = pendingSchedules.length > 0
        ? pendingSchedules.map((s: any) => `- **${s.scheduledTime || 'Trong ngày'}**: ${s.title} (${s.careType})`).join('\n')
        : `- Hiện chưa có lịch chăm sóc nào đang chờ thực hiện cho ${petName}.`;

      const meds = pet.medications?.filter((m: any) => m.status === 'ACTIVE') || [];
      const medsList = meds.length > 0
        ? meds.map((m: any) => `- **${m.name}**: ${m.dosage} ${m.unit} (${m.frequency}) - ${m.instructions || ''}`).join('\n')
        : `- ${petName} hiện không có đơn thuốc cần uống.`;

      const upcomingVac = pet.vaccinations?.find((v: any) => v.status === 'UPCOMING') || null;

      return `Chào bạn! Dưới đây là tổng hợp lịch trình chăm sóc thực tế của bé **${petName}** (${pet.breed}, ${pet.weight || '24'}kg):

### 📋 Lịch chăm sóc & Nhiệm vụ sắp tới
${schedulesList}

### 💊 Thuốc & Thực phẩm bổ sung cần uống
${medsList}

${upcomingVac ? `### 💉 Cảnh báo tiêm chủng\n- **${upcomingVac.vaccineName}**: Dự kiến tiêm nhắc lại vào ngày **${new Date(upcomingVac.nextDueDate).toLocaleDateString('vi-VN')}**.` : ''}

### ✅ Việc bạn cần làm ngay:
1. Đảm bảo cho bé ăn đúng giờ và cung cấp đủ nước sạch.
2. Hoàn thành các việc trong danh sách và bấm "Hoàn thành" trên hệ thống để theo dõi tiến độ.
3. Quan sát các biểu hiện thể trạng sau mỗi cữ vận động.

⚠️ *Thông tin do AI cung cấp chỉ nhằm mục đích tham khảo và không thay thế tư vấn, chẩn đoán hoặc điều trị của bác sĩ thú y.*`;
    }

    // 2. Hỏi về routine 7 ngày / kế hoạch chăm sóc
    if (promptLower.includes('routine') || promptLower.includes('7 ngày') || promptLower.includes('kế hoạch') || promptLower.includes('thời gian biểu')) {
      return `Dựa trên thông tin của bé **${petName}** (${pet.breed}, ${pet.age || 1} tuổi, cân nặng ${pet.weight || 4.2}kg), tôi đề xuất Thời gian biểu chăm sóc 7 ngày chuẩn khoa học như sau:

### 🌅 Routine Hàng Ngày (Thứ 2 - Chủ Nhật):
- **Buổi sáng (07:00 - 08:00)**:
  - Cho ${petName} ăn bữa sáng theo định lượng chuẩn (${pet.species === 'DOG' ? 'hạt + men tiêu hóa' : 'hạt kiểm soát búi lông'}).
  - Thay bát nước sạch mới.
  ${pet.species === 'DOG' ? '- Dắt bé đi vệ sinh và vận động nhẹ nhàng 15-20 phút.' : '- Dọn sạch khay cát vệ sinh.'}

- **Buổi trưa (12:00 - 13:00)**:
  - Cho bé nghỉ ngơi ở nơi thoáng mát, có đệm êm hoặc sưởi nắng.
  - Kiểm tra lượng nước uống.

- **Buổi chiều tối (17:30 - 18:30)**:
  - Cho ăn bữa tối.
  ${pet.species === 'DOG' ? '- Đi dạo công viên, luyện tập tương tác ném bóng/ném đĩa 30-45 phút.' : '- Dành 15-20 phút chơi cần câu mèo hoặc đồ chơi laser tương tác.'}

- **Buổi tối (20:00 - 21:00)**:
  - Chải lông nhẹ nhàng để loại bỏ lông rụng và kiểm tra ve, rận hoặc viêm da.
  - Vệ sinh khóe mắt, kiểm tra tai khô ráo sạch sẽ.

### 🗓️ Lịch Định Kỳ Trong Tuần:
- **Thứ 4**: Vệ sinh răng miệng bằng gel chải răng chuyên dụng.
- **Thứ 6**: Tắm thơm tho (sấy lông thật khô) hoặc cắt tỉa móng chân.
- **Chủ Nhật**: Cân lại trọng lượng cơ thể và ghi nhật ký hoạt động trên PetCare AI.

⚠️ *Thông tin do AI cung cấp chỉ nhằm mục đích tham khảo và không thay thế tư vấn, chẩn đoán hoặc điều trị của bác sĩ thú y.*`;
    }

    // 3. Hỏi về tóm tắt sức khỏe / bệnh tật / triệu chứng
    if (promptLower.includes('sức khỏe') || promptLower.includes('bệnh') || promptLower.includes('triệu chứng') || promptLower.includes('tóm tắt')) {
      const lastHealth = pet.healthRecords?.[0];
      return `Báo cáo tóm tắt hồ sơ sức khỏe hiện tại của bé **${petName}**:

### 🔍 Tình trạng thể chất
- **Thể trạng chung**: ${pet.healthStatus === 'HEALTHY' ? 'Khỏe mạnh, phát triển bình thường' : pet.healthStatus}
- **Cân nặng ghi nhận**: ${pet.weight || 'Chưa cập nhật'} kg
- **Lần khám gần nhất**: ${lastHealth ? `${new Date(lastHealth.date).toLocaleDateString('vi-VN')} tại ${lastHealth.clinicName || 'Phòng khám thú y'}` : 'Chưa có lịch sử khám'}
${lastHealth ? `- **Chẩn đoán của bác sĩ**: ${lastHealth.diagnosis}\n- **Chỉ định điều trị**: ${lastHealth.treatment || 'Duy trì theo dõi'}` : ''}

### 💡 Đề xuất chăm sóc sức khỏe:
1. Duy trì chỉ số cân nặng hiện tại, tránh cho ăn quá nhiều đồ ăn vặt gây béo phì.
2. Theo dõi sát các biểu hiện bất thường như: bỏ ăn quá 24h, nôn mửa, sốt, tiêu chảy hoặc lờ đờ.
3. Nếu bé có dấu hiệu sốt (thân nhiệt trên 39.5°C) hoặc co giật, hãy liên hệ ngay với phòng khám thú y để được can thiệp kịp thời.

⚠️ *Thông tin do AI cung cấp chỉ nhằm mục đích tham khảo và không thay thế tư vấn, chẩn đoán hoặc điều trị của bác sĩ thú y.*`;
    }

    // Câu trả lời phổ quát
    return `Chào bạn! Tôi đã tiếp nhận câu hỏi của bạn về bé **${petName}** (${pet.breed}, ${pet.weight || ''}kg):

### 📋 Phản hồi & Đề xuất chăm sóc
- Đối với giống ${pet.breed}, điều quan trọng nhất là duy trì chế độ dinh dưỡng cân đối và vận động đều đặn để giữ cơ thể săn chắc và tinh thần vui vẻ.
- Bạn có thể tạo thêm các lịch trình cụ thể tại trang **Lịch chăm sóc** hoặc cập nhật các sự kiện thường ngày tại mục **Nhật ký** để tôi có thêm dữ liệu cá nhân hóa cho các câu hỏi tiếp theo nhé!

Nếu có bất kỳ thắc mắc nào khác về dinh dưỡng, lịch tiêm hay chăm sóc lông cho ${petName}, bạn cứ thoải mái nhắn cho tôi nhé!

⚠️ *Thông tin do AI cung cấp chỉ nhằm mục đích tham khảo và không thay thế tư vấn, chẩn đoán hoặc điều trị của bác sĩ thú y.*`;
  }
}

export const aiService = new AIService();
