import React from 'react';
import type { Script } from '../types';
import CodeBlock from './CodeBlock';
import Tag from './Tag';
import { DownloadIcon, PencilIcon } from './Icons';

interface ScriptViewerProps {
  script: Script;
  onDownload: (scriptId: string) => void;
  onEdit: (script: Script) => void;
}

const ScriptViewer: React.FC<ScriptViewerProps> = ({ script, onDownload, onEdit }) => {
  return (
    <div className="p-4 md:p-8 pt-24 animate-fade-in flex flex-col min-h-full">
       <div className="flex-shrink-0">
            <div className="flex items-center mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{script.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Created on: {new Date(script.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center space-x-2 ml-auto mr-[100px] relative top-[1px]">
                    <button
                      onClick={() => onEdit(script)}
                      className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                      <span>Edit with AI</span>
                    </button>
                    <button
                      onClick={() => onDownload(script.id)}
                      className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span>Download</span>
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 my-6">
                {script.tags.map((tag) => <Tag key={tag} label={tag} />)}
            </div>
       </div>
       <div className="flex-grow">
          <CodeBlock code={script.code} />
       </div>
    </div>
  );
};

export default ScriptViewer;