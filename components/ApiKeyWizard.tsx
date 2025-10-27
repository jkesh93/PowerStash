import React from 'react';
import { KeyIcon } from './Icons';

interface ApiKeyWizardProps {
  onClose: () => void;
}

const ApiKeyWizard: React.FC<ApiKeyWizardProps> = ({ onClose }) => {

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        onClose(); // Optimistically close on success
      } catch (e) {
        console.error("Error opening API key selection:", e);
        // Maybe show an error to the user here
      }
    } else {
      alert("API key selection is not available in this environment.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg m-4 border border-gray-200 dark:border-gray-700 text-center"
      >
        <KeyIcon className="w-12 h-12 mx-auto mb-4 text-yellow-500 dark:text-yellow-400" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to PowerStash AI</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
            To power the AI features, this application requires a Google Gemini API key. Please select a project to get started.
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-xs mt-4">
            By proceeding, you acknowledge that you are responsible for any costs associated with API usage. For more information, see the{' '}
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                billing documentation
            </a>.
        </p>

        <div className="mt-8">
          <button
            onClick={handleSelectKey}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
          >
            Select API Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyWizard;
