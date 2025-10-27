import React, { useState, useEffect } from 'react';
import { KeyIcon } from './Icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string) => void;
  currentApiKey: string;
  currentModel: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentApiKey, currentModel }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-pro');

  useEffect(() => {
    setApiKey(currentApiKey);
    setModel(currentModel);
  }, [currentApiKey, currentModel, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey, model);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in-fast"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 border border-gray-200 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center mb-6">
          <KeyIcon className="w-6 h-6 mr-3 text-yellow-500 dark:text-yellow-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Settings</h3>
        </div>
        <div className="space-y-6">
            <div>
                 <label htmlFor="apiKeyInput" className="block text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Google Gemini API Key</label>
                 <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Your API key is stored securely in your browser's local storage and is never sent to any servers. Get your key from{' '}
                     <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Google AI Studio
                    </a>.
                 </p>
                <input
                    id="apiKeyInput"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            <div>
                <label htmlFor="modelSelect" className="block text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">AI Model</label>
                 <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Choose the Gemini model for generation and editing. 'Pro' is more capable, while 'Flash' is faster. Learn more on the{' '}
                    <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        official pricing page
                    </a>.
                </p>
                <select
                    id="modelSelect"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                    <option value="gemini-flash-latest">Gemini 2.0 Flash</option>
                    <option value="gemini-flash-lite-latest">Gemini 2.0 Flash-Lite</option>
                </select>
            </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
           <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
