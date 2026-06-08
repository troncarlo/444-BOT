import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { downloadContentFromMessage } from '@realvare/baileys'
import { addExif } from '../lib/sticker.js'

const handler = async (m, { conn, usedPrefix, command }) => {
    const extra = global.newsletter ? global.newsletter() : {}
    const q = m.quoted ? m.quoted : m
    
    let mtype = q.mtype || Object.keys(q.message || {})[0] || ''
    let msgNode = q.message || q.msg || {}

    while (['viewOnceMessage', 'viewOnceMessageV2', 'documentWithCaptionMessage', 'interactiveMessage', 'templateMessage', 'buttonsMessage'].includes(mtype)) {
        if (mtype === 'viewOnceMessage' || mtype === 'viewOnceMessageV2') {
            msgNode = msgNode[mtype]?.message || msgNode
            mtype = Object.keys(msgNode)[0]
        } else if (mtype === 'interactiveMessage') {
            msgNode = msgNode[mtype]?.header || msgNode
            mtype = msgNode.hasMediaAttachment && msgNode.imageMessage ? 'imageMessage' 
                  : msgNode.videoMessage ? 'videoMessage' 
                  : mtype
            if (mtype === 'imageMessage') msgNode = { imageMessage: msgNode.imageMessage }
            if (mtype === 'videoMessage') msgNode = { videoMessage: msgNode.videoMessage }
        } else if (mtype === 'documentWithCaptionMessage') {
            msgNode = msgNode[mtype]?.message || msgNode
            mtype = Object.keys(msgNode)[0]
        } else {
            break
        }
    }

    let mediaObj = msgNode[mtype] || msgNode
    let mime = mediaObj?.mimetype || mtype

    if (!/image|video|webp/i.test(mime)) {
        return conn.sendMessage(m.chat, {
            text: `╭┈  『 ⚠️ 』 \`errore\`\n╰┈➤ Rispondi a un'immagine o video con ${usedPrefix + command}`,
            ...extra
        }, { quoted: m })
    }

    const isVideo = /video/i.test(mime) || mtype.includes('video')
    const ext = isVideo ? '.mp4' : '.jpg'
    const mediaDir = path.join(process.cwd(), 'media', 'tosticker')
    if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true })
    
    const timestamp = Date.now()
    const tmpIn = path.join(mediaDir, `temp_${timestamp}${ext}`)
    const tmpOut = path.join(mediaDir, `temp_${timestamp}.webp`)

    try {
        const stream = await downloadContentFromMessage(mediaObj, mtype.replace('Message', ''))
        let media = Buffer.from([])
        for await (const chunk of stream) media = Buffer.concat([media, chunk])
        
        if (!media || media.length === 0) throw new Error('Download fallito')
        fs.writeFileSync(tmpIn, media)

        const ffmpegArgs = isVideo 
            ? `-vcodec libwebp -filter:v "scale='if(gt(iw,ih),512,-1)':'if(gt(iw,ih),-1,512)',pad=512:512:(512-iw)/2:(512-ih)/2:black@0" -pix_fmt yuva420p -compression_level 6 -q:v 40 -loop 0 -an -t 7 -preset default`
            : `-vcodec libwebp -filter:v "scale='if(gt(iw,ih),512,-1)':'if(gt(iw,ih),-1,512)',pad=512:512:(512-iw)/2:(512-ih)/2:black@0" -compression_level 6 -q:v 50 -preset default`

        exec(`ffmpeg -i "${tmpIn}" ${ffmpegArgs} "${tmpOut}"`, async (err, stdout, stderr) => {
            if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn)
            
            if (err) {
                console.error('[FFMPEG ERROR]:', stderr || err.message)
                if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut)
                return conn.sendMessage(m.chat, { 
                    text: `╭┈  『 ❌ 』 \`errore\`\n╰┈➤ Creazione sticker fallita.`, 
                    ...extra 
                }, { quoted: m })
            }

            try {
                let webp = fs.readFileSync(tmpOut)
                
                let packname = conn.getName ? conn.getName(m.sender) : m.pushName || '444bot'
                let author = global.bot || '444-bot'
                
                let stickerWithExif = await addExif(webp, packname, author)
                
                await conn.sendMessage(m.chat, { sticker: stickerWithExif, ...extra }, { quoted: m })
            } catch (exifErr) {
                console.error('[EXIF ERROR]:', exifErr)
                let webpBackup = fs.readFileSync(tmpOut)
                await conn.sendMessage(m.chat, { sticker: webpBackup, ...extra }, { quoted: m })
            } finally {
                if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut)
            }
        })
    } catch (e) {
        if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn)
        if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut)
        return conn.sendMessage(m.chat, { text: `╭┈  『 ❌ 』 \`errore\`\n╰┈➤ Errore durante l'elaborazione.`, ...extra }, { quoted: m })
    }
}

handler.help = ['sticker']
handler.tags = ['strumenti']
handler.command = ['s', 'sticker', 'stiker']

export default handler