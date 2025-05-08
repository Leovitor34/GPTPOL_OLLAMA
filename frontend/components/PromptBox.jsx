import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import Image from 'next/image'
import React, { useState } from 'react'

const PromptBox = ({setIsLoading, isLoading}) => {

    const [prompt, setPrompt] = useState('');
    const [requestStartTime, setRequestStartTime] = useState(null);
    const {user, chats, setChats, selectedChat, setSelectedChat, createNewChat} = useAppContext();

    const handleKeyDown = (e)=>{
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            sendPrompt(e);
        }
    }

    const sendPrompt = async (e)=>{
        const promptCopy = prompt;

        try {
            e.preventDefault();
            if(!user) return; // Silencioso
            if(isLoading) return; // Silencioso
            
            // Marcar o tempo de início da solicitação
            const startTime = Date.now();
            setRequestStartTime(startTime);
            
            // Tentativa silenciosa de criar um chat se não houver um selecionado
            if(!selectedChat) {
                try {
                    const newChat = await createNewChat();
                    if (!newChat) return; // Retorna silenciosamente se não for possível criar
                } catch (error) {
                    console.error("Erro ao criar chat:", error);
                    return; // Retorna silenciosamente
                }
            }

            // Se ainda não tiver um chat selecionado após a tentativa, retorna silenciosamente
            if (!selectedChat) return;

            setIsLoading(true)
            setPrompt("")

            const userPrompt = {
                role: "user",
                content: prompt,
                timestamp: Date.now(),
            }

            // saving user prompt in chats array
            setChats((prevChats)=> prevChats.map((chat)=> chat && chat._id === selectedChat?._id ?
             {
                ...chat,
                messages: [...(chat.messages || []), userPrompt]
            }: chat
            ))
            
            // saving user prompt in selected chat
            setSelectedChat((prev)=> {
                if (!prev) return null;
                return {
                    ...prev,
                    messages: [...(prev.messages || []), userPrompt]
                }
            })

            try {
                const {data} = await axios.post('/api/chat/ai', {
                    chatId: selectedChat?._id,
                    prompt,
                    thinkknMode: true
                })

                // Calcular o tempo de processamento
                const endTime = Date.now();
                const processingTimeSeconds = Math.round((endTime - startTime) / 1000);

                if(data.success){
                    // Adicionar tempo de processamento à resposta
                    const assistantResponseWithTime = {
                        ...data.data,
                        processingTime: processingTimeSeconds
                    };

                    setChats((prevChats)=>prevChats.map((chat)=>
                        chat && chat._id === selectedChat?._id ? 
                        {...chat, messages: [...(chat.messages || []), assistantResponseWithTime]} : 
                        chat
                    ))

                    const message = data.data.content;
                    const messageTokens = message.split(" ");
                    let assistantMessage = {
                        role: 'assistant',
                        content: "",
                        timestamp: Date.now(),
                        processingTime: processingTimeSeconds
                    }

                    setSelectedChat((prev) => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            messages: [...(prev.messages || []), assistantMessage],
                        }
                    })

                    for (let i = 0; i < messageTokens.length; i++) {
                       setTimeout(()=>{
                        assistantMessage.content = messageTokens.slice(0, i + 1).join(" ");
                        setSelectedChat((prev)=>{
                            if (!prev || !prev.messages) return prev;
                            const updatedMessages = [
                                ...prev.messages.slice(0, -1),
                                assistantMessage
                            ]
                            return {...prev, messages: updatedMessages}
                        })
                       }, i * 100)
                        
                    }
                } else {
                    // Tratar o erro silenciosamente
                    setPrompt(promptCopy);
                }
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                // Criar resposta fictícia do assistente em caso de erro
                const endTime = Date.now();
                const processingTimeSeconds = Math.round((endTime - startTime) / 1000);
                
                const assistantMessage = {
                    role: 'assistant',
                    content: "Desculpe, não consegui processar sua solicitação. Por favor, tente novamente.",
                    timestamp: Date.now(),
                    processingTime: processingTimeSeconds
                };
                
                setChats((prevChats)=>prevChats.map((chat)=>
                    chat && chat._id === selectedChat?._id ? 
                    {...chat, messages: [...(chat.messages || []), assistantMessage]} : 
                    chat
                ))
                
                setSelectedChat((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        messages: [...(prev.messages || []), assistantMessage]
                    }
                })
                
                setPrompt(promptCopy);
            }

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            setPrompt(promptCopy);
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <form onSubmit={sendPrompt}
     className={`w-full ${selectedChat?.messages?.length > 0 ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
        <textarea
        onKeyDown={handleKeyDown}
        className='outline-none w-full resize-none overflow-hidden break-words bg-transparent'
        rows={2}
        placeholder='Message DeepSeek' required 
        onChange={(e)=> setPrompt(e.target.value)} value={prompt}/>

        <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
                <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                    <Image className='h-5' src={assets.deepthink_icon} alt=''/>
                    DeepThink (R1)
                </p>
                <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                    <Image className='h-5' src={assets.search_icon} alt=''/>
                    Search
                </p>
            </div>

            <div className='flex items-center gap-2'>
            <Image className='w-4 cursor-pointer' src={assets.pin_icon} alt=''/>
            <button className={`${prompt ? "bg-primary" : "bg-[#71717a]"} rounded-full p-2 cursor-pointer`}>
                <Image className='w-3.5 aspect-square' src={prompt ? assets.arrow_icon : assets.arrow_icon_dull} alt=''/>
            </button>
            </div>
        </div>
    </form>
  )
}

export default PromptBox
