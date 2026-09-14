import { PrismaClient, Role, Species, Gender, HealthStatus, VaccinationStatus, MedicationStatus, CareType, RepeatType, ScheduleStatus, Mood, NotificationType, AIRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang khởi tạo dữ liệu mẫu (Seeding database)...');

  // Xóa dữ liệu cũ theo thứ tự quan hệ
  await prisma.aIMessage.deleteMany({});
  await prisma.aIConversation.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.diary.deleteMany({});
  await prisma.careSchedule.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.vaccination.deleteMany({});
  await prisma.healthRecord.deleteMany({});
  await prisma.pet.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Tạo Mật khẩu băm
  const userPassword = await bcrypt.hash('Demo@123456', 10);
  const adminPassword = await bcrypt.hash('Admin@123456', 10);

  // 2. Tạo Demo User & Admin
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@petcare.com',
      password: userPassword,
      name: 'Nguyễn Văn An',
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@petcare.com',
      password: adminPassword,
      name: 'Ban Quản Trị PetCare AI',
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    },
  });

  console.log(`✅ Đã tạo tài khoản: Demo User (${demoUser.email}) & Admin (${adminUser.email})`);

  // 3. Tạo Thú cưng 1: Bella (Chó Golden Retriever)
  const now = new Date();
  const bellaBirth = new Date();
  bellaBirth.setFullYear(now.getFullYear() - 2); // 2 tuổi

  const bella = await prisma.pet.create({
    data: {
      userId: demoUser.id,
      name: 'Bella',
      species: Species.DOG,
      breed: 'Golden Retriever',
      gender: Gender.FEMALE,
      birthDate: bellaBirth,
      age: 2,
      weight: 24.5,
      color: 'Vàng kim óng ả',
      avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
      microchipId: 'VN-9820003418',
      healthStatus: HealthStatus.HEALTHY,
      notes: 'Rất thân thiện, năng động, thích đi bơi và chơi ném bóng trong công viên.',
    },
  });

  // 4. Tạo Thú cưng 2: Mimi (Mèo British Shorthair)
  const mimiBirth = new Date();
  mimiBirth.setFullYear(now.getFullYear() - 1); // 1 tuổi

  const mimi = await prisma.pet.create({
    data: {
      userId: demoUser.id,
      name: 'Mimi',
      species: Species.CAT,
      breed: 'British Shorthair (Mèo Anh Lông Ngắn)',
      gender: Gender.FEMALE,
      birthDate: mimiBirth,
      age: 1,
      weight: 4.2,
      color: 'Xám xanh ánh bạc',
      avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      microchipId: 'VN-9820009941',
      healthStatus: HealthStatus.HEALTHY,
      notes: 'Thích nằm sưởi nắng bên bậu cửa sổ, hơi kén ăn pate cá hồi.',
    },
  });

  console.log(`✅ Đã tạo thú cưng: Bella (${bella.id}) & Mimi (${mimi.id})`);

  // 5. Dữ liệu sức khỏe (Health Records) cho Bella
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  await prisma.healthRecord.createMany({
    data: [
      {
        petId: bella.id,
        date: lastMonth,
        weight: 24.0,
        temperature: 38.5,
        symptoms: 'Khám sức khỏe tổng quát định kỳ quý 2',
        diagnosis: 'Sức khỏe thể chất bình thường, răng sạch, tim phổi tốt',
        treatment: 'Bổ sung thêm dầu cá Omega-3 cho lông mượt',
        clinicName: 'Bệnh Viện Thú Y PetCare Hà Nội',
        veterinarian: 'BS. Lê Minh Tuấn',
        notes: 'Tiếp tục duy trì khẩu phần ăn và lịch tập luyện hiện tại.',
      },
      {
        petId: bella.id,
        date: twoWeeksAgo,
        weight: 24.5,
        temperature: 38.6,
        symptoms: 'Có dấu hiệu gãi tai phải nhiều hơn bình thường',
        diagnosis: 'Viêm tai ngoài nhẹ do ẩm ướt sau khi tắm hồ',
        treatment: 'Nhỏ dung dịch Otovet 2 giọt/lần/ngày trong 7 ngày',
        clinicName: 'Phòng khám Thú Y SamPet',
        veterinarian: 'BS. Trần Thị Mai',
        notes: 'Sau 5 ngày đã dứt điểm tình trạng gãi tai, tai khô ráo sạch sẽ.',
      },
      {
        petId: mimi.id,
        date: lastMonth,
        weight: 4.1,
        temperature: 38.2,
        symptoms: 'Kiểm tra răng miệng và cân nặng',
        diagnosis: 'Răng miệng sạch, nướu hồng hào, phát triển cân đối',
        treatment: 'Không cần can thiệp y khoa',
        clinicName: 'Bệnh Viện Thú Y PetCare Hà Nội',
        veterinarian: 'BS. Lê Minh Tuấn',
        notes: 'Mimi rất ngoan khi khám và hợp tác tốt.',
      },
    ],
  });

  // 6. Lịch tiêm phòng (Vaccinations)
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const inNextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  await prisma.vaccination.createMany({
    data: [
      {
        petId: bella.id,
        vaccineName: 'Vaccine 7 bệnh Vanguard Plus (Chó)',
        administeredDate: sixMonthsAgo,
        expirationDate: nextYear,
        nextDueDate: nextYear,
        clinicName: 'Bệnh Viện Thú Y PetCare Hà Nội',
        veterinarian: 'BS. Lê Minh Tuấn',
        status: VaccinationStatus.COMPLETED,
        notes: 'Tiêm phòng đầy đủ mũi cơ bản hàng năm.',
      },
      {
        petId: bella.id,
        vaccineName: 'Vaccine Dại Rabisin (Chó/Mèo)',
        administeredDate: new Date(now.getTime() - 350 * 24 * 60 * 60 * 1000),
        expirationDate: inTwoWeeks,
        nextDueDate: inTwoWeeks,
        clinicName: 'Trạm Thú Y Quận Cầu Giấy',
        veterinarian: 'BS. Phạm Hồng Sơn',
        status: VaccinationStatus.UPCOMING,
        notes: 'Cần tiêm nhắc lại mũi dại định kỳ trong 2 tuần tới.',
      },
      {
        petId: mimi.id,
        vaccineName: 'Vaccine 4 bệnh PureVax (Mèo)',
        administeredDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        expirationDate: inNextMonth,
        nextDueDate: inNextMonth,
        clinicName: 'Phòng khám Thú Y SamPet',
        veterinarian: 'BS. Trần Thị Mai',
        status: VaccinationStatus.COMPLETED,
        notes: 'Miễn dịch ổn định, không có phản ứng sốt sau tiêm.',
      },
    ],
  });

  // 7. Quản lý thuốc (Medications)
  const today = new Date();
  const nextTenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  await prisma.medication.createMany({
    data: [
      {
        petId: bella.id,
        name: 'Men tiêu hóa vi sinh Bio-Lactic',
        dosage: '1',
        unit: 'Gói (5g)',
        frequency: '1 lần / ngày sau ăn sáng',
        startDate: today,
        endDate: nextTenDays,
        instructions: 'Trộn đều vào thức ăn hạt hoặc hòa cùng một ít nước ấm',
        prescribedBy: 'BS. Lê Minh Tuấn',
        status: MedicationStatus.ACTIVE,
        notes: 'Tăng cường tiêu hóa và hỗ trợ hấp thu dưỡng chất.',
      },
      {
        petId: bella.id,
        name: 'Dung dịch nhỏ tai Otovet PetCare',
        dosage: '2',
        unit: 'Giọt',
        frequency: '2 lần / ngày (Sáng & Tối)',
        startDate: twoWeeksAgo,
        endDate: new Date(twoWeeksAgo.getTime() + 7 * 24 * 60 * 60 * 1000),
        instructions: 'Nhỏ trực tiếp vào ống tai sau khi lau sạch bằng gạc mềm',
        prescribedBy: 'BS. Trần Thị Mai',
        status: MedicationStatus.COMPLETED,
        notes: 'Đã hoàn thành liệu trình 7 ngày, tai đã hồi phục hoàn toàn.',
      },
    ],
  });

  // 8. Lịch chăm sóc (Care Schedules)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const thisFriday = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  await prisma.careSchedule.createMany({
    data: [
      {
        petId: bella.id,
        title: 'Cho Bella ăn sáng và uống men tiêu hóa',
        careType: CareType.FEEDING,
        scheduledDate: today,
        scheduledTime: '07:30',
        repeat: RepeatType.DAILY,
        status: ScheduleStatus.COMPLETED,
        notes: 'Khẩu phần: 250g hạt Royal Canin + 1 gói Bio-Lactic',
      },
      {
        petId: bella.id,
        title: 'Dắt Bella đi dạo công viên và vận động',
        careType: CareType.WALKING,
        scheduledDate: today,
        scheduledTime: '17:30',
        repeat: RepeatType.DAILY,
        status: ScheduleStatus.PENDING,
        notes: 'Đi dạo quanh hồ 30 phút và luyện tập ném bóng.',
      },
      {
        petId: bella.id,
        title: 'Tắm thơm tho và sấy lông cho Bella',
        careType: CareType.BATHING,
        scheduledDate: thisFriday,
        scheduledTime: '15:00',
        repeat: RepeatType.WEEKLY,
        status: ScheduleStatus.PENDING,
        notes: 'Sử dụng sữa tắm thảo mộc dưỡng ẩm cho lông chó lông dài.',
      },
      {
        petId: mimi.id,
        title: 'Chải lông mượt mà và vệ sinh tai cho Mimi',
        careType: CareType.GROOMING,
        scheduledDate: today,
        scheduledTime: '19:00',
        repeat: RepeatType.WEEKLY,
        status: ScheduleStatus.PENDING,
        notes: 'Dùng găng tay chải lông rụng và dung dịch lau tai mèo chuyên dụng.',
      },
      {
        petId: mimi.id,
        title: 'Cắt móng chân và kiểm tra đệm thịt',
        careType: CareType.NAIL_TRIMMING,
        scheduledDate: tomorrow,
        scheduledTime: '20:00',
        repeat: RepeatType.MONTHLY,
        status: ScheduleStatus.PENDING,
        notes: 'Cắt cẩn thận tránh phạm vào tủy móng.',
      },
    ],
  });

  // 9. Nhật ký chăm sóc (Diary)
  await prisma.diary.createMany({
    data: [
      {
        petId: bella.id,
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        title: 'Buổi chiều cuối tuần vui vẻ tại công viên Yên Sở',
        content: 'Hôm nay Bella được gặp rất nhiều bạn cún mới ở bãi cỏ. Bé chạy nhảy liên tục hơn 1 tiếng, đuổi theo đĩa bay và nhảy xuống bơi rất phấn khích. Sau khi về nhà bé ăn hết suất cơm và ngủ say sưa.',
        mood: Mood.ENERGETIC,
        activity: 'Chạy bộ, bơi lội, ném bóng ném đĩa',
        weight: 24.5,
        imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
      },
      {
        petId: mimi.id,
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        title: 'Mimi khám phá chiếc trụ cào móng mới',
        content: 'Mimi ban đầu có vẻ rụt rè nhưng sau khi rắc một chút cỏ bạc hà (catnip) thì bé đã nhảy lên tầng cao nhất nằm sưởi nắng cả buổi chiều. Trông như một nàng công chúa kiêu kỳ!',
        mood: Mood.HAPPY,
        activity: 'Leo trèo trụ cào móng, ngủ sưởi nắng',
        weight: 4.2,
        imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80',
      },
    ],
  });

  // 10. Thông báo mẫu (Notifications)
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Lịch tiêm phòng sắp đến hạn',
        message: 'Bella sắp đến hạn tiêm nhắc lại Vaccine Dại Rabisin trong vòng 14 ngày tới. Vui lòng sắp xếp lịch khám.',
        type: NotificationType.VACCINATION,
        isRead: false,
        link: '/vaccinations',
      },
      {
        userId: demoUser.id,
        title: 'Lịch uống men tiêu hóa hôm nay',
        message: 'Đã đến giờ bổ sung Men tiêu hóa Bio-Lactic cho Bella theo đơn bác sĩ.',
        type: NotificationType.MEDICATION,
        isRead: false,
        link: '/medications',
      },
      {
        userId: demoUser.id,
        title: 'Lịch chăm sóc sắp tới',
        message: 'Hôm nay 17:30: Dắt Bella đi dạo công viên và vận động.',
        type: NotificationType.SCHEDULE,
        isRead: true,
        link: '/schedule',
      },
      {
        userId: demoUser.id,
        title: 'Chào mừng bạn đến với PetCare AI!',
        message: 'Hệ thống đã sẵn sàng hỗ trợ bạn theo dõi sức khỏe và lịch trình chăm sóc cho Bella & Mimi.',
        type: NotificationType.SYSTEM,
        isRead: true,
        link: '/dashboard',
      },
    ],
  });

  // 11. Cuộc trò chuyện AI mẫu (AI Conversation)
  const conversation = await prisma.aIConversation.create({
    data: {
      userId: demoUser.id,
      petId: bella.id,
      title: 'Tư vấn chế độ dinh dưỡng và lịch tắm cho Bella',
      messages: {
        create: [
          {
            role: AIRole.USER,
            content: 'Chào bạn, Bella tuần này cần chăm sóc gì và tôi nên chú ý chế độ ăn uống của bé như thế nào?',
          },
          {
            role: AIRole.ASSISTANT,
            content: `Chào bạn Nguyễn Văn An! Dựa trên hồ sơ thực tế của bé Bella (Golden Retriever, 2 tuổi, cân nặng 24.5kg):

### 📋 Tóm tắt lịch chăm sóc tuần này
1. **Lịch hôm nay**: Uống men tiêu hóa vi sinh Bio-Lactic vào bữa sáng (đã hoàn thành) và đi dạo công viên lúc 17:30.
2. **Lịch thứ Sáu tuần này (15:00)**: Tắm và sấy khô lông cẩn thận để tránh ẩm ướt vùng tai (Bella từng có tiền sử viêm tai ngoài nhẹ).
3. **Cảnh báo vaccine**: Vaccine Dại Rabisin của Bella sẽ đến hạn tiêm nhắc lại trong vòng 14 ngày tới. Bạn nên đặt lịch sớm tại phòng khám thú y.

### 💡 Đề xuất dinh dưỡng & Chăm sóc
- Khẩu phần ăn hiện tại của Bella (24.5kg) là lý tưởng cho giống Golden Retriever ở độ tuổi này. Hãy tiếp tục duy trì 2 bữa/ngày kèm men vi sinh đường ruột.
- Luôn kiểm tra và lau khô kẽ tai bằng bông gạc sau khi Bella đi tắm hoặc chơi đùa ở vùng nước ngoài trời.

⚠️ *Lưu ý y tế: Thông tin do AI cung cấp chỉ nhằm mục đích tham khảo và không thay thế tư vấn, chẩn đoán hoặc điều trị của bác sĩ thú y.*`,
          },
        ],
      },
    },
  });

  console.log(`✅ Đã tạo cuộc hội thoại AI mẫu: ${conversation.id}`);
  console.log('🎉 Quá trình khởi tạo dữ liệu hoàn tất 100%!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
