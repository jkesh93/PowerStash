import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons';

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 rounded-lg overflow-hidden relative border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">PowerShell</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-sm bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 px-3 py-1 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto text-gray-800 dark:text-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;