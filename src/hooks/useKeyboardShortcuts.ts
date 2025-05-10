import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export function useKeyboardShortcuts() {
  const { toggleAddModal, state, setSelectedItem } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if no input elements are active
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      // Add new item with "n" key
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !state.isAddModalOpen && !state.selectedItem) {
        e.preventDefault();
        toggleAddModal();
      }

      // Close detail modal with Escape key
      if (e.key === 'Escape' && state.selectedItem) {
        e.preventDefault();
        setSelectedItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleAddModal, state.isAddModalOpen, state.selectedItem, setSelectedItem]);
}