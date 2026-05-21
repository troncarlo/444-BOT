import { detectDevice } from '../lib/device.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) return jid.split(':')[0] + '@' + jid.split('@')[1]
        return jid.replace(/@lid$/, '@s.whatsapp.net')
    }

    let who
    let messageId = null

    if (m.quoted) {
        who = decodeJid(m.quoted.sender)
        messageId = m.quoted.id
    } else if (m.mentionedJid && m.mentionedJid[0]) {
        who = decodeJid(m.mentionedJid[0])
    } else if (text) {
        who = decodeJid(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    } else {
        return m.reply(`*Esempio:* ${usedPrefix + command} @tag / numero / reply`)
    }

    const target = who.split('@')[0]
    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let rawPlatform = 'unknown'
        
        if (messageId) {
            rawPlatform = detectDevice(messageId)
        } else {
            try {
                const res = await conn.numcheck(target)
                rawPlatform = res.abProps?.platform || res.data?.platform || res.error?.platform || 'unknown'
            } catch (e) {}
        }

        const osMap = {
            'android': 'Android 🤖',
            'ios': 'iOS 🍎',
            'smba': 'Android Business 💼',
            'smbi': 'iOS Business 💼',
            'web': 'WhatsApp Web 🌐',
            'desktop': 'WhatsApp Desktop 💻',
            'mac': 'macOS 💻',
            'win': 'Windows 💻',
            'unknown': 'Sconosciuto ❓'
        }
        let device = osMap[rawPlatform] || rawPlatform

        let txt = `╭┈➤ 『 📱 』 *INFO DEVICE*\n`
        txt += `┆  『 👤 』 *UTENTE:* @${target}\n`
        txt += `╰┈➤ 『 ⚙️ 』 *DISPOSITIVO:* ${device}`

        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:444 𝙒𝙃𝙊𝙎\nTEL;type=CELL;type=VOICE;waid=${target}:+${target}\nEND:VCARD`
        const fakeObj = {
            key: { participant: who, remoteJid: m.chat, fromMe: false, id: 'WHOS' + Date.now() },
            message: { contactMessage: { displayName: `444 𝙒𝙃𝙊𝙎`, vcard: vcard } }
        }

        await conn.relayMessage(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: txt },
                        nativeFlowMessage: { buttons: [] },
                        contextInfo: {
                            ...global.newsletter?.().contextInfo,
                            mentionedJid: [who],
                            quotedMessage: fakeObj.message,
                            participant: fakeObj.key.participant,
                            stanzaId: fakeObj.key.id,
                            remoteJid: m.chat
                        }
                    }
                }
            }
        }, {})

    } catch (e) {
        console.error(e)
        m.reply('_Errore nel recupero del dispositivo._')
    }
}

handler.help = ['whos']
handler.tags = ['tools']
handler.command = /^(whos|dispositivi|device)$/i
handler.owner = true

export default handler