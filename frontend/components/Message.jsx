import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import toast from 'react-hot-toast'

const Message = ({role, content, processingTime}) => {
    const [thoughtContent, setThoughtContent] = useState("");
    const [finalContent, setFinalContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showThought, setShowThought] = useState(false);

    useEffect(() => {
        // Processar conteúdo para separar pensamento e resposta final
        if (content) {
            const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
            if (thinkMatch && thinkMatch[1]) {
                setThoughtContent(thinkMatch[1].trim());
                // Obter o conteúdo após a tag </think>
                const remainingContent = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
                setFinalContent(remainingContent);
            } else {
                // Se não houver tag think, todo o conteúdo é a resposta final
                setFinalContent(content);
            }
            
            // Detectar se a mensagem ainda está sendo gerada
            setIsGenerating(content.endsWith('...') || content.length < 20);
        }

        // Destacar sintaxe de código
        Prism.highlightAll();
    }, [content]);

    const copyMessage = () => {
        // Copiar somente a resposta final, sem as tags think
        const textToCopy = finalContent || content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
        navigator.clipboard.writeText(textToCopy);
        toast.success('Resposta copiada para a área de transferência');
    }

    // Função para determinar se o conteúdo contém tags <think>
    const hasThinkTag = (text) => {
        return text && text.includes("<think>");
    }

    // Função para aplicar estilo a conteúdo em andamento
    const renderContent = () => {
        // Se estamos gerando e há tag think, estilizar diretamente
        if (isGenerating && hasThinkTag(content)) {
            return (
                <div className="mb-4 bg-[#1e1e1e] rounded px-3 py-2">
                    <div className="thinking-text">
                        <Markdown>{content.replace(/<\/?think>/g, '')}</Markdown>
                    </div>
                </div>
            );
        } 
        
        // Renderização normal da resposta e pensamento
        return (
            <>
                {thoughtContent && (
                    <div>
                        <button
                            onClick={() => setShowThought(!showThought)}
                            className="flex items-center gap-2 py-1 px-2 mb-2 text-[#999] hover:text-[#bbb] transition-colors text-xs"
                            style={{backgroundColor: 'transparent'}}
                        >
                            <span className="opacity-60">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"/>
                                    <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor"/>
                                </svg>
                            </span>
                            <span>Thought for {processingTime || 10} seconds</span>
                            <span className="ml-auto">
                                {showThought ? '▲' : '▼'}
                            </span>
                        </button>
                        {showThought && (
                            <div className="mb-4 bg-[#1e1e1e] rounded px-3 py-2">
                                <div className="thinking-text">
                                    <Markdown>{thoughtContent}</Markdown>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {finalContent && (
                    <div className="response-content">
                        <Markdown>{finalContent}</Markdown>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className='flex flex-col items-center w-full max-w-3xl text-sm'>
            <div className={`flex flex-col w-full mb-8 ${role === 'user' && 'items-end'}`}>
                <div className={`group relative flex max-w-2xl py-3 rounded-2xl ${role === 'user' ? 'bg-[#414158] px-5' : 'gap-3'}`}>
                    <div className={`opacity-0 group-hover:opacity-100 absolute ${role === 'user' ? '-left-16 top-2.5' : 'left-9 -bottom-6'} transition-all`}>
                        <div className='flex items-center gap-2 opacity-70'>
                            {
                                role === 'user' ? (
                                    <>
                                        <Image onClick={copyMessage} src={assets.copy_icon} alt='' className='w-4 cursor-pointer'/>
                                        <Image src={assets.pencil_icon} alt='' className='w-4.5 cursor-pointer'/>
                                    </>
                                ):(
                                    <>
                                        <Image onClick={copyMessage} src={assets.copy_icon} alt='' className='w-4.5 cursor-pointer'/>
                                        <Image src={assets.regenerate_icon} alt='' className='w-4 cursor-pointer'/>
                                        <Image src={assets.like_icon} alt='' className='w-4 cursor-pointer'/>
                                        <Image src={assets.dislike_icon} alt='' className='w-4 cursor-pointer'/>
                                    </>
                                )
                            }
                        </div>
                    </div>
                    {
                        role === 'user' ? (
                            <span className='text-white/90'>{content}</span>
                        ) : (
                            <>
                                <div className={`thinking-bar ${isGenerating ? 'animate-pulse' : ''}`}></div>
                                <Image src={assets.logo_icon} alt='' className='h-9 w-9 p-1 border border-white/15 rounded-full'/>
                                <div className='space-y-4 w-full overflow-scroll text-[17px] leading-relaxed text-[#f0f0f0]'>
                                    {renderContent()}
                                </div>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

// Adicionar estilos CSS para a faixa lateral animada
const styles = `
.thinking-bar {
  width: 4px;
  margin-right: 8px;
  border-radius: 2px;
  background: linear-gradient(#3b82f6, #2563eb);
  animation: pulse-bar 1.5s infinite ease-in-out;
}

@keyframes pulse-bar {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
`;

// Adicionar estilos ao documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default Message
