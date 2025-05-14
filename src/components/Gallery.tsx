import React from 'react';
import { ImageOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ItemDetailModal from './ItemDetailModal';

const Gallery: React.FC = () => {
  const { state, filteredItems, setSelectedItem } = useAppContext();

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <ImageOff className="w-16 h-16 mb-4" />
        <p className="text-xl font-medium">No items found</p>
        {state.searchQuery || state.selectedTags.length > 0 ? (
          <p className="mt-2">Try adjusting your search or filters</p>
        ) : (
          <p className="mt-2">Add your first SREF code to get started</p>
        )}
      </div>
    );
  }

  if (state.viewMode === 'grid') {
    return (
      <>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Image+Error';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-medium truncate">{item.srefCode}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-neutral-800 truncate">{item.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(Array.isArray(item.tags) ? item.tags.slice(0, 3) : []).map(tag => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {Array.isArray(item.tags) && item.tags.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {state.selectedItem && <ItemDetailModal />}
      </>
    );
  }

  // List view
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b bg-gray-50 font-medium text-gray-700">
          <div className="w-16 text-center">Image</div>
          <div>Details</div>
          <div className="w-32 text-center">SREF Code</div>
        </div>
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer items-center"
          >
            <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=Error';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ImageOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-neutral-800 truncate">{item.title}</h3>
              <p className="text-sm text-gray-500 truncate">{item.description}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(Array.isArray(item.tags) ? item.tags.slice(0, 3) : []).map(tag => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {Array.isArray(item.tags) && item.tags.length > 3 && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
            <div className="w-32 text-center">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{item.srefCode}</span>
            </div>
          </div>
        ))}
      </div>
      {state.selectedItem && <ItemDetailModal />}
    </>
  );
};

export default Gallery;