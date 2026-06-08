import fs from 'fs'
import path from 'path'

let handler = m => m

handler.before = async function (m, { conn }) {
    if (m.key.fromMe) return 

    if (m.text && m.text.toLowerCase().includes('esplod')) {
        let videoPath = path.join(process.cwd(), 'media', 'calciculo.mp4')
        
        if (!fs.existsSync(videoPath)) return

        let videoBuffer = fs.readFileSync(videoPath)

        await conn.sendMessage(m.chat, { 
            video: videoBuffer, 
            mimetype: 'video/mp4',
            caption: 'dovete esplodere 😡😡😡😡'
        }, { quoted: m })
        
        return true 
    }
}

export default handler