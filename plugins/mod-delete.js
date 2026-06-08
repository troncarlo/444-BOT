let handler = async (m, { conn }) => {
    if (!m.quoted) return

    try {
        let quotedKey = m.quoted.vM?.key || m.quoted.key || {
            remoteJid: m.chat,
            fromMe: m.quoted.fromMe || false,
            id: m.quoted.id,
            participant: m.quoted.sender
        }

        await conn.sendMessage(m.chat, { delete: quotedKey })
        await conn.sendMessage(m.chat, { delete: m.key })
    } catch (e) {
        console.error(e)
    }
}

handler.help = ['mdel']
handler.command = /^(mdel|mdelete|melimina)/i
handler.tags = ['mod']
handler.mod = true
handler.group = true

export default handler