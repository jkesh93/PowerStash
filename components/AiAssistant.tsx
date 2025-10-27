import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { MagicWandIcon, PaperPlaneIcon, CloseIcon, ClipboardIcon, CheckIcon } from './Icons';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AiAssistantProps {
  model: string;
  onClose: () => void;
  apiKey: string;
}

const ChatCodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-800 dark:bg-black text-white/90 rounded-md my-2 text-xs relative group">
            <button
                onClick={handleCopy}
                className="absolute top-1 right-1 bg-gray-600/50 hover:bg-gray-500/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                aria-label="Copy code"
            >
                {copied ? <CheckIcon className="w-3 h-3 text-green-400" /> : <ClipboardIcon className="w-3 h-3" />}
            </button>
            <pre className="p-2 pt-4 overflow-x-auto custom-scrollbar">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const renderMessageContent = (text: string) => {
    if (!text) return null;
    // Split by code blocks, keeping the delimiters. This regex handles optional language hints.
    const parts = text.split(/(```(?:[\w-]*)\n[\s\S]*?\n```)/g);

    return parts.filter(part => part.trim() !== '').map((part, index) => {
        if (part.startsWith('```')) {
            // It's a code block
            const codeContent = part.replace(/^```(?:[\w-]*)\n/i, '').replace(/\n```$/, '');
            return <ChatCodeBlock key={index} code={codeContent.trim()} />;
        } else {
            // It's regular text, parse as markdown
            const rawHtml = marked.parse(part.trim(), { gfm: true, breaks: true });
            // Sanitize the HTML to prevent XSS attacks
            const sanitizedHtml = DOMPurify.sanitize(rawHtml);
            return (
                <div
                    key={index}
                    className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
            );
        }
    });
};

const AiAssistant: React.FC<AiAssistantProps> = ({ model, onClose, apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const initializeChat = useCallback(async () => {
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        chatRef.current = ai.chats.create({
          model: model,
          config: {
            systemInstruction: 'You are a helpful and friendly AI assistant specializing in PowerShell. Provide clear explanations and format code snippets appropriately for readability. When you provide code, wrap it in markdown code blocks using ```powershell.',
          },
        });
        setError(null);
        return true;
      } catch (e) {
        console.error("Failed to initialize chat:", e);
        setError("Failed to initialize AI Assistant. Please check your API key.");
        return false;
      }
    }
    return false;
  }, [model, apiKey]);
  
  useEffect(() => {
    if(apiKey) {
        initializeChat();
    }
    setMessages([
      { role: 'model', text: apiKey ? 'Hello! I am your PowerShell AI assistant. How can I help you today?' : 'Hello! Please set your Gemini API key in the AI settings to use the assistant.' }
    ]);
  }, [initializeChat, apiKey]);


  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!apiKey) {
      setError("Please set your Gemini API key to use the assistant.");
      return;
    }
    
    if (!chatRef.current) {
        const initialized = await initializeChat();
        if(!initialized) {
            setError("AI Assistant is not initialized. Please check your API key.");
            return;
        }
    }

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const stream = await chatRef.current!.sendMessageStream({ message: input });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = modelResponse;
            return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
       let displayError = "Sorry, something went wrong. Please try again.";
      if (err instanceof Error) {
          if (err.message.includes('API key not valid') || err.message.includes('API key is invalid')) {
            displayError = "Your API key is invalid. Please check it in the AI Settings.";
          } else if (err.message.includes('429')) {
            displayError = "You have exceeded your quota. Please check your billing account or try again later.";
          } else {
            displayError = err.message;
          }
      }
      setError(displayError);
      setMessages(prev => prev.slice(0, prev.length -1)); 
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-full max-w-md h-[calc(100vh-40px)] max-h-[600px] bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col z-40 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-2">
                <MagicWandIcon className="text-indigo-500 dark:text-indigo-400 text-xl" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">AI Assistant</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Close assistant">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        
        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        {msg.role === 'model' ? renderMessageContent(msg.text) : <span className="whitespace-pre-wrap">{msg.text}</span>}
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="max-w-[85%] px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                        <div className="flex items-center space-x-1.5 py-1">
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
	                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
	                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
         {error && <p className="text-red-500 dark:text-red-400 px-4 pb-2 text-sm">{error}</p>}
        
        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about PowerShell..."
                    rows={1}
                    className="flex-grow bg-transparent focus:outline-none p-2 resize-none text-gray-800 dark:text-gray-200 placeholder-gray-500 custom-scrollbar"
                    style={{ maxHeight: '100px' }}
                    disabled={isLoading}
                    aria-label="Chat input"
                />
                <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="self-end bg-indigo-600 hover:bg-indigo-700 text-white rounded-md p-2 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors" aria-label="Send message">
                    <PaperPlaneIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default AiAssistant;
