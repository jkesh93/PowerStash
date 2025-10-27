import React, { useState, useEffect, useCallback, useRef } from 'react';
import SavedScriptsList from './components/SavedScriptsList';
import ScriptGenerator from './components/ScriptGenerator';
import type { Script } from './types';
import ScriptViewer from './components/ScriptViewer';
import ScriptEditor from './components/ScriptEditor';
import { analyzeScriptContent } from './services/geminiService';
import JSZip from 'jszip';
import { SunIcon, MoonIcon, KeyIcon, MagicWandIcon } from './components/Icons';
import SettingsModal from './components/SettingsModal';
import ApiKeyWizard from './components/ApiKeyWizard';
import Footer from './components/Footer';
import PrivacyModal from './components/PrivacyModal';
import AiAssistant from './components/AiAssistant';


const LOCAL_STORAGE_KEY = 'powershell_scripts';
const THEME_STORAGE_KEY = 'theme_preference';
const MODEL_STORAGE_KEY = 'gemini_model';


export type Theme = 'light' | 'dark';

const sanitizeFilename = (title: string): string => {
  const sanitized = title
    .toLowerCase()
    .replace(/['"]/g, '') 
    .replace(/[^a-z0-9_]+/g, '_') 
    .replace(/^_+|_+$/g, ''); 
  return `${sanitized || 'script'}.ps1`;
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


const App: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [model, setModel] = useState<string>('gemini-2.5-pro');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showApiKeyWizard, setShowApiKeyWizard] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      // Load scripts
      const storedScripts = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedScripts) {
        setScripts(JSON.parse(storedScripts));
      }

      // Load theme
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
      
      // Check for API Key
      const checkApiKey = async () => {
        // @ts-ignore - aistudio is injected by the environment
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            // @ts-ignore
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setShowApiKeyWizard(true);
            }
        } else {
            console.warn("aistudio context not available. API key selection may not work.");
        }
      };
      checkApiKey();
      
      // Load Model
      const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      if (storedModel) {
        setModel(storedModel);
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      // Save scripts
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scripts));
    } catch (error) {
      console.error("Failed to save scripts to localStorage", error);
    }
  }, [scripts]);

  useEffect(() => {
      // Apply theme
      const root = window.document.documentElement;
      root.classList.remove(theme === 'dark' ? 'light' : 'dark');
      root.classList.add(theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);
  
  const handleSaveModel = (newModel: string) => {
    setModel(newModel);
    localStorage.setItem(MODEL_STORAGE_KEY, newModel);
  };
  
  const handleSaveScript = useCallback((scriptData: Omit<Script, 'id' | 'createdAt'>) => {
    const newScript: Script = {
      ...scriptData,
      id: `script_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedScripts = [newScript, ...scripts];
    setScripts(updatedScripts);
    setSelectedScript(newScript);
    setEditingScript(null);
  }, [scripts]);

  const handleDeleteScript = useCallback((scriptId: string) => {
    setScripts((prevScripts) => prevScripts.filter((s) => s.id !== scriptId));
    if (selectedScript?.id === scriptId) {
      setSelectedScript(null);
    }
    if (editingScript?.id === scriptId) {
      setEditingScript(null);
    }
  }, [selectedScript, editingScript]);

  const handleUpdateScript = useCallback((scriptId: string, newCode: string) => {
    setScripts(prevScripts =>
        prevScripts.map(s =>
            s.id === scriptId ? { ...s, code: newCode } : s
        )
    );
    setSelectedScript(prev => prev ? { ...prev, code: newCode } : null);
    setEditingScript(null);
  }, []);

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script);
    setEditingScript(null);
  };

  const handleNewScript = () => {
    setSelectedScript(null);
    setEditingScript(null);
  };

  const handleStartEditing = (script: Script) => {
    setEditingScript(script);
  };

  const handleCancelEditing = () => {
    setEditingScript(null);
  };

  const handleDownloadScripts = useCallback(async (scriptIds: string[]) => {
    const scriptsToDownload = scripts.filter(s => scriptIds.includes(s.id));
    if (scriptsToDownload.length === 0) return;

    if (scriptsToDownload.length === 1) {
        const script = scriptsToDownload[0];
        const filename = sanitizeFilename(script.title);
        const blob = new Blob([script.code], { type: 'text/plain;charset=utf-8' });
        triggerDownload(blob, filename);
    } else {
        const zip = new JSZip();
        scriptsToDownload.forEach(script => {
            const filename = sanitizeFilename(script.title);
            zip.file(filename, script.code);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        triggerDownload(zipBlob, 'powershell_scripts.zip');
    }
  }, [scripts]);

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleTriggerUpload = () => {
    folderInputRef.current?.click();
  };

  const handleApiKeyError = useCallback(() => {
    setShowApiKeyWizard(true);
  }, []);

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // @ts-ignore
    const hasKey = window.aistudio && await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setUploadError("Please select a Gemini API key before uploading scripts.");
      setShowApiKeyWizard(true);
      if (event.target) event.target.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    // FIX: Add explicit type for 'file' to prevent type inference issues.
    const ps1Files = Array.from(files).filter((file: File) => file.name.endsWith('.ps1'));

    if (ps1Files.length === 0) {
        setUploadError("No PowerShell (.ps1) files found in the selected folder.");
        setIsUploading(false);
        if (event.target) event.target.value = '';
        return;
    }

    const processFile = (file: File): Promise<{script: Script | null, error: string | null}> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const code = e.target?.result as string;
                    if (!code) {
                        resolve({script: null, error: `Could not read file: ${file.name}`});
                        return;
                    }
                    const { title, tags } = await analyzeScriptContent(code, model); 
                    const newScript: Script = {
                        id: `script_${Date.now()}_${file.name.replace('.ps1', '')}`,
                        createdAt: new Date().toISOString(),
                        title,
                        tags,
                        code,
                    };
                    resolve({script: newScript, error: null});
                } catch (error) {
                    let errorMessage = "An unknown error occurred.";
                    if (error instanceof Error) {
                        if (error.message === 'API_KEY_ERROR') {
                            handleApiKeyError();
                            errorMessage = "API key is invalid.";
                        } else {
                            errorMessage = error.message;
                        }
                    }
                    console.error(`Failed to process file ${file.name}: ${errorMessage}`, error);
                    resolve({script: null, error: `File '${file.name}': ${errorMessage}`});
                }
            };
            reader.onerror = () => {
                 const errorMessage = 'Failed to read file';
                 console.error(`${errorMessage} ${file.name}`);
                 resolve({script: null, error: `File '${file.name}': ${errorMessage}`});
            };
            reader.readAsText(file);
        });
    };

    const results = await Promise.all(ps1Files.map(processFile));
    const successfulScripts = results.map(r => r.script).filter((s): s is Script => s !== null);
    const errors = results.map(r => r.error).filter((e): e is string => e !== null);

    if (successfulScripts.length > 0) {
        setScripts(prev => [...successfulScripts, ...prev]);
    }
    
    if (errors.length > 0) {
        setUploadError(errors[0]);
    }

    setIsUploading(false);

    if (event.target) {
        event.target.value = '';
    }
  };


  return (
    <>
      {showApiKeyWizard && <ApiKeyWizard onClose={() => setShowApiKeyWizard(false)} />}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        selectedModel={model}
        onModelChange={handleSaveModel}
        onTriggerApiKeyWizard={() => setShowApiKeyWizard(true)}
      />
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <input
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        ref={folderInputRef}
        onChange={handleFolderUpload}
        className="hidden"
        accept=".ps1"
      />
      <div className="flex h-screen font-sans antialiased bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200">
        <aside className="w-1/3 max-w-sm min-w-[300px] h-full hidden md:block">
          <SavedScriptsList
            scripts={scripts}
            selectedScriptId={selectedScript?.id || null}
            onSelectScript={handleSelectScript}
            onDeleteScript={handleDeleteScript}
            onNewScript={handleNewScript}
            onDownloadScripts={handleDownloadScripts}
            onUploadFolder={handleTriggerUpload}
            isUploading={isUploading}
            uploadError={uploadError}
          />
        </aside>
        <main className="flex-1 h-full flex flex-col relative">
           <div className="absolute top-6 right-8 flex items-center space-x-4 z-10">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-yellow-500 dark:text-yellow-400 transition-colors"
                aria-label="Open AI Settings"
              >
                <KeyIcon className="w-5 h-5" />
              </button>
              <button
                  onClick={handleThemeToggle}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                  {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </button>
           </div>
          <div className="flex-1 overflow-y-auto">
            {editingScript ? (
              <ScriptEditor
                script={editingScript}
                onUpdateScript={handleUpdateScript}
                onCancel={handleCancelEditing}
                model={model}
                onApiKeyError={handleApiKeyError}
              />
            ) : selectedScript ? (
              <ScriptViewer
                script={selectedScript}
                onDownload={(scriptId) => handleDownloadScripts([scriptId])}
                onEdit={handleStartEditing}
              />
            ) : (
              <ScriptGenerator 
                onSaveScript={handleSaveScript} 
                model={model}
                onApiKeyError={handleApiKeyError}
              />
            )}
          </div>
          <Footer onPrivacyClick={() => setIsPrivacyModalOpen(true)} />
          
           {/* AI Assistant FAB */}
           {!isAssistantOpen && (
              <button
                onClick={() => setIsAssistantOpen(true)}
                className="absolute bottom-24 right-8 z-30 h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
                aria-label="Open AI Assistant"
                title="Open AI Assistant"
              >
                <MagicWandIcon className="w-6 h-6" />
              </button>
            )}

            {/* AI Assistant Panel */}
            {isAssistantOpen && (
              <AiAssistant 
                model={model}
                onClose={() => setIsAssistantOpen(false)}
                onApiKeyError={handleApiKeyError}
              />
            )}
        </main>
      </div>
    </>
  );
};

export default App;