import React from 'react';

interface TagProps {
  label: string;
}

const Tag: React.FC<TagProps> = ({ label }) => {
  return (
    <span className="inline-block bg-indigo-100 text-indigo-800 dark:bg-gray-700 dark:text-indigo-300 text-xs font-mono px-2 py-1 rounded-full">
      #{label}
    </span>
  );
};

export default Tag;