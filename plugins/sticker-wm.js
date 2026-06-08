import { downloadContentFromMessage } from '@realvare/baileys'
import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!m.quoted || !m.quoted.message) {
    return m.reply(`『 ⚠️ 』 \`Rispondi allo sticker che vuoi personalizzare\``)
  }

  let stickerMessage = m.quoted.message.stickerMessage
  if (!stickerMessage) {
    return m.reply(`『 ⚠️ 』 \`Rispondi a uno sticker valido\``)
  }

  let stiker = false
  try {
    if (!text) {
      let name = conn.getName ? conn.getName(m.sender) : m.pushName || '444bot'
      text = `${name}|444bot`
    }

    let [packname, ...author] = text.split('|')
    author = (author || []).join('|')

    const stream = await downloadContentFromMessage(stickerMessage, 'sticker')
    let img = Buffer.from([])
    for await (const chunk of stream) {
      img = Buffer.concat([img, chunk])
    }

    if (!img || img.length === 0) {
      return conn.sendMessage(m.chat, { text: `${global.errore || '❌ Errore nel download.'}` }, { quoted: m })
    }
    
    stiker = await addExif(img, packname || '', author || '')

  } catch (e) {
    console.error('Errore in sticker-wm:', e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    if (stiker) {
      await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { text: `${global.errore || '❌ Errore nella creazione.'}` }, { quoted: m })
    }
  }
}

handler.help = ['wm']
handler.tags = ['sticker', 'strumenti']
handler.command = ['take', 'wm']
export default handler