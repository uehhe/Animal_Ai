import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/response.js';
import { Species, HealthStatus, Gender, Prisma } from '@prisma/client';

export interface PetFilterQuery {
  search?: string;
  species?: Species;
  healthStatus?: HealthStatus;
}

export class PetService {
  async getPets(userId: string, filters?: PetFilterQuery) {
    const where: Prisma.PetWhereInput = {
      userId,
      ...(filters?.species && { species: filters.species }),
      ...(filters?.healthStatus && { healthStatus: filters.healthStatus }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { breed: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.pet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            careSchedules: true,
            vaccinations: true,
            medications: true,
            healthRecords: true,
            diaries: true,
          },
        },
      },
    });
  }

  async getPetById(userId: string, petId: string, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        healthRecords: { orderBy: { date: 'desc' }, take: 10 },
        vaccinations: { orderBy: { administeredDate: 'desc' } },
        medications: { orderBy: { startDate: 'desc' } },
        careSchedules: { orderBy: { scheduledDate: 'desc' }, take: 10 },
        diaries: { orderBy: { date: 'desc' }, take: 5 },
      },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thông tin thú cưng.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền truy cập dữ liệu của thú cưng này.', 403);
    }

    return pet;
  }

  async createPet(userId: string, data: {
    name: string;
    species: Species;
    breed: string;
    gender?: Gender;
    birthDate?: string | null;
    age?: number | null;
    weight?: number | null;
    color?: string | null;
    avatar?: string | null;
    microchipId?: string | null;
    healthStatus?: HealthStatus;
    notes?: string | null;
  }) {
    // Default avatar if none provided
    let avatarUrl = data.avatar;
    if (!avatarUrl) {
      avatarUrl = data.species === 'CAT'
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';
    }

    return prisma.pet.create({
      data: {
        userId,
        name: data.name.trim(),
        species: data.species,
        breed: data.breed.trim(),
        gender: data.gender || 'UNKNOWN',
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        age: data.age ?? null,
        weight: data.weight ?? null,
        color: data.color?.trim() ?? null,
        avatar: avatarUrl,
        microchipId: data.microchipId?.trim() ?? null,
        healthStatus: data.healthStatus || 'HEALTHY',
        notes: data.notes?.trim() ?? null,
      },
    });
  }

  async updatePet(userId: string, petId: string, data: Partial<{
    name: string;
    species: Species;
    breed: string;
    gender: Gender;
    birthDate?: string | null;
    age?: number | null;
    weight?: number | null;
    color?: string | null;
    avatar?: string | null;
    microchipId?: string | null;
    healthStatus?: HealthStatus;
    notes?: string | null;
  }>, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thú cưng cần cập nhật.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền chỉnh sửa thú cưng này.', 403);
    }

    return prisma.pet.update({
      where: { id: petId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.species && { species: data.species }),
        ...(data.breed && { breed: data.breed.trim() }),
        ...(data.gender && { gender: data.gender }),
        ...(data.birthDate !== undefined && { birthDate: data.birthDate ? new Date(data.birthDate) : null }),
        ...(data.age !== undefined && { age: data.age }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.color !== undefined && { color: data.color?.trim() ?? null }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.microchipId !== undefined && { microchipId: data.microchipId?.trim() ?? null }),
        ...(data.healthStatus && { healthStatus: data.healthStatus }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() ?? null }),
      },
    });
  }

  async deletePet(userId: string, petId: string, isAdmin = false) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new AppError('Không tìm thấy thú cưng để xóa.', 404);
    }

    if (!isAdmin && pet.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa thú cưng này.', 403);
    }

    await prisma.pet.delete({
      where: { id: petId },
    });

    return { message: 'Đã xóa thú cưng thành công.' };
  }
}

export const petService = new PetService();
