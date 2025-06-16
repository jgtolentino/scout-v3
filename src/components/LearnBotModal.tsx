import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { LearnBotPanel } from './learnbot/LearnBotPanel';

interface LearnBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LearnBotModal: React.FC<LearnBotModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-auto p-0">
          <LearnBotPanel />
        </div>
      </div>
    </Dialog>
  );
};

export default LearnBotModal;
