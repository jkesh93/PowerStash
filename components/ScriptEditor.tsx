import React, { useState } from 'react';
import { editScript } from '../services/geminiService';
import type { Script } from '../types';
import DiffViewer from './DiffViewer';
import CodeBlock from './CodeBlock';
import { MagicWandIcon, SaveIcon } from './Icons';

interface ScriptEditorProps {
    script: Script;
    onUpdateScript: (scriptId: string, newCode: string) => void;
    onCancel: () => void;
    model: string;
    onApiKeyError: () => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ script, onUpdateScript, onCancel, model, onApiKeyError }) => {
    const [editPrompt, setEditPrompt] = useState('');
    const [newCode, setNewCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleGenerateEdits = async () => {
        if (!editPrompt.trim()) {
            setError('Please describe the changes you want to make.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setNewCode(null);
        try {
            const result = await editScript(script.code, editPrompt, model);
            setNewCode(result.code);
        } catch (err) {
            if (err instanceof Error) {
                if (err.message === 'API_KEY_ERROR') {
                    onApiKeyError();
                    setError("There's an issue with your API key. Please select a valid one.");
                } else {
                    setError(err.message);
                }
            } else {
                setError('An unknown error occurred while generating edits.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAcceptChanges = () => {
        if (newCode) {
            onUpdateScript(script.id, newCode);
        }
    };

    return (
        <div className="p-4 md:p-8 pt-24 flex flex-col min-h-full">
            <div className="flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Script: <span className="text-indigo-500 dark:text-indigo-400">{script.title}</span></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Describe the changes you want to make to the script.</p>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g., 'Add error handling for the file path' or 'Refactor the loop into a reusable function'"
                        className="w-full h-20 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                        disabled={isLoading}
                    />
                    <div className="flex items-center space-x-4 mt-3">
                        <button
                            onClick={handleGenerateEdits}
                            disabled={isLoading}
                            className="flex-grow flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <MagicWandIcon className="w-5 h-5" />
                            <span>{isLoading ? 'Generating...' : 'Generate Edits'}</span>
                        </button>
                         <button
                            onClick={onCancel}
                            className="px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
                 {error && <p className="text-red-500 dark:text-red-400 mt-4">{error}</p>}
            </div>
            <div className="flex-grow mt-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
                        <p className="mt-4">Applying AI edits...</p>
                    </div>
                )}
                {newCode && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Suggested Changes</h3>
                             <button
                                onClick={handleAcceptChanges}
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                <SaveIcon className="w-5 h-5" />
                                <span>Accept Changes</span>
                            </button>
                        </div>
                        <DiffViewer oldCode={script.code} newCode={newCode} />
                    </div>
                )}
                {!newCode && !isLoading && (
                    <div className="space-y-4">
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white">Current Script</h3>
                         <CodeBlock code={script.code} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScriptEditor;