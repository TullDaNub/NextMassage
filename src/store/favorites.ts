import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favoriteMasseuseIds: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteMasseuseIds: [],
      toggleFavorite: (id: string) => set((state) => {
        const isFav = state.favoriteMasseuseIds.includes(id)
        if (isFav) {
          return { favoriteMasseuseIds: state.favoriteMasseuseIds.filter(fId => fId !== id) }
        } else {
          return { favoriteMasseuseIds: [...state.favoriteMasseuseIds, id] }
        }
      }),
      isFavorite: (id: string) => get().favoriteMasseuseIds.includes(id),
    }),
    {
      name: 'qq-spa-favorites', // name of item in the storage (must be unique)
    }
  )
)
