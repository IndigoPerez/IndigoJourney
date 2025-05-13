import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Tag, Grid, List, Download, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AddItemModal from './AddItemModal';
import TagsMenu from './TagsMenu';
import Auth from './Auth';
import { exportData, importData } from '../utils/dataUtils';

const Header: React.FC = () => {
  const { 
    state, 
    searchItems, 
    toggleAddModal, 
    setViewMode,
    user,
  } = useAppContext();
  
  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false);
  const tagsButtonRef = useRef<HTMLButtonElement>(null);
  const tagsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isTagsMenuOpen &&
        tagsMenuRef.current &&
        tagsButtonRef.current &&
        !tagsMenuRef.current.contains(event.target as Node) &&
        !tagsButtonRef.current.contains(event.target as Node)
      ) {
        setIsTagsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isTagsMenuOpen]);

  const toggleTagsMenu = () => {
    setIsTagsMenuOpen(!isTagsMenuOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchItems(e.target.value);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-2xl font-bold text-neutral-800">SREF Code Gallery</h1>
            <div className="md:hidden">
              <Auth />
            </div>
          </div>
          
          <div className="w-full md:w-auto flex flex-1 md:flex-initial flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-64 lg:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Search codes, tags..."
                value={state.searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center">
                <button
                  ref={tagsButtonRef}
                  onClick={toggleTagsMenu}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                  aria-label="Filter by tags"
                >
                  <Tag className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Tags</span>
                  {state.selectedTags.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {state.selectedTags.length}
                    </span>
                  )}
                </button>
                {isTagsMenuOpen && <TagsMenu ref={tagsMenuRef} onClose={() => setIsTagsMenuOpen(false)} />}
              </div>
              
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    state.viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  } transition-colors`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    state.viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  } transition-colors`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={exportData}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Export data"
                  title="Export data"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={importData}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Import data"
                  title="Import data"
                >
                  <Upload className="w-5 h-5" />
                </button>
                {user && (
                  <button
                    onClick={toggleAddModal}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                )}
              </div>
              <div className="hidden md:block">
                <Auth />
              </div>
            </div>
          </div>
        </div>
      </div>
      {state.isAddModalOpen && <AddItemModal />}
    </header>
  );
};

export default Header;