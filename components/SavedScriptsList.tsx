import React, { useState, useMemo } from 'react';
import type { Script } from '../types';
import { PlusIcon, TrashIcon, DownloadIcon, UploadIcon } from './Icons';
import Tag from './Tag';
import ConfirmationModal from './ConfirmationModal';

interface SavedScriptsListProps {
  scripts: Script[];
  selectedScriptId: string | null;
  onSelectScript: (script: Script) => void;
  onDeleteScript: (scriptId: string) => void;
  onNewScript: () => void;
  onDownloadScripts: (scriptIds: string[]) => void;
  onUploadFolder: () => void;
  isUploading: boolean;
  uploadError: string | null;
}

const SavedScriptsList: React.FC<SavedScriptsListProps> = ({
  scripts,
  selectedScriptId,
  onSelectScript,
  onDeleteScript,
  onNewScript,
  onDownloadScripts,
  onUploadFolder,
  isUploading,
  uploadError
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scriptToDelete, setScriptToDelete] = useState<Script | null>(null);
  const [selectedForDownload, setSelectedForDownload] = useState<Set<string>>(new Set());

  const filteredScripts = useMemo(() => {
    if (!searchTerm) return scripts;
    const lowercasedFilter = searchTerm.toLowerCase();
    return scripts.filter(
      (script) =>
        script.title.toLowerCase().includes(lowercasedFilter) ||
        script.tags.some((tag) => tag.toLowerCase().includes(lowercasedFilter))
    );
  }, [scripts, searchTerm]);
  
  const sortedScripts = useMemo(() => {
    return [...filteredScripts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredScripts]);

  const handleConfirmDelete = () => {
    if (scriptToDelete) {
      onDeleteScript(scriptToDelete.id);
      setScriptToDelete(null);
    }
  };
  
  const handleToggleSelection = (scriptId: string) => {
    setSelectedForDownload(prev => {
        const newSet = new Set(prev);
        if (newSet.has(scriptId)) {
            newSet.delete(scriptId);
        } else {
            newSet.add(scriptId);
        }
        return newSet;
    });
  };

  const handleDownloadClick = () => {
    onDownloadScripts(Array.from(selectedForDownload));
    setSelectedForDownload(new Set());
  };


  return (
    <div className="bg-white dark:bg-gray-950 h-full flex flex-col border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Stash</h2>
        <input
          type="text"
          placeholder="Filter by title or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        {sortedScripts.length > 0 ? (
          <ul>
            {sortedScripts.map((script) => (
              <li key={script.id} className="flex items-center border-b border-gray-200 dark:border-gray-800 group transition-colors hover:bg-gray-100 dark:hover:bg-gray-900">
                <div className="pl-4">
                  <input
                    type="checkbox"
                    checked={selectedForDownload.has(script.id)}
                    onChange={() => handleToggleSelection(script.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    aria-label={`Select script ${script.title}`}
                  />
                </div>
                <div
                  onClick={() => onSelectScript(script)}
                  className={`flex-grow cursor-pointer p-4 ${ selectedScriptId === script.id ? 'bg-gray-100 dark:bg-gray-800' : '' }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className={`font-semibold ${selectedScriptId === script.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}>
                        {script.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {script.tags.slice(0, 3).map((tag) => <Tag key={tag} label={tag} />)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setScriptToDelete(script);
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full"
                      aria-label={`Delete ${script.title}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>No scripts found.</p>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <button
          onClick={onNewScript}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Script</span>
        </button>
         <button
          onClick={onUploadFolder}
          disabled={isUploading}
          className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-wait"
        >
          <UploadIcon className="w-5 h-5" />
          <span>{isUploading ? 'Processing...' : 'Upload Folder'}</span>
        </button>
        {uploadError && <p className="text-red-500 dark:text-red-400 text-xs text-center pt-1">{uploadError}</p>}
      </div>
       <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
            onClick={handleDownloadClick}
            disabled={selectedForDownload.size === 0}
            className="w-full flex items-center justify-center space-x-2 text-sm text-white bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            <DownloadIcon className="w-4 h-4" />
            <span>Download Selected ({selectedForDownload.size})</span>
        </button>
      </div>
      <ConfirmationModal
        isOpen={!!scriptToDelete}
        onClose={() => setScriptToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Script"
        message={`Are you sure you want to permanently delete "${scriptToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default SavedScriptsList;