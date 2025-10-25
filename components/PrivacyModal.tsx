import React from 'react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in-fast"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">Privacy Policy &amp; Terms of Service</h3>
        
        <div className="space-y-4 text-gray-700 dark:text-gray-300 overflow-y-auto pr-2">
            <p><strong className="text-gray-800 dark:text-gray-200">Use of Google Gemini API:</strong> This application utilizes the Google Gemini API for features such as script generation, AI-powered editing, and content tagging. Your interactions with these features are processed by Google.</p>
            
            <p><strong className="text-gray-800 dark:text-gray-200">API Key &amp; Charges:</strong> You are required to use your own Google Gemini API key. You are solely responsible for any and all charges incurred from the use of the API. This application does not cover any costs associated with your API usage.</p>
            
            <p><strong className="text-gray-800 dark:text-gray-200">Data Storage:</strong> This is a client-side application. All your scripts and your API key are stored locally in your browser's storage (<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm">localStorage</code>). No data is sent to or stored on any server owned or operated by the site owner. Your data remains in your control on your machine.</p>

            <p><strong className="text-gray-800 dark:text-gray-200">Data Ownership &amp; Google's Terms:</strong> The ownership of any data (prompts, scripts) processed by the Google Gemini API is governed by the Google Gemini API Terms and Conditions. We recommend you review their terms to understand how your data is handled.</p>

            <p><strong className="text-gray-800 dark:text-gray-200">Disclaimer:</strong> The AI-generated scripts are provided "as-is" without any warranties. Always review and test scripts thoroughly in a safe environment before using them in production.</p>
        </div>

        <div className="flex justify-end mt-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
