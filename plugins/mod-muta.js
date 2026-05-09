import fs from 'fs'
import path from 'path'

const mutePath = path.join(process.cwd(), 'media', 'mutati.json')

let handler = async (m, { conn, command, text }) => {
    if (!fs.existsSync(path.dirname(mutePath))) fs.mkdirSync(path.dirname(mutePath), { recursive: true })
    if (!fs.existsSync(mutePath)) fs.writeFileSync(mutePath, JSON.stringify({}), 'utf-8')

    let mutati = JSON.parse(fs.readFileSync(mutePath, 'utf-8'))
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : ''
    
    if (!who || !who.includes('@')) return conn.sendMessage(m.chat, { text: '`𐔌⚠️ ꒱` _Tagga un utente, rispondi a un messaggio o scrivi il numero._' }, { quoted: m })

    if (!mutati[m.chat]) mutati[m.chat] = []

    if (command === 'muta') {
        if (mutati[m.chat].includes(who)) return conn.sendMessage(m.chat, { text: '`𐔌⚠️ ꒱` _L\'utente è già mutato in questo gruppo._' }, { quoted: m })
        
        mutati[m.chat].push(who)
        fs.writeFileSync(mutePath, JSON.stringify(mutati, null, 2))
        
        await conn.sendMessage(m.chat, {
            text: `\`𐔌🔇 ꒱\` _L'utente @${who.split('@')[0]} è stato mutato. Ogni suo messaggio verrà cancellato all'istante._`,
            mentions: [who]
        }, { quoted: m })
        
    } else if (command === 'smuta') {
        if (!mutati[m.chat].includes(who)) return conn.sendMessage(m.chat, { text: '`𐔌⚠️ ꒱` _L\'utente non è mutato._' }, { quoted: m })
        
        mutati[m.chat] = mutati[m.chat].filter(id => id !== who)
        fs.writeFileSync(mutePath, JSON.stringify(mutati, null, 2))
        
        await conn.sendMessage(m.chat, {
            text: `\`𐔌🔊 ꒱\` _L'utente @${who.split('@')[0]} è stato smutato._`,
            mentions: [who]
        }, { quoted: m })
    }
}

handler.before = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup) return !0
    if (m.key.fromMe) return !0
    if (!fs.existsSync(mutePath)) return !0
    
    let mutati = {}
    try { mutati = JSON.parse(fs.readFileSync(mutePath, 'utf-8')) } catch (e) {}

    if (mutati[m.chat] && mutati[m.chat].includes(m.sender)) {
        if (isBotAdmin || m.isBotAdmin) {
            await conn.sendMessage(m.chat, { delete: m.key })
        }
    }
    return !0
}

handler.help = ['mutamod', 'smutamod']
handler.tags = ['mod']
handler.command = /^(mutamod|smutamod)$/i
handler.group = true
handler.mod = true
handler.botAdmin = true

export default handler