import { useState } from 'react';
import ScoutRetailBot from './ScoutRetailBot';

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 shadow-xl">
          <ScoutRetailBot />
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-4 right-4 z-50 bg-white rounded-full shadow-lg p-3
                   hover:shadow-xl transition"
      >
        <img src="/assets/cookie-bot.svg" alt="Open Chat" className="h-8 w-8" />
      </button>
    </>
  );
}