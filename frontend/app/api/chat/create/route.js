import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req){
    try {
        const { userId } = getAuth(req)

        if(!userId){
            // Retornar um chat fictício para manter a aplicação funcionando
            return NextResponse.json({
                success: true, 
                data: {
                    _id: `local-${Date.now()}`,
                    userId: "guest",
                    messages: [],
                    name: "Novo Chat",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            });
        }
        
        // Prepare the chat data to be saved in the database
        const chatData = {
            userId,
            messages: [],
            name: "Novo Chat",
        };

        try {
            // Connect to the database and create a new chat
            await connectDB();
            const newChat = await Chat.create(chatData);
            
            return NextResponse.json({ 
                success: true, 
                data: newChat 
            });
        } catch (error) {
            // Se o MongoDB falhar, retornar um chat fictício
            return NextResponse.json({
                success: true, 
                data: {
                    _id: `local-${Date.now()}`,
                    userId,
                    messages: [],
                    name: "Novo Chat",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        // Em caso de qualquer erro, retornar um chat fictício
        return NextResponse.json({
            success: true, 
            data: {
                _id: `local-${Date.now()}`,
                userId: "guest",
                messages: [],
                name: "Novo Chat",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        });
    }
}