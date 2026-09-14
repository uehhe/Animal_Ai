import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Pet } from '../types/index.js';
import { petApi } from '../services/pet.service.js';
import { useAuth } from './AuthContext.js';

interface PetContextType {
  pets: Pet[];
  selectedPetId: string | null;
  selectedPet: Pet | null;
  loading: boolean;
  selectPet: (id: string | null) => void;
  refreshPets: () => Promise<Pet[]>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(() => {
    return localStorage.getItem('petcare_selected_pet_id') || null;
  });
  const [loading, setLoading] = useState(false);

  const refreshPets = useCallback(async () => {
    if (!isAuthenticated) return [];
    setLoading(true);
    try {
      const data = await petApi.getPets();
      setPets(data);

      // Nếu chưa chọn thú cưng hoặc thú cưng đã chọn không tồn tại, tự động chọn thú cưng đầu tiên
      setSelectedPetId((curr) => {
        if (data.length > 0) {
          if (!curr || !data.some((p) => p.id === curr)) {
            localStorage.setItem('petcare_selected_pet_id', data[0].id);
            return data[0].id;
          }
          return curr;
        } else {
          localStorage.removeItem('petcare_selected_pet_id');
          return null;
        }
      });
      return data;
    } catch (err) {
      console.error('Lỗi tải danh sách thú cưng:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshPets();
    } else {
      setPets([]);
      setSelectedPetId(null);
    }
  }, [isAuthenticated, refreshPets]);

  const selectPet = (id: string | null) => {
    setSelectedPetId(id);
    if (id) {
      localStorage.setItem('petcare_selected_pet_id', id);
    } else {
      localStorage.removeItem('petcare_selected_pet_id');
    }
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId) || null;

  return (
    <PetContext.Provider
      value={{
        pets,
        selectedPetId,
        selectedPet,
        loading,
        selectPet,
        refreshPets,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet phải được sử dụng bên trong PetProvider');
  }
  return context;
};
