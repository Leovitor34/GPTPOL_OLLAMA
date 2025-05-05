import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import { sendMessage } from '@/services/apiService';
import Image from 'next/image';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PromptBox = ({ setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const { user, chats, setChats, selectedChat, setSelectedChat } = useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    const promptCopy = prompt;

    try {
      e.preventDefault();

      if (!user) return toast.error('Login para enviar uma pergunta');
      if (isLoading) return toast.error('Aguarde a resposta anterior');
      if (!selectedChat) return toast.error('Nenhum chat selecionado');

      setIsLoading(true);
      setPrompt('');

      const userPrompt = {
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? {
                ...chat,
                messages: [...(chat.messages || []), userPrompt],
              }
            : chat
        )
      );

      setSelectedChat((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), userPrompt],
      }));

      // 🧠 Chamada para API FastAPI
      const respostaIA = await sendMessage(prompt);

      if (respostaIA) {
        const assistantMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), assistantMessage],
        }));

        const palavras = respostaIA.split(' ');

        for (let i = 0; i < palavras.length; i++) {
          setTimeout(() => {
            assistantMessage.content = palavras.slice(0, i + 1).join(' ');
            setSelectedChat((prev) => {
              const updatedMessages = [
                ...(prev?.messages || []).slice(0, -1),
                assistantMessage,
              ];
              return { ...prev, messages: updatedMessages };
            });
          }, i * 100);
        }

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? {
                  ...chat,
                  messages: [...(chat.messages || []), assistantMessage],
                }
              : chat
          )
        );
      } else {
        toast.error('Erro ao obter resposta da IA');
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message || 'Erro inesperado');
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${
        selectedChat?.messages?.length > 0 ? 'max-w-3xl' : 'max-w-2xl'
      } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Pergunte alguma coisa "
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.deepthink_icon} alt="" />
            Busca rápida
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.search_icon} alt="" />
            Buscar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
          <button
            type="submit"
            className={`${
              prompt ? 'bg-primary' : 'bg-[#71717a]'
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
