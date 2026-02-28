const flags = [
    { emoji: '🇮🇹', name: 'italia' },
    { emoji: '🇫🇷', name: 'francia' },
    { emoji: '🇩🇪', name: 'germania' },
    { emoji: '🇪🇸', name: 'spagna' },
    { emoji: '🇬🇧', name: 'regno unito' },
    { emoji: '🇺🇸', name: 'stati uniti' },
    { emoji: '🇯🇵', name: 'giappone' },
    { emoji: '🇨🇳', name: 'cina' },
    { emoji: '🇧🇷', name: 'brasile' },
    { emoji: '🇦🇷', name: 'argentina' },
    { emoji: '🇷🇺', name: 'russia' },
    { emoji: '🇨🇦', name: 'canada' },
    { emoji: '🇦🇺', name: 'australia' },
    { emoji: '🇮🇳', name: 'india' },
    { emoji: '🇲🇽', name: 'messico' },
    { emoji: '🇿🇦', name: 'sudafrica' },
    { emoji: '🇰🇷', name: 'corea del sud' },
    { emoji: '🇪🇬', name: 'egitto' },
    { emoji: '🇬🇷', name: 'grecia' },
    { emoji: '🇨🇭', name: 'svizzera' },
    { emoji: '🇳🇱', name: 'paesi bassi' },
    { emoji: '🇸🇪', name: 'svezia' },
    { emoji: '🇳🇴', name: 'norvegia' },
    { emoji: '🇩🇰', name: 'danimarca' },
    { emoji: '🇫🇮', name: 'finlandia' },
    { emoji: '🇵🇹', name: 'portogallo' },
    { emoji: '🇮🇪', name: 'irlanda' },
    { emoji: '🇹🇷', name: 'turchia' },
    { emoji: '🇺🇦', name: 'ucraina' },
    { emoji: '🇵🇱', name: 'polonia' },
    { emoji: '🇦🇹', name: 'austria' },
    { emoji: '🇧🇪', name: 'belgio' },
    { emoji: '🇨🇴', name: 'colombia' },
    { emoji: '🇨🇱', name: 'cile' },
    { emoji: '🇵🇪', name: 'peru' },
    { emoji: '🇻🇪', name: 'venezuela' },
    { emoji: '🇨🇺', name: 'cuba' },
    { emoji: '🇯🇲', name: 'giamaica' },
    { emoji: '🇲🇦', name: 'marocco' },
    { emoji: '🇳🇬', name: 'nigeria' }
]

function shuffle(array) {
    let currentIndex = array.length, randomIndex
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
}

let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
    conn.bandiera = conn.bandiera || {}

    if (command === 'skipbandiera') {
        if (!isAdmin && !m.fromMe) return m.reply('『 ⚠️ 』 _Solo gli admin possono saltare la partita._')
        if (!conn.bandiera[m.chat]) return m.reply('『 ⚠️ 』 _Nessuna partita in corso in questo gruppo._')
        
        clearTimeout(conn.bandiera[m.chat].timeout)
        let risposta = conn.bandiera[m.chat].rispostaOriginale.toUpperCase()
        delete conn.bandiera[m.chat]
        
        return m.reply(`『 ✅ 』 _Partita saltata con successo. Lo stato era:_ *${risposta}*`)
    }

    if (command === 'bandiera') {
        if (args.length > 0) {
            if (!conn.bandiera[m.chat]) return m.reply(`『 ⚠️ 』 _Nessuna partita in corso!_`)
            
            const game = conn.bandiera[m.chat]
            const guess = args.join(' ').toLowerCase().trim()
            
            global.db.data.users[m.sender] = global.db.data.users[m.sender] || { exp: 0, money: 0 }

            if (guess === game.stato) {
                clearTimeout(game.timeout)
                
                const timeTaken = Math.round((Date.now() - game.startTime) / 1000)
                let xp = Math.floor(Math.random() * 20) + 30
                let money = Math.floor(Math.random() * 10) + 5
                
                const timeBonus = timeTaken <= 10 ? 20 : timeTaken <= 20 ? 10 : 0
                xp += timeBonus
                
                global.db.data.users[m.sender].exp += xp
                global.db.data.users[m.sender].money += money
                
                let congratsMsg = `『 🎉 』 _Corretto! Lo stato era_ *${game.rispostaOriginale.toUpperCase()}*\n\n`
                congratsMsg += `『 ⏱️ 』 _Tempo:_ ${timeTaken}s\n`
                congratsMsg += `『 🎁 』 _Ricompensa:_ +${xp} XP, +${money} €`
                
                delete conn.bandiera[m.chat]
                return m.reply(congratsMsg)

            } else {
                game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1
                const tentativiRimasti = 3 - game.tentativi[m.sender]

                if (tentativiRimasti <= 0) {
                    return m.reply(`『 ❌ 』 _Hai esaurito i 3 tentativi disponibili!_\n『 ⏳ 』 _Aspetta che altri provino o che scada il tempo._`)
                } else {
                    return m.reply(`『 ❌ 』 _Sbagliato! Ti restano_ *${tentativiRimasti}* _tentativi._`)
                }
            }
        }

        if (conn.bandiera[m.chat]) return m.reply(`『 ⚠️ 』 _C'è già una partita in corso!\nScegli un'opzione dai bottoni._`)
        
        const correctFlag = flags[Math.floor(Math.random() * flags.length)]
        
        let options = [correctFlag]
        while (options.length < 5) {
            let randomWrong = flags[Math.floor(Math.random() * flags.length)]
            if (!options.some(opt => opt.name === randomWrong.name)) {
                options.push(randomWrong)
            }
        }
        
        options = shuffle(options)
        
        let buttons = options.map(opt => ({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ 
                display_text: opt.name.toUpperCase(), 
                id: `${usedPrefix}bandiera ${opt.name}` 
            })
        }))
        
        let testo = `『 🏴 』 _Indovina la bandiera:_ ${correctFlag.emoji}\n\n『 ⏳ 』 _Tempo:_ 30 secondi\n『 💡 』 _Tentativi:_ 3 a persona\n\n_Scegli l'opzione corretta dai bottoni qui sotto!_`
        
        const msg = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { title: "", hasMediaAttachment: false },
                        body: { text: testo },
                        nativeFlowMessage: { buttons: buttons }
                    }
                }
            }
        }
        
        await conn.relayMessage(m.chat, msg, {})
        
        conn.bandiera[m.chat] = {
            stato: correctFlag.name.toLowerCase(),
            rispostaOriginale: correctFlag.name,
            tentativi: {},
            startTime: Date.now(),
            timeout: setTimeout(() => {
                if (conn.bandiera[m.chat]) {
                    m.reply(`『 ⌛ 』 _Tempo scaduto! Lo stato era:_ *${correctFlag.name.toUpperCase()}*`)
                    delete conn.bandiera[m.chat]
                }
            }, 30000)
        }
    }
}

handler.help = ['bandiera', 'skipbandiera']
handler.tags = ['giochi']
handler.command = /^(bandiera|skipbandiera)$/i
handler.group = true

export default handler