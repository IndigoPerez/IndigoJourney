import { SrefItem } from '../types';
import toast from 'react-hot-toast';

const LOCAL_STORAGE_KEY = 'sref-gallery-items';

export const exportData = (): void => {
  try {
    const items = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (!items) {
      toast.error('No data to export');
      return;
    }
    
    // Create a blob with the JSON data
    const blob = new Blob([items], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `sref-codes-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast.success('Data exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export data');
  }
};

export const importData = (): void => {
  try {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      
      const file = target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const parsedData = JSON.parse(result) as SrefItem[];
          
          // Validate the data structure
          if (!Array.isArray(parsedData)) {
            throw new Error('Invalid data format');
          }
          
          for (const item of parsedData) {
            if (!item.id || !item.srefCode || !item.title || !Array.isArray(item.tags)) {
              throw new Error('Invalid data structure');
            }
          }
          
          // Save to localStorage
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedData));
          
          // Reload the page to refresh the data
          window.location.reload();
          
          toast.success('Data imported successfully');
        } catch (parseError) {
          console.error('Parse error:', parseError);
          toast.error('Failed to parse import file');
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read import file');
      };
      
      reader.readAsText(file);
    });
    
    // Trigger file selection
    fileInput.click();
  } catch (error) {
    console.error('Import failed:', error);
    toast.error('Failed to import data');
  }
};