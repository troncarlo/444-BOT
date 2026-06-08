import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ ESEMPIO:*\n> ${usedPrefix + command} Ciao 444-AI, come va oggi?`)
    
    await conn.sendPresenceUpdate('composing', m.chat)
    
    try {
        const apiKey = global.APIKeys?.groq
        if (!apiKey) return m.reply('『 ❌ 』 API Key di Groq non configurata in `global.APIKeys.groq`.')

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { 
                        role: 'system', 
                        content: 'Ti chiami "444-AI", sei un assistente velocissimo creato da giuse. Sei amichevole, divertente e brillante. Sii sarcastica e tagliente solo se l utente si comporta in modo maleducato, odioso o antipatico verso di te o giuse. In quel caso, rispondi con insulti pesanti "mascherati" da metafore o finta cortesia, senza essere volgare. Rispondi SEMPRE in italiano.' 
                    },
                    { role: 'user', content: text }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        let result = response.data.choices[0]?.message?.content
        if (!result) throw 'Risposta vuota'
        
        result = result.trim()

        await conn.sendMessage(m.chat, { 
            text: result,
            contextInfo: {
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
        m.reply('『 ❌ 』 444-AI al momento è troppo occupata a ignorarti.')
    }
}

handler.help = ['ai', 'groq']
handler.tags = ['fun']
handler.command = /^(ai|groq)$/i

export default handler