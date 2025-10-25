import React, { useState, useEffect } from 'react';
import { KeyIcon } from './Icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey: string | null;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentApiKey, selectedModel, onModelChange }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(currentApiKey || '');
    }
  }, [isOpen, currentApiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKeyInput);
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
        <div className="flex items-center mb-4">
          <KeyIcon className="w-6 h-6 mr-3 text-yellow-500 dark:text-yellow-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Settings</h3>
        </div>
        <div className="space-y-4">
            <div>
                <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gemini API Key</label>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                    Get your key from{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Google AI Studio
                    </a>.
                </p>
                <input
                  id="apiKeyInput"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div>
                <label htmlFor="modelSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Model</label>
                 <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                    Learn about models and pricing at the{' '}
                    <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        official pricing page
                    </a>.
                </p>
                <select
                    id="modelSelect"
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                    <option value="gemini-flash-latest">Gemini 2.0 Flash</option>
                    <option value="gemini-flash-lite-latest">Gemini 2.0 Flash-Lite</option>
                </select>
            </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;