import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    const bannedPath = path.join(process.cwd(), 'media', 'banned.json')
    
    let bannedData = { users: [], chats: [] }
    try { bannedData = JSON.parse(fs.readFileSync(bannedPath, 'utf-8')) } catch (e) {}

    let txt = `╭┈➤ 『 🚫 』 *LISTA BANNATI*\n`
    
    txt += `┆\n┆  『 👤 』 *UTENTI BANNATI (${bannedData.users.length}):*\n`
    if (bannedData.users.length > 0) {
        bannedData.users.forEach((user, i) => {
            txt += `┆     ${i + 1}. @${user.split('@')[0]}\n`
        })
    } else {
        txt += `┆     _Nessun utente bannato._\n`
    }

    txt += `┆\n┆  『 🏛️ 』 *CHATS BANNATE (${bannedData.chats.length}):*\n`
    if (bannedData.chats.length > 0) {
        bannedData.chats.forEach((chat, i) => {
            txt += `┆     ${i + 1}. ${chat}\n`
        })
    } else {
        txt += `┆     _Nessuna chat bannata._\n`
    }
    
    txt += `╰┈➤ 『 📦 』 \`annoyed system\``

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:444 𝘽𝘼𝙉𝙇𝙄𝙎𝙏\nTEL;type=CELL;type=VOICE;waid=${m.sender.split('@')[0]}:+${m.sender.split('@')[0]}\nEND:VCARD`
    const fakeObj = {
        key: {
            remoteJid: m.chat,
            fromMe: false,
            id: 'BANLIST_' + Date.now(),
            participant: m.sender
        },
        message: {
            contactMessage: {
                displayName: `444 𝘽𝘼𝙉𝙇𝙄𝙎𝙏`,
                vcard: vcard
            }
        }
    }

    await conn.relayMessage(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: txt },
                    nativeFlowMessage: { buttons: [] },
                    contextInfo: {
                        ...global.newsletter?.().contextInfo,
                        mentionedJid: bannedData.users,
                        quotedMessage: fakeObj.message,
                        participant: fakeObj.key.participant,
                        stanzaId: fakeObj.key.id,
                        remoteJid: m.chat
                    }
                }
            }
        }
    }, {})
}

handler.help = ['banlist']
handler.tags = ['owner']
handler.command = /^(banlist|listban)$/i
handler.owner = true

export default handler