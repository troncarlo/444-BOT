import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, command, text }) => {
    const bannedPath = path.join(process.cwd(), 'media', 'banned.json')
    
    let bannedData = { users: [], chats: [] }
    try { bannedData = JSON.parse(fs.readFileSync(bannedPath, 'utf-8')) } catch (e) {}

    let who
    if (m.quoted) who = m.quoted.sender
    else if (m.mentionedJid && m.mentionedJid[0]) who = m.mentionedJid[0]
    else if (text) who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    if (!who) return m.reply('`𐔌⚠️ ꒱` _Devi taggare, rispondere o inserire il numero dell\'utente._')

    if (command === 'banuser') {
        if (bannedData.users.includes(who)) return m.reply('`𐔌⚠️ ꒱` _Questo utente è già bannato._')
        
        bannedData.users.push(who)
        fs.writeFileSync(bannedPath, JSON.stringify(bannedData, null, 2))
        m.reply(`\`𐔌🚫 ꒱\` _@${who.split('@')[0]} GODO SEI STATO BANNATO FROCIOO_`, null, { mentions: [who] })
        
    } else if (command === 'unbanuser') {
        if (!bannedData.users.includes(who)) return m.reply('`𐔌⚠️ ꒱` _Questo utente non è bannato._')
        
        bannedData.users = bannedData.users.filter(id => id !== who)
        fs.writeFileSync(bannedPath, JSON.stringify(bannedData, null, 2))
        m.reply(`\`𐔌✅ ꒱\` _@${who.split('@')[0]} è tornato a rompere il cazzo._`, null, { mentions: [who] })
    }
}

handler.help = ['banuser', 'unbanuser']
handler.tags = ['owner']
handler.command = /^(banuser|unbanuser)$/i
handler.owner = true

export default handler