import fs from 'fs'

let handler = async (m, { conn, text, isGroup }) => {
    if (!isGroup) return m.reply('_Questo comando funziona solo nei gruppi._')

    const jid = m.chat

    if (!global.db.data.groups[jid]) 
        global.db.data.groups[jid] = { messages: 0, antilink: true, antiwhatsapp: true, soloadmin: false }
    if (!global.db.data.groups[jid].moderatori) 
        global.db.data.groups[jid].moderatori = []

    let target = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)

    if (!target && text) {
        let number = text.replace(/[^0-9]/g, '')
        if (number.length >= 10) target = number + '@s.whatsapp.net'
    }

    if (!target) return m.reply('_Tagga, quota o scrivi il numero dell\'utente._')

    if (global.db.data.groups[jid].moderatori.includes(target)) 
        return m.reply('_L\'utente è già un moderatore in questo gruppo._')

    global.db.data.groups[jid].moderatori.push(target)
    global.dbDirty = true 

    await conn.sendMessage(m.chat, {
        text: `✅ @${target.split('@')[0]} aggiunto come moderatore in questo gruppo.`,
        mentions: [target],
        contextInfo: { ...global.newsletter().contextInfo }
    }, { quoted: m })
}

handler.help = ['addmod']
handler.tags = ['admin']
handler.command = ['addmod']
handler.admin = true

export default handler