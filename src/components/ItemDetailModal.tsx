import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Trash2, 
  Edit, 
  Check, 
  AlertCircle, 
  ImageOff
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ItemDetailModal: React.FC = () => {
  const { state, setSelectedItem, updateItem, deleteItem, user } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(state.selectedItem);
  const [tagInput, setTagInput] = useState('');

  if (!state.selectedItem) return null;

  const handleClose = () => {
    setSelectedItem(null);
    setIsEditing(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(state.selectedItem.srefCode);
    toast.success('SREF code copied to clipboard');
  };

  const handleDelete = async () => {
    try {
      await deleteItem(state.selectedItem.id);
      handleClose();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = () => {
    setEditedItem(state.selectedItem);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!editedItem) return;
      await updateItem(editedItem);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedItem) return;
    const { name, value } = e.target;
    setEditedItem({ ...editedItem, [name]: value });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && editedItem) {
      e.preventDefault();
      const newTags = Array.isArray(editedItem.tags) ? [...editedItem.tags] : [];
      if (!newTags.includes(tagInput.trim())) {
        setEditedItem({
          ...editedItem,
          tags: [...newTags, tagInput.trim()]
        });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (!editedItem) return;
    setEditedItem({
      ...editedItem,
      tags: editedItem.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const canEdit = user?.id === state.selectedItem.userId;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-neutral-800">
            {isEditing ? 'Edit SREF Code' : state.selectedItem.srefCode}
          </h2>
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <>
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={handleCopyCode}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy SREF code"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isEditing ? (
            <form className="space-y-4">
              <div>
                <label htmlFor="srefCode" className="block text-sm font-medium text-gray-700 mb-1">
                  SREF Code
                </label>
                <input
                  type="text"
                  id="srefCode"
                  name="srefCode"
                  value={editedItem?.srefCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editedItem?.title || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editedItem?.description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={editedItem?.imageUrl || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Add tags (press Enter)"
                  />
                </div>
                {editedItem?.tags && editedItem.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editedItem.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-700 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video relative overflow-hidden bg-gray-100 rounded-lg">
                {state.selectedItem.imageUrl ? (
                  <img
                    src={state.selectedItem.imageUrl}
                    alt={state.selectedItem.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Error';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{state.selectedItem.title}</h3>
                <p className="mt-2 text-gray-600">{state.selectedItem.description}</p>
              </div>
              
              {Array.isArray(state.selectedItem.tags) && state.selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {state.selectedItem.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {isEditing && (
          <div className="flex justify-end p-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mr-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailModal;