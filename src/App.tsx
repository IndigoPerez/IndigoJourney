import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Gallery from './components/Gallery';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function AppContent() {
  useKeyboardShortcuts();
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Toaster position="bottom-right" />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Gallery />
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;