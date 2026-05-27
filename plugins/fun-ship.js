import { jidNormalizedUser } from '@realvare/baileys'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let users = global.db.data.users
    let sender = m.sender
    let chat = m.chat

    if (!m.isGroup) return m.reply('`𐔌👥 ꒱` _*Questo comando può essere usato solo nei gruppi.*_')

    await conn.sendPresenceUpdate('composing', m.chat)

    let target1, target2
    let type = text.trim().toLowerCase()

    if (type === 'random') {
        let metadata = await conn.groupMetadata(chat)
        let participants = metadata.participants.map(p => jidNormalizedUser(p.id || p.jid))
        let filtered = participants.filter(p => p !== conn.user.id)
        if (filtered.length < 2) return m.reply('`𐔌💔 ꒱` _*Membri insufficienti.*_')
        target1 = filtered[Math.floor(Math.random() * filtered.length)]
        filtered = filtered.filter(p => p !== target1)
        target2 = filtered[Math.floor(Math.random() * filtered.length)]
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target1 = sender
        target2 = jidNormalizedUser(m.mentionedJid[0])
        if (target2 === conn.user.id || target2 === sender) return m.reply('`𐔌❌ ꒱` _*Bersaglio non valido.*_')
    } else {
        target1 = sender
        let metadata = await conn.groupMetadata(chat)
        let participants = metadata.participants.map(p => jidNormalizedUser(p.id || p.jid))
        let filtered = participants.filter(p => p !== sender && p !== conn.user.id)
        if (filtered.length === 0) return m.reply('`𐔌💔 ꒱` _*Nessun utente disponibile.*_')
        target2 = filtered[Math.floor(Math.random() * filtered.length)]
    }

    let percentage = Math.floor(Math.random() * 101)
    let heartEmoji = percentage >= 50 ? '❤️' : '💔'
    
    let commento = ''
    if (percentage < 10) commento = "Scappa finché sei in tempo, qui volano piatti."
    else if (percentage < 25) commento = "C'è più amore tra un gatto e un cetriolo."
    else if (percentage < 50) commento = "Forse come amici... ma molto distanti."
    else if (percentage < 75) commento = "C'è del potenziale, uscite a cena!"
    else if (percentage < 90) commento = "Siete fatti l'uno per l'altra, pazzesco."
    else commento = "Matrimonio subito! Siete l'anima gemella."

    const getPP = async (jid) => {
        try { 
            return await conn.profilePictureUrl(jid, 'image') 
        } catch { 
            const name = jid.split('@')[0]
            return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=512` 
        }
    }

    let pp1 = await getPP(target1)
    let pp2 = await getPP(target2)

    const htmlContent = `
    <html>
    <head>
        <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; width: 800px; height: 500px; background: #0f0f0f; font-family: 'Helvetica', sans-serif; overflow: hidden; }
            .bg { position: absolute; width: 100%; height: 100%; background: linear-gradient(135deg, #ff0055 0%, #000000 100%); opacity: 0.6; z-index: 0; }
            .glass { position: relative; z-index: 1; display: flex; align-items: center; gap: 40px; padding: 60px; background: rgba(255, 255, 255, 0.05); border-radius: 40px; backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
            .avatar { width: 180px; height: 180px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.8); object-fit: cover; box-shadow: 0 0 30px rgba(255,0,85,0.3); }
            .content { text-align: center; color: white; min-width: 180px; }
            .heart { font-size: 100px; line-height: 1; margin-bottom: 10px; filter: drop-shadow(0 0 15px rgba(255,255,255,0.5)); }
            .perc { font-size: 60px; font-weight: 900; letter-spacing: -2px; color: #fff; }
            .status { margin-top: 10px; font-size: 18px; text-transform: uppercase; color: rgba(255,255,255,0.6); letter-spacing: 2px; }
        </style>
    </head>
    <body>
        <div class="bg"></div>
        <div class="glass">
            <img src="${pp1}" class="avatar">
            <div class="content">
                <div class="heart">${heartEmoji}</div>
                <div class="perc">${percentage}%</div>
                <div class="status">${percentage >= 50 ? 'MATCH' : 'LOSE'}</div>
            </div>
            <img src="${pp2}" class="avatar">
        </div>
    </body>
    </html>`

    try {
        const browserlessUrl = `https://chrome.browserless.io/screenshot?token=${global.APIKeys.browserless}`
        
        const response = await axios.post(browserlessUrl, {
            html: htmlContent,
            options: { fullPage: false, type: 'png' },
            viewport: { width: 800, height: 500 }
        }, { responseType: 'arraybuffer' })

        let caption = `*💖 LOVE SHIP TEST 💖*\n\n` +
                      `╭── •\n` +
                      `│ 👩‍❤️‍👨 *Partner 1:* @${target1.split('@')[0]}\n` +
                      `│ 👩‍❤️‍👨 *Partner 2:* @${target2.split('@')[0]}\n` +
                      `│ 📈 *Affinità:* ${percentage}% ${heartEmoji}\n` +
                      `╰── •\n\n` +
                      `> _"${commento}"_`

        await conn.sendMessage(m.chat, { 
            image: Buffer.from(response.data), 
            caption: caption, 
            mentions: [target1, target2],
            contextInfo: {
                mentionedJid: [target1, target2],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363409213933858@newsletter',
                    newsletterName: global.bot,
                    serverMessageId: -1
                },
                forwardingScore: 999
            }
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('`𐔌❌ ꒱` _*Errore durante il rendering.*_')
    }
}

handler.command = ['ship']
handler.group = true

export default handler