import React, { useState } from 'react';
import type { Script } from '../types';
import { generateScriptAndMetadata } from '../services/geminiService';
import { MagicWandIcon, SaveIcon } from './Icons';
import CodeBlock from './CodeBlock';
import Tag from './Tag';

interface ScriptGeneratorProps {
  onSaveScript: (scriptData: Omit<Script, 'id' | 'createdAt'>) => void;
  model: string;
  apiKey: string;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ onSaveScript, model, apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedScript, setGeneratedScript] = useState<Omit<Script, 'id' | 'createdAt'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Please set your Gemini API key in the AI Settings (key icon in top right).');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a description for the script.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedScript(null);
    try {
      const result = await generateScriptAndMetadata(prompt, model, apiKey);
      setGeneratedScript(result);
    } catch (err) {
      if (err instanceof Error) {
          setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (generatedScript) {
      onSaveScript(generatedScript);
      setGeneratedScript(null);
      setPrompt('');
    }
  };

  return (
    <div className="p-4 md:p-8 pt-24 flex flex-col min-h-full">
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">PowerStash AI</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Describe the PowerShell script you need, and the AI will generate it for you.</p>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'a script to find all files larger than 1GB in a directory and export the list to a CSV'"
            className="w-full h-24 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="mt-3 w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <MagicWandIcon className="w-5 h-5" />
            <span>{isLoading ? 'Generating...' : 'Generate Script'}</span>
          </button>
        </div>
        {error && <p className="text-red-500 dark:text-red-400 mt-4">{error}</p>}
      </div>

      <div className="flex-grow mt-6 flex flex-col">
        {isLoading && (
          <div className="flex flex-col items-center justify-center flex-grow text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            <p className="mt-4">Generating your script...</p>
          </div>
        )}
        {generatedScript && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{generatedScript.title}</h3>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <SaveIcon className="w-5 h-5" />
                  <span>Save Script</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {generatedScript.tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            </div>
            <CodeBlock code={generatedScript.code} />
          </div>
        )}
        {!isLoading && !generatedScript && (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8">
                <div className="mb-8">
                    <i className="fa-solid fa-scroll text-6xl text-gray-300 dark:text-gray-600"></i>
                    <p className="mt-4 text-lg">Your generated script will appear here.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ScriptGenerator;
