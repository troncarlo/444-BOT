import fs from 'fs'
import path from 'path'

const cooldownPath = path.join(process.cwd(), 'media', 'cooldown_scopa.json')

const getDb = (p) => {
    if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify({}))
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return {} }
}

const saveDb = (p, data) => {
    fs.writeFileSync(p, JSON.stringify(data, null, 2))
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

let handler = async (m, { conn, text }) => {
    const jid = m.sender
    const name1 = m.pushName || jid.split('@')[0]

    let who = m.quoted
        ? m.quoted.sender
        : m.mentionedJid && m.mentionedJid[0]
            ? m.mentionedJid[0]
            : text
                ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                : ''

    if (!who || !who.includes('@')) return conn.sendMessage(m.chat, { text: '`𐔌⚠️꒱` Devi taggare qualcuno o rispondere a un messaggio.' }, { quoted: m })
    if (who === jid) return conn.sendMessage(m.chat, { text: '`𐔌⚠️꒱` Non puoi farlo da solo.' }, { quoted: m })

    let cooldowns = getDb(cooldownPath)
    const ora = Date.now()
    const lastUso = cooldowns[jid] || 0
    const tempoAttesa = 5 * 60 * 1000

    if (ora - lastUso < tempoAttesa) {
        const rimanente = tempoAttesa - (ora - lastUso)
        const minuti = Math.floor(rimanente / 60000)
        const secondi = Math.floor((rimanente % 60000) / 1000)
        return conn.sendMessage(m.chat, {
            text: `\`𐔌⏳꒱\` Calm down @${jid.split('@')[0]}, hai appena sborrato, aspetta ancora ${minuti}m e ${secondi}s.`,
            mentions: [jid]
        }, { quoted: m })
    }

    cooldowns[jid] = ora
    saveDb(cooldownPath, cooldowns)

    let name2 = who.split('@')[0]
    try {
        const meta = await conn.groupMetadata(m.chat)
        const part = meta.participants.find(p => p.id === who || p.jid === who)
        if (part?.notify) name2 = part.notify
    } catch {}

    const u1tag = `@${jid.split('@')[0]}`
    const u2tag = `@${who.split('@')[0]}`

    const iniziali = [
        `🔞 ${u1tag} ha trascinato ${u2tag} in una stanza buia...`,
        `🔞 ${u1tag} ha spinto ${u2tag} contro il muro...`,
        `🔞 ${u1tag} ha afferrato ${u2tag} per i capelli...`,
        `🔞 ${u1tag} ha bloccato ${u2tag} in un angolo...`,
        `🔞 ${u1tag} ha spinto ${u2tag} sul letto senza dire una parola...`
    ]

    const fasi = [
        [
            `🫣 ${name1} ha iniziato a spogliare ${name2}...`,
            `⚡ Il letto sta cigolando forte!`,
            `😮‍💨 ${name1} non si ferma, ${name2} non regge più...`,
            `💦 ${name1} finisce dentro ${name2}!`
        ],
        [
            `🫣 ${name1} strappa i vestiti a ${name2}...`,
            `⚡ Si sentono i rumori da tutto il piano!`,
            `😮‍💨 ${name2} implora di fermarsi ma ${name1} non ascolta...`,
            `💦 ${name1} sborra tutto su ${name2}!`
        ],
        [
            `🫣 ${name1} butta ${name2} sul letto e lo blocca...`,
            `⚡ Il letto rischia di rompersi!`,
            `😮‍💨 ${name2} urla, ${name1} non ha pietà...`,
            `💦 ${name1} crolla esausto su ${name2}!`
        ],
        [
            `🫣 ${name1} inizia lento, poi accelera su ${name2}...`,
            `⚡ Qualcuno bussa al muro dal vicino!`,
            `😮‍💨 ${name2} non riesce più a stare in piedi...`,
            `💦 ${name1} esplode dentro ${name2} senza ritegno!`
        ],
        [
            `🫣 ${name1} mette ${name2} in ginocchio...`,
            `⚡ Rumori assurdi escono da quella stanza!`,
            `😮‍💨 ${name2} ha perso il conto di quante volte ha urlato...`,
            `💦 ${name1} finisce urlando il nome di ${name2}!`
        ]
    ]

    const finali = [
        `💀 ${u1tag} ha sfondato il culo di ${u2tag} con una violenza inaudita`,
        `😵 ${u2tag} non camminerà per una settimana dopo quello che gli ha fatto ${u1tag}`,
        `🚑 ${u1tag} ha distrutto ${u2tag} — qualcuno chiami un medico`,
        `☠️ ${u2tag} è stato mandato in orbita da ${u1tag}, nessuno lo rivedrà uguale`,
        `🪦 RIP ${u2tag}, ${u1tag} non ha avuto pietà`
    ]

    const sceltaInizio = pick(iniziali)
    const sceltaFasi = pick(fasi)
    const sceltaFinale = pick(finali)

    const sent = await conn.sendMessage(m.chat, { text: sceltaInizio, mentions: [jid, who] }, { quoted: m })
    if (!sent?.key) return

    for (let i = 0; i < sceltaFasi.length; i++) {
        await delay(2500)
        await conn.sendMessage(m.chat, {
            text: sceltaFasi[i],
            edit: sent.key
        })
    }

    await delay(2500)
    await conn.sendMessage(m.chat, {
        text: sceltaFinale,
        mentions: [jid, who]
    })
}

handler.help = ['scopa', 'sex', 'tromba', 'chiava']
handler.tags = ['fun']
handler.command = /^(scopa|sex|tromba|chiava)$/i
handler.group = true

export default handler