let handler = async (m, { conn, isGroup }) => {
    if (!isGroup) return m.reply('_Questo comando funziona solo nei gruppi._')

    const jid = m.chat
    const mods = global.db.data.groups[jid]?.moderatori

    if (!mods || mods.length === 0) return m.reply('_Nessun moderatore impostato in questo gruppo._')

    let txt = `╭┈➤ 『 🔰 』 *LISTA MODERATORI*\n`
    mods.forEach((modJid, i) => {
        txt += `┆  ${i + 1}. @${modJid.split('@')[0]}\n`
    })
    txt += `╰┈➤ 『 📦 』 \`totale mod:\` *${mods.length}*`

    await conn.sendMessage(m.chat, {
        text: txt,
        mentions: mods,
        contextInfo: { ...global.newsletter().contextInfo }
    }, { quoted: m })
}

handler.help = ['listamod']
handler.tags = ['group']
handler.command = ['listamod', 'mods', 'listmod']
handler.group = true

export default handler