import React from 'react';
import { CoffeeIcon, GithubIcon, LicenseIcon } from './Icons';

interface FooterProps {
  onPrivacyClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onPrivacyClick }) => {
  return (
    <footer className="flex-shrink-0 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-[17.5px] text-xs text-gray-600 dark:text-gray-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <button 
          onClick={onPrivacyClick}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Privacy &amp; Terms
        </button>
        <div className="flex items-center space-x-6 flex-shrink-0">
           <a 
            href="https://www.gnu.org/licenses/agpl-3.0.html" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center space-x-2"
          >
            <LicenseIcon className="text-lg"/>
            <span>GNU AGPLv3 License</span>
          </a>
          <a 
            href="https://buymeacoffee.com/jay1118936" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center space-x-2"
          >
            <CoffeeIcon className="text-lg"/>
            <span>Support this project</span>
          </a>
          <a 
            href="https://github.com/jkesh93/PowerStash" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center space-x-2"
          >
            <GithubIcon className="text-lg"/>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;