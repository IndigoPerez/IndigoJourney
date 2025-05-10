import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Trash2, 
  Edit, 
  Check, 
  AlertCircle, 
  Image as ImageIcon 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ItemDetailModal: React.FC = () => {
  const { state, setSelectedItem, updateItem, deleteItem } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(state.selectedItem);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  if (!state.selectedItem || !editedItem) return null;

  const handleClose = () => {
    setSelectedItem(null);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(state.selectedItem!.srefCode)
      .then(() => {
        toast.success('SREF code copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy SREF code');
      });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedItem(state.selectedItem);
    setIsEditing(false);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedItem(prev => prev ? { ...prev, [name]: value } : null);
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && editedItem && !editedItem.tags.includes(trimmedTag)) {
      setEditedItem(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tags: [...prev.tags, trimmedTag],
        };
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedItem(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove),
      };
    });
  };

  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!editedItem?.srefCode.trim()) {
      newErrors.srefCode = 'SREF code is required';
    }
    
    if (!editedItem?.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !editedItem) return;
    
    updateItem(editedItem);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(state.selectedItem!.id);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-neutral-800">
            {isEditing ? 'Edit Item' : 'Item Details'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row overflow-hidden">
          <div className="md:w-1/2 p-4 flex-shrink-0">
            {editedItem.imageUrl ? (
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={editedItem.imageUrl}
                  alt={editedItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Image+Error';
                  }}
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-300" />
              </div>
            )}
            {isEditing && (
              <div className="mt-4">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={editedItem.imageUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter image URL"
                />
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 p-4 overflow-y-auto">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="srefCode" className="block text-sm font-medium text-gray-700 mb-1">
                    SREF Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="srefCode"
                    name="srefCode"
                    value={editedItem.srefCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.srefCode ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    placeholder="Enter SREF code"
                  />
                  {errors.srefCode && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.srefCode}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editedItem.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    placeholder="Enter title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editedItem.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter description (optional)"
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
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagInputKeyDown}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Add tags (press Enter)"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {editedItem.tags.length > 0 && (
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
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">SREF Code</p>
                    <button
                      onClick={handleCopy}
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <p className="font-mono text-lg bg-gray-100 p-2 rounded mt-1 break-all">
                    {state.selectedItem.srefCode}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-semibold text-xl mt-1">{state.selectedItem.title}</p>
                </div>
                
                {state.selectedItem.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1 text-gray-700">{state.selectedItem.description}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Tags</p>
                  {state.selectedItem.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {state.selectedItem.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-400 italic">No tags</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Added on</p>
                  <p className="mt-1 text-gray-700">
                    {new Date(state.selectedItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;