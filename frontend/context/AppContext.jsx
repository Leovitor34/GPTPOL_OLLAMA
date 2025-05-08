"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = ()=>{
    return useContext(AppContext)
}

export const AppContextProvider = ({children})=>{
    const {user, isLoaded: isUserLoaded} = useUser()
    const {getToken, isSignedIn} = useAuth()

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);

    const createNewChat = async ()=>{
        try {
            if(!isSignedIn) return null;
            setIsLoading(true);

            const token = await getToken();
            
            if (!token) return null;

            // Criar localmente um novo chat se a API falhar
            const localChat = {
                _id: `local-${Date.now()}`,
                userId: user?.id || 'guest',
                messages: [],
                name: "Novo Chat",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            try {
                const response = await axios.post('/api/chat/create', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.data && response.data.success) {
                    // Se a API responder com sucesso, usar o chat retornado
                    const newChat = response.data.data || localChat;
                    setChats(prevChats => [newChat, ...prevChats]);
                    setSelectedChat(newChat);
                    return newChat;
                } else {
                    // Se a API responder com erro, usar o chat local
                    setChats(prevChats => [localChat, ...prevChats]);
                    setSelectedChat(localChat);
                    return localChat;
                }
            } catch (error) {
                // Se a API falhar, usar o chat local
                setChats(prevChats => [localChat, ...prevChats]);
                setSelectedChat(localChat);
                return localChat;
            }
        } catch (error) {
            console.error("Erro ao criar chat:", error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    const fetchUsersChats = async (forceFetch = false)=>{
        try {
            if (!isSignedIn) return;
            if (isLoading && !forceFetch) return;
            
            setIsLoading(true);
            const token = await getToken();
            
            if (!token) {
                return;
            }

            try {
                const response = await axios.get('/api/chat/get', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                const data = response.data || {};
                
                if(data.success && data.data){
                    // Se houver dados, usar os dados retornados
                    if(data.data.length === 0){
                        // Se não houver chats, criar um novo
                        await createNewChat();
                    } else {
                        // Ordenar chats por data de atualização (mais recente primeiro)
                        const sortedChats = [...data.data].sort(
                            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                        );
                        
                        setChats(sortedChats);
                        
                        // Selecionar o chat mais recente se nenhum chat estiver selecionado
                        if (!selectedChat || !sortedChats.find(chat => chat._id === selectedChat._id)) {
                            setSelectedChat(sortedChats[0]);
                        }
                    }
                } else {
                    // Se a API retornar erro, criar um chat local
                    if (chats.length === 0) {
                        await createNewChat();
                    }
                }
            } catch (error) {
                // Se a API falhar, verificar se já temos chats ou criar um novo
                if (chats.length === 0) {
                    await createNewChat();
                }
            }
        } catch (error) {
            // Erro silencioso
        } finally {
            setIsLoading(false);
        }
    }

    // Selecionar um chat existente
    const selectChat = (chatId) => {
        const chat = chats.find(c => c._id === chatId);
        if (chat) {
            setSelectedChat(chat);
        }
    }

    // Verificar se o usuário está autenticado e inicializar
    useEffect(() => {
        if (isUserLoaded) {
            if (isSignedIn) {
                if (!authInitialized) {
                    fetchUsersChats(true);
                    setAuthInitialized(true);
                }
            } else {
                // Limpar chats quando o usuário faz logout
                setChats([]);
                setSelectedChat(null);
                setAuthInitialized(false);
            }
        }
    }, [isUserLoaded, isSignedIn]);

    // Atualizar periodicamente para manter os dados sincronizados
    useEffect(() => {
        if (isSignedIn && authInitialized) {
            const interval = setInterval(() => {
                fetchUsersChats();
            }, 30000); // Atualizar a cada 30 segundos
            
            return () => clearInterval(interval);
        }
    }, [isSignedIn, authInitialized]);

    const value = {
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUsersChats,
        createNewChat,
        selectChat,
        isLoading,
        isSignedIn
    }
    
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}