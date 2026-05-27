const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`\`𐔌⚠️꒱\` Inserisci il link del canale.\nEsempio: *${usedPrefix + command}* https://whatsapp.com/channel/0029Va...`)

    const regex = /chat\.whatsapp\.com\/|whatsapp\.com\/channel\/([a-zA-Z0-9\-]+)/i
    const match = text.match(regex)

    if (!match || !match[1]) return m.reply('`𐔌❌꒱` Link non valido. Assicurati che sia un link di un canale WhatsApp.')

    const code = match[1]

    try {
        const res = await conn.newsletterMetadata('invite', code)
        
        if (!res || !res.id) return m.reply('`𐔌❌꒱` Impossibile recuperare i metadati del canale.')

        let txt = `╭┈➤ 『 📢 』 *INFO CANALE*\n`
        txt += `┆  『 🆔 』 *ID:* \`${res.id}\`\n`
        txt += `┆  『 📝 』 *NOME:* ${res.name || 'N/A'}\n`
        txt += `┆  『 👥 』 *FOLLOWER:* ${res.subscribers || '0'}\n`
        txt += `╰┈➤ 『 📦 』 \`annoyed system\``

        await m.reply(txt)
    } catch (e) {
        console.error(e)
        await m.reply('`𐔌❌꒱` Errore durante il recupero dell\'ID. Il canale potrebbe essere privato o inesistente.')
    }
}

handler.help = ['checkjid']
handler.tags = ['tools']
handler.command = ['checkjid', 'checkns', 'canaleid']
handler.group = true
handler.owner = true

export default handler