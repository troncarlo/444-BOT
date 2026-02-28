import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, command }) => {
    const bannedPath = path.join(process.cwd(), 'media', 'banned.json')
    
    let bannedData = { users: [], chats: [] }
    try { bannedData = JSON.parse(fs.readFileSync(bannedPath, 'utf-8')) } catch (e) {}

    const jid = m.chat

    if (command === 'banchat') {
        if (bannedData.chats.includes(jid)) return m.reply('`𐔌⚠️ ꒱` _Coglione, sono gia muto._')
        
        bannedData.chats.push(jid)
        fs.writeFileSync(bannedPath, JSON.stringify(bannedData, null, 2))
        m.reply('`𐔌🚫 ꒱` _Ai suoi ordini. Non romperò più il cazzo qui._')
        
    } else if (command === 'unbanchat') {
        if (!bannedData.chats.includes(jid)) return m.reply('`𐔌⚠️ ꒱` _Coglione, non sono muto._')
        
        bannedData.chats = bannedData.chats.filter(id => id !== jid)
        fs.writeFileSync(bannedPath, JSON.stringify(bannedData, null, 2))
        m.reply('`𐔌✅ ꒱` _Indovinate chi è tornato a rompere il cazzo?._')
    }
}

handler.help = ['banchat', 'unbanchat']
handler.tags = ['owner']
handler.command = /^(banchat|unbanchat)$/i
handler.owner = true

export default handler