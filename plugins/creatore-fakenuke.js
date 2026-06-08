const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, command }) => {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata.subject
    
    if (['nuke', 'nike', 'niuk', 'nuche', 'niuc'].includes(command)) {
        global.db.data.groups[m.chat].backup_nuke = groupName
        
        let botName = global.bot || '444bot'
        let newName = `${groupName} | SVT BY ${botName.toUpperCase()}`
        try {
            await conn.groupUpdateSubject(m.chat, newName)
            await conn.groupSettingUpdate(m.chat, 'announcement')
        } catch (e) {}

        await conn.sendMessage(m.chat, { text: `vi ho fottuti🫰` }, { quoted: m })
        
        await delay(1000)

        let groupInviteCode = ''
        try {
            groupInviteCode = await conn.groupInviteCode(m.chat)
        } catch (e) {}
        const currentGroupLink = groupInviteCode ? `https://chat.whatsapp.com/${groupInviteCode}` : 'Impossibile recuperare il link.'
        
        await conn.sendMessage(m.chat, { 
            text: `TUTTI QUI:\n${currentGroupLink}` 
        }, { quoted: m })
        
    } else if (command === 'risparmia') {
        const backup = global.db.data.groups[m.chat]?.backup_nuke
        if (!backup) return conn.sendMessage(m.chat, { text: '『 ❌ 』 Nessun dato di ripristino trovato.' }, { quoted: m })

        try {
            await conn.groupUpdateSubject(m.chat, backup)
            await conn.groupSettingUpdate(m.chat, 'not_announcement')
        } catch (e) {}

        await conn.sendMessage(m.chat, { text: 'dai scherzavo!!' }, { quoted: m })
        
        delete global.db.data.groups[m.chat].backup_nuke
    }
}

handler.help = ['nuke', 'risparmia']
handler.tags = ['admin']
handler.command = /^(nuke|nike|niuc|niuk|nuche|risparmia)$/i

handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler