let handler = async (m, { conn }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender

    if (who.endsWith('@lid')) {
        const contact = Object.values(conn.contacts || {}).find(c => c.lid === who)
        if (contact && contact.id) {
            who = contact.id
        }
    }

    try {
        let url = await conn.profilePictureUrl(who, 'image')
        
        await conn.sendMessage(m.chat, { 
            image: { url }, 
            caption: ``,
            mentions: [who]
        }, { quoted: m })

    } catch (e) {
        m.reply('`𐔌⚠️ ꒱` _Impossibile recuperare la foto profilo. Potrebbe essere nascosta per la privacy o non impostata._')
    }
}

handler.help = ['pic [@user/reply]']
handler.tags = ['info']
handler.command = /^(pic|foto|avatar|getpic)$/i

export default handler