import React, { forwardRef } from 'react';
import { Tag, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface TagsMenuProps {
  onClose: () => void;
}

const TagsMenu = forwardRef<HTMLDivElement, TagsMenuProps>(({ onClose }, ref) => {
  const { getAllTags, state, toggleTagSelection, clearSelectedTags } = useAppContext();
  const allTags = getAllTags();

  return (
    <div
      ref={ref}
      className="absolute top-full mt-2 right-0 z-10 bg-white rounded-lg shadow-lg p-4 w-64 animate-fade-in"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-700 flex items-center">
          <Tag className="w-4 h-4 mr-1" />
          Filter by Tags
        </h3>
        {state.selectedTags.length > 0 && (
          <button
            onClick={clearSelectedTags}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>
      
      {allTags.length === 0 ? (
        <p className="text-gray-500 text-sm py-2">No tags available</p>
      ) : (
        <div className="max-h-60 overflow-y-auto">
          {allTags.map(tag => (
            <div
              key={tag}
              className={`
                flex items-center justify-between py-1.5 px-2 my-1 rounded cursor-pointer
                ${state.selectedTags.includes(tag) ? 'bg-blue-50' : 'hover:bg-gray-50'}
              `}
              onClick={() => toggleTagSelection(tag)}
            >
              <span className="text-sm truncate">{tag}</span>
              {state.selectedTags.includes(tag) && (
                <X className="w-4 h-4 text-blue-700" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

TagsMenu.displayName = 'TagsMenu';

export default TagsMenu;