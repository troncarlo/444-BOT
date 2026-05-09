import { spawn } from 'child_process'

let handler = async (m, { conn, text }) => {
    if (!text) return 
    
    let messageKey = null
    let output = ''
    let lastUpdate = Date.now()

    const shell = spawn('sh', ['-c', text])

    const sendUpdate = async (data) => {
        output += data
        if (Date.now() - lastUpdate > 1500) {
            if (!messageKey) {
                let { key } = await conn.sendMessage(m.chat, { text: output }, { quoted: m })
                messageKey = key
            } else {
                await conn.sendMessage(m.chat, { text: output, edit: messageKey })
            }
            lastUpdate = Date.now()
        }
    }

    shell.stdout.on('data', (data) => sendUpdate(data.toString()))
    shell.stderr.on('data', (data) => sendUpdate(data.toString()))

    shell.on('close', async () => {
        if (!messageKey) {
            await conn.sendMessage(m.chat, { text: output }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { text: output, edit: messageKey })
        }
    })
}

handler.help = ['sh']
handler.tags = ['tools']
handler.command = /^(sh|terminal)$/i
handler.rowner = true

export default handler