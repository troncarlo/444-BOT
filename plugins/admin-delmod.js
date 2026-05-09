let handler = async (m, { conn, text, isGroup }) => {
    if (!isGroup) return m.reply('_Questo comando funziona solo nei gruppi._')

    const jid = m.chat
    const mods = global.db.data.groups[jid]?.moderatori

    if (!mods || mods.length === 0) return m.reply('_Nessun moderatore in questo gruppo._')

    let target = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)

    if (!target && text) {
        let number = text.replace(/[^0-9]/g, '')
        if (number.length >= 10) target = number + '@s.whatsapp.net'
    }

    if (!target) return m.reply('_Tagga, quota o scrivi il numero dell\'utente da rimuovere._')

    if (!mods.includes(target)) return m.reply('_L\'utente non è moderatore in questo gruppo._')

    global.db.data.groups[jid].moderatori = mods.filter(j => j !== target)
    global.dbDirty = true

    await conn.sendMessage(m.chat, {
        text: `✅ @${target.split('@')[0]} rimosso dai moderatori di questo gruppo.`,
        mentions: [target],
        contextInfo: { ...global.newsletter().contextInfo }
    }, { quoted: m })
}

handler.help = ['delmod']
handler.tags = ['admin']
handler.command = ['delmod', 'remmod']
handler.admin = true

export default handler