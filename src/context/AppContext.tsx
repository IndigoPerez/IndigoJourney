import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { SrefItem, ViewMode } from '../types';
import toast from 'react-hot-toast';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  supabase: typeof supabase;
  user: User | null;
  signOut: () => Promise<void>;
}

const initialState: AppState = {
  items: [],
  searchQuery: '',
  selectedTags: [],
  viewMode: 'grid',
  selectedItem: null,
  isAddModalOpen: false,
};

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Load items from Supabase on initial render or when user changes
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('sref_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        dispatch({ type: 'SET_ITEMS', payload: data });
      } catch (error) {
        console.error('Error fetching items:', error);
        toast.error('Failed to load items');
      }
    };

    if (user) {
      fetchItems();
    } else {
      dispatch({ type: 'SET_ITEMS', payload: [] });
    }
  }, [user]);

  const addItem = async (newItemData: Omit<SrefItem, 'id' | 'createdAt'>) => {
    try {
      if (!user?.id) {
        throw new Error('User must be authenticated to add items');
      }

      const { data, error } = await supabase
        .from('sref_items')
        .insert([{
          sref_code: newItemData.srefCode,
          image_url: newItemData.imageUrl,
          title: newItemData.title,
          description: newItemData.description,
          tags: newItemData.tags,
          user_id: user.id // Explicitly set user_id to match the authenticated user's ID
        }])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_ITEM', payload: {
        id: data.id,
        srefCode: data.sref_code,
        imageUrl: data.image_url,
        title: data.title,
        description: data.description,
        tags: data.tags,
        createdAt: data.created_at,
      }});
      
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
      throw error;
    }
  };

  const updateItem = async (item: SrefItem) => {
    try {
      if (!user?.id) {
        throw new Error('User must be authenticated to update items');
      }

      const { error } = await supabase
        .from('sref_items')
        .update({
          sref_code: item.srefCode,
          image_url: item.imageUrl,
          title: item.title,
          description: item.description,
          tags: item.tags,
        })
        .eq('id', item.id)
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_ITEM', payload: item });
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      if (!user?.id) {
        throw new Error('User must be authenticated to delete items');
      }

      const { error } = await supabase
        .from('sref_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'DELETE_ITEM', payload: id });
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
        supabase,
        user,
        signOut,
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