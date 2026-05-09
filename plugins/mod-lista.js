const modPath = './media/moderatori.json'
import fs from 'fs'

function getMods() {
    try { 
        return JSON.parse(fs.readFileSync(modPath, 'utf-8')) 
    } catch { 
        return { moderatori: [] } 
    }
}

let handler = async (m, { conn }) => {
    const data = getMods()
    const mods = data.moderatori

    if (!mods || mods.length === 0) {
        return m.reply('_Nessun moderatore in lista._')
    }

    let txt = `╭┈➤ 『 🛡️ 』 *LISTA MODERATORI*\n`
    txt += `┆  『 👥 』 *TOTALE:* ${mods.length}\n`
    txt += `┆\n`
    
    mods.forEach((jid, i) => {
        txt += `┆  ${i + 1}. @${jid.split('@')[0]}\n`
    })
    
    txt += `╰┈➤ 『 📦 』 \`annoyed system\``

    await conn.sendMessage(m.chat, { 
        text: txt, 
        mentions: mods 
    }, { quoted: m })
}

handler.help = ['listmod']
handler.tags = ['owner', 'info']
handler.command = ['listmod', 'mods']
handler.mod = true

export default handler