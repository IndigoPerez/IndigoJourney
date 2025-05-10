import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { SrefItem, ViewMode } from '../types';
import toast from 'react-hot-toast';

interface AppState {
  items: SrefItem[];
  searchQuery: string;
  selectedTags: string[];
  viewMode: ViewMode;
  selectedItem: SrefItem | null;
  isAddModalOpen: boolean;
}

type AppAction =
  | { type: 'SET_ITEMS'; payload: SrefItem[] }
  | { type: 'ADD_ITEM'; payload: SrefItem }
  | { type: 'UPDATE_ITEM'; payload: SrefItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_TAG_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTED_TAGS' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SELECTED_ITEM'; payload: SrefItem | null }
  | { type: 'TOGGLE_ADD_MODAL' };

interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addItem: (item: Omit<SrefItem, 'id' | 'createdAt'>) => void;
  updateItem: (item: SrefItem) => void;
  deleteItem: (id: string) => void;
  searchItems: (query: string) => void;
  toggleTagSelection: (tag: string) => void;
  clearSelectedTags: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedItem: (item: SrefItem | null) => void;
  toggleAddModal: () => void;
  getAllTags: () => string[];
  filteredItems: SrefItem[];
}

const initialState: AppState = {
  items: [],
  searchQuery: '',
  selectedTags: [],
  viewMode: 'grid',
  selectedItem: null,
  isAddModalOpen: false,
};

const LOCAL_STORAGE_KEY = 'sref-gallery-items';

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id ? action.payload : item
        ),
        selectedItem: state.selectedItem?.id === action.payload.id ? 
          action.payload : state.selectedItem,
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        selectedItem: state.selectedItem?.id === action.payload ? 
          null : state.selectedItem,
      };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'TOGGLE_TAG_SELECTION':
      return {
        ...state,
        selectedTags: state.selectedTags.includes(action.payload)
          ? state.selectedTags.filter(tag => tag !== action.payload)
          : [...state.selectedTags, action.payload],
      };
    case 'CLEAR_SELECTED_TAGS':
      return { ...state, selectedTags: [] };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SELECTED_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'TOGGLE_ADD_MODAL':
      return { ...state, isAddModalOpen: !state.isAddModalOpen };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Load items from localStorage on initial render
    const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedItems) {
      try {
        dispatch({ type: 'SET_ITEMS', payload: JSON.parse(savedItems) });
      } catch (error) {
        console.error('Failed to parse saved items:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save items to localStorage whenever they change
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (newItemData: Omit<SrefItem, 'id' | 'createdAt'>) => {
    const newItem: SrefItem = {
      ...newItemData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    toast.success('Item added successfully');
  };

  const updateItem = (item: SrefItem) => {
    dispatch({ type: 'UPDATE_ITEM', payload: item });
    toast.success('Item updated successfully');
  };

  const deleteItem = (id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
    toast.success('Item deleted successfully');
  };

  const searchItems = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const toggleTagSelection = (tag: string) => {
    dispatch({ type: 'TOGGLE_TAG_SELECTION', payload: tag });
  };

  const clearSelectedTags = () => {
    dispatch({ type: 'CLEAR_SELECTED_TAGS' });
  };

  const setViewMode = (mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const setSelectedItem = (item: SrefItem | null) => {
    dispatch({ type: 'SET_SELECTED_ITEM', payload: item });
  };

  const toggleAddModal = () => {
    dispatch({ type: 'TOGGLE_ADD_MODAL' });
  };

  const getAllTags = (): string[] => {
    const tagsSet = new Set<string>();
    state.items.forEach(item => {
      item.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  };

  // Filter items based on search query and selected tags
  const filteredItems = state.items.filter(item => {
    // Check if item matches search query
    const matchesSearch = state.searchQuery === '' || 
      item.srefCode.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()));
    
    // Check if item has all selected tags
    const matchesTags = state.selectedTags.length === 0 || 
      state.selectedTags.every(tag => item.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        updateItem,
        deleteItem,
        searchItems,
        toggleTagSelection,
        clearSelectedTags,
        setViewMode,
        setSelectedItem,
        toggleAddModal,
        getAllTags,
        filteredItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};