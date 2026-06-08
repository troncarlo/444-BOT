import fs from 'fs'
import path from 'path'

let handler = m => m

handler.before = async function (m, { conn }) {
    if (m.key.fromMe) return 

    if (m.text && m.text.toLowerCase().includes('cioccolata')) {
        let audioPath = path.join(process.cwd(), 'media', 'cioccolata.opus')
        
        if (!fs.existsSync(audioPath)) return

        await conn.sendMessage(m.chat, { 
            audio: { url: audioPath }, 
            mimetype: 'audio/mpeg', 
            ptt: true 
        }, { quoted: m })
        
        return true 
    }
}

export default handler