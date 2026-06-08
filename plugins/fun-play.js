import { exec } from 'child_process'
import { promisify } from 'util'
import search from 'youtube-search-api'
import { unlinkSync, readFileSync, existsSync, readdirSync, mkdirSync } from 'fs'
import path from 'path'

const execPromise = promisify(exec)

let handler = async (m, { conn, command, args, usedPrefix }) => {
    const tmpDir = path.resolve('./tmp')
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })

    const cookiePath = path.resolve('./cookies.txt')
    
    if (!existsSync(cookiePath)) {
        return m.reply('❌ Il file `cookies.txt` non è stato trovato nella directory principale.')
    }

    const cookieFlag = `--cookies "${cookiePath}"`

    if (command === 'play' && !args.length) {
        return m.reply(`🏮 Uso: \`${usedPrefix}play [titolo]\``)
    }

    if (args[0] === 'audio' || args[0] === 'video') {
        let isAudio = args[0] === 'audio'
        let url = args[1]
        if (!url || !url.includes('youtu')) return m.reply('🏮 Link non valido.')

        await m.reply(`⏳ Scaricando ${isAudio ? 'audio' : 'video'}...`)
        let baseName = `${Date.now()}`
        let cmd = [
            'yt-dlp',
            cookieFlag,
            '--js-runtime node',
            '--force-ipv4',
            '--no-warnings',
            '--no-check-certificate',
            isAudio ? '-f "ba/b" --extract-audio --audio-format mp3' : '-S "vcodec:h264,res:720,acodec:m4a" --merge-output-format mp4',
            `-o "${tmpDir}/${baseName}.%(ext)s"`,
            `"${url}"`
        ].join(' ')

        try {
            await execPromise(cmd)
            let files = readdirSync(tmpDir)
            let found = files.find(f => f.startsWith(baseName) && !f.endsWith('.txt'))
            if (!found) throw new Error('File non generato')
            
            let finalPath = path.join(tmpDir, found)
            let data = readFileSync(finalPath)
            
            if (isAudio) {
                await conn.sendMessage(m.chat, { audio: data, mimetype: 'audio/mpeg', fileName: `audio.mp3` }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { video: data, mimetype: 'video/mp4', caption: '> 444 bot' }, { quoted: m })
            }
            unlinkSync(finalPath)
        } catch (e) {
            console.error(e)
            m.reply(`❌ Errore durante il download.`)
        }
        return
    }

    let query = args.join(' ')
    let results = await search.GetListByKeyword(query, false, 1)
    if (!results || !results.items || results.items.length === 0) return m.reply('❌ Nessun risultato.')

    const v = results.items[0]
    const videoUrl = `https://www.youtube.com/watch?v=${v.id}`
    let thumb = v.thumbnail?.thumbnails?.[0]?.url || ''
    if (thumb.startsWith('//')) thumb = 'https:' + thumb

    let caption = `╭┈➤ 『 🎵 』 *444TUBE*\n┆  『 📌 』 \`titolo\` ─ ${v.title}\n╰┈➤ 『 📦 』 \`444 bot\``

    const buttons = [
        { buttonId: `${usedPrefix}play audio ${videoUrl}`, buttonText: { displayText: '🎵 AUDIO' }, type: 1 },
        { buttonId: `${usedPrefix}play video ${videoUrl}`, buttonText: { displayText: '🎥 VIDEO' }, type: 1 }
    ]

    const buttonMessage = {
        image: { url: thumb },
        caption: caption,
        footer: 'Seleziona un formato',
        buttons: buttons,
        headerType: 4
    }

    return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.command = ['play']
export default handler;