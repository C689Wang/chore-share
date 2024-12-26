import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Chore } from '../models/chores';

interface ChoresState {
  selectedChoreId: string | null;
  filterStatus: 'all' | 'completed' | 'pending';
  sortBy: 'date' | 'title' | 'assignee';
  sortOrder: 'asc' | 'desc';
}

const initialState: ChoresState = {
  selectedChoreId: null,
  filterStatus: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
};

const choresSlice = createSlice({
  name: 'chores',
  initialState,
  reducers: {
    setSelectedChore: (state, action: PayloadAction<string | null>) => {
      state.selectedChoreId = action.payload;
    },
    setFilterStatus: (
      state,
      action: PayloadAction<'all' | 'completed' | 'pending'>
    ) => {
      state.filterStatus = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<'date' | 'title' | 'assignee'>
    ) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
  },
});

// // Selector to filter and sort chores
// export const selectFilteredChores = (
//   chores: Chore[] | undefined,
//   filterStatus: 'all' | 'completed' | 'pending',
//   sortBy: 'date' | 'title' | 'assignee',
//   sortOrder: 'asc' | 'desc'
// ) => {
//   if (!chores) return [];

//   let filteredChores = [...chores];

//   // Apply filters
//   if (filterStatus !== 'all') {
//     filteredChores = filteredChores.filter(
//       (chore) => chore.completed === (filterStatus === 'completed')
//     );
//   }

//   // Apply sorting
//   filteredChores.sort((a, b) => {
//     let comparison = 0;
//     switch (sortBy) {
//       case 'date':
//         comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//         break;
//       case 'title':
//         comparison = a.title.localeCompare(b.title);
//         break;
//       case 'assignee':
//         comparison = (a.assignedTo[0] || '').localeCompare(b.assignedTo[0] || '');
//         break;
//     }
//     return sortOrder === 'asc' ? comparison : -comparison;
//   });

//   return filteredChores;
// };

export const { setSelectedChore, setFilterStatus, setSortBy, setSortOrder } =
  choresSlice.actions;
export default choresSlice.reducer;
