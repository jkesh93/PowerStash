import React from 'react';

interface DiffPart {
  type: 'added' | 'removed' | 'common';
  value: string;
}

const createDiff = (oldLines: string[], newLines: string[]): DiffPart[] => {
    const matrix = Array(oldLines.length + 1).fill(null).map(() => Array(newLines.length + 1).fill(0));
    for (let i = 1; i <= oldLines.length; i++) {
        for (let j = 1; j <= newLines.length; j++) {
            if (oldLines[i - 1] === newLines[j - 1]) {
                matrix[i][j] = 1 + matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
            }
        }
    }

    const diff: DiffPart[] = [];
    let i = oldLines.length;
    let j = newLines.length;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            diff.unshift({ type: 'common', value: oldLines[i - 1] });
            i--; j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
            diff.unshift({ type: 'added', value: newLines[j - 1] });
            j--;
        } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
            diff.unshift({ type: 'removed', value: oldLines[i - 1] });
            i--;
        } else {
            break;
        }
    }
    return diff;
};

interface DiffViewerProps {
  oldCode: string;
  newCode: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldCode, newCode }) => {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const diff = createDiff(oldLines, newLines);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 font-mono text-sm">
      <pre className="p-4 overflow-x-auto">
        <code>
          {diff.map((part, index) => {
            let bgClass = '';
            let symbol = '  ';
            if (part.type === 'added') {
              bgClass = 'bg-green-100 dark:bg-green-900/40';
              symbol = '+ ';
            } else if (part.type === 'removed') {
              bgClass = 'bg-red-100 dark:bg-red-900/40';
              symbol = '- ';
            }
            return (
              <div key={index} className={`${bgClass} flex`}>
                <span className="w-6 text-center select-none flex-shrink-0 text-gray-500">{symbol}</span>
                <span className="flex-grow">{part.value}</span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
};

export default DiffViewer;
