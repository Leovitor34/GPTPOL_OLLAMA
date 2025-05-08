import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req){
    try {
        const { userId } = getAuth(req)

        if(!userId){
            // Retornar uma lista vazia para usuários não autenticados
            return NextResponse.json({success: true, data: []})
        }

        try {
            // Connect to the database and get all chats for this user
            await connectDB();
            const chats = await Chat.find({userId}).sort({updatedAt: -1});
            
            return NextResponse.json({success: true, data: chats})
        } catch (error) {
            // Se o MongoDB falhar, retornar uma lista vazia
            return NextResponse.json({success: true, data: []})
        }
    } catch (error) {
        // Em caso de qualquer erro, retornar uma lista vazia
        return NextResponse.json({success: true, data: []})
    }
}