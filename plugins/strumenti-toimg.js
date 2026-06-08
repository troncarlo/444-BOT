import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { downloadContentFromMessage } from '@realvare/baileys'
import { webp2mp4, webp2png } from '../lib/webp2png.js'

const handler = async (m, { conn, usedPrefix, command }) => {
    const extra = global.newsletter ? global.newsletter() : {}
    
    if (!m.quoted || !m.quoted.message) {
        return conn.sendMessage(m.chat, {
            text: `╭┈  『 ⚠️ 』 \`errore\`\n╰┈➤ Rispondi a uno sticker con ${usedPrefix + command}`,
            ...extra
        }, { quoted: m })
    }

    let stickerMessage = m.quoted.message.stickerMessage
    if (!stickerMessage) {
        return conn.sendMessage(m.chat, {
            text: `╭┈  『 ⚠️ 』 \`errore\`\n╰┈➤ Rispondi a uno sticker valido.`,
            ...extra
        }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { text: `⏳ _Conversione dello sticker in corso..._` }, { quoted: m })

    try {
        const stream = await downloadContentFromMessage(stickerMessage, 'sticker')
        let mediaBuffer = Buffer.from([])
        for await (const chunk of stream) mediaBuffer = Buffer.concat([mediaBuffer, chunk])

        if (!mediaBuffer || mediaBuffer.length === 0) throw new Error('Download dello sticker fallito')

        const isAnimated = stickerMessage.isAnimated === true || stickerMessage.isAnimated === 'true'

        if (isAnimated) {
            let videoUrl = await webp2mp4(mediaBuffer)
            if (!videoUrl) throw new Error('Conversione MP4 fallita')
            
            let resVideo = await fetch(videoUrl)
            let videoBuffer = Buffer.from(await resVideo.arrayBuffer())
            
            await conn.sendMessage(m.chat, { video: videoBuffer, ...extra }, { quoted: m })
        } else {
            let imageUrl = await webp2png(mediaBuffer)
            if (!imageUrl) throw new Error('Conversione PNG fallita')
            
            let resImage = await fetch(imageUrl)
            let imageBuffer = Buffer.from(await resImage.arrayBuffer())
            
            await conn.sendMessage(m.chat, { image: imageBuffer, ...extra }, { quoted: m })
        }

    } catch (e) {
        console.error('--- ERRORE TOIMG CON EZGIF ---', e)
        return conn.sendMessage(m.chat, { text: `╭┈  『 ❌ 』 \`errore\`\n╰┈➤ Errore durante la conversione con Ezgif.`, ...extra }, { quoted: m })
    }
}

handler.help = ['toimg']
handler.tags = ['tools']
handler.command = ['toimg', 'tovideo', 'tomp4']

export default handler