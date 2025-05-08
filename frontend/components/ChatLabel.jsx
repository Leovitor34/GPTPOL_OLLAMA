import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import Image from 'next/image'
import React from 'react'

const ChatLabel = ({openMenu, setOpenMenu, id, name}) => {

  const {fetchUsersChats, selectChat, selectedChat} = useAppContext()

  const handleSelectChat = () => {
    selectChat(id);
  }

  const renameHandler = async (e) => {
    e.stopPropagation();
    try {
      const newName = prompt('Enter new name')
      if(!newName) return 
      await axios.post('/api/chat/rename', {chatId: id, name: newName})
      fetchUsersChats()
      setOpenMenu({id: 0, open: false})
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  }

  const deleteHandler = async (e) => {
    e.stopPropagation();
    try {
      const confirm = window.confirm('Are you sure you want to delete this chat?')
      if(!confirm) return
      await axios.post('/api/chat/delete', {chatId: id })
      fetchUsersChats()
      setOpenMenu({ id: 0, open: false })
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  }

  // Verificar se este chat está selecionado
  const isSelected = selectedChat && selectedChat._id === id;

  return (
    <div 
      onClick={handleSelectChat} 
      className={`flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer ${isSelected ? 'bg-white/20' : ''}`}
    >
      <p className='group-hover:max-w-5/6 truncate'>{name}</p>
      <div onClick={e=>{e.stopPropagation();setOpenMenu({id: id, open: !openMenu.open})}}
       className='group relative flex items-center justify-center h-6 w-6 aspect-square hover:bg-black/80 rounded-lg'>
        <Image src={assets.three_dots} alt='' className={`w-4 ${openMenu.id === id && openMenu.open ? '' : 'hidden'} group-hover:block`}/>
        <div className={`absolute ${openMenu.id === id && openMenu.open ? 'block' : 'hidden'} -right-36 top-6 bg-gray-700 rounded-xl w-max p-2`}>
            <div onClick={renameHandler} className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg'>
                <Image src={assets.pencil_icon} alt='' className='w-4'/>
                <p>Rename</p>
            </div>
            <div onClick={deleteHandler} className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg'>
                <Image src={assets.delete_icon} alt='' className='w-4'/>
                <p>Delete</p>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ChatLabel
