import pkg from '@realvare/baileys'
const { USyncQuery, USyncUser } = pkg

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) return jid.split(':')[0] + '@' + jid.split('@')[1]
        return jid.replace(/@lid$/, '@s.whatsapp.net')
    }

    let target = text ? text.replace(/[^0-9]/g, '') : (m.quoted ? m.quoted.sender.replace(/[^0-9]/g, '') : null)
    if (!target) return m.reply(`*Esempio:* ${usedPrefix + command} 3912345678`)

    const jid = target + '@s.whatsapp.net'
    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let res = await conn.numcheck(target)
        let { banned, violation_type, data, error } = res
        let reason = res.reason || error?.reason || data?.reason

        let devices = [], lid = null, waUsername = '', pushName = ''
        try {
            const query = new USyncQuery().withContext('message').withDeviceProtocol().withLIDProtocol()
            query.withUser(new USyncUser().withId(jid))
            const usyncRes = await conn.executeUSyncQuery(query)
            if (usyncRes?.list?.[0]) {
                const uData = usyncRes.list[0]
                devices = uData.devices?.deviceList || []
                lid = uData.lid
                pushName = uData.contact?.pushName || ''
                waUsername = uData.contact?.username || ''
            }
        } catch (e) {}

        let pfp = null, statusAbout = '', bizInfo = null
        try { pfp = await conn.profilePictureUrl(jid, 'image') } catch (e) {}
        try { statusAbout = (await conn.fetchStatus(jid))?.status || '' } catch (e) {}
        try { bizInfo = await conn.getBusinessProfile(jid) } catch (e) {}

        const violationMap = {
            "1": "Violazione generica dei Termini di Servizio",
            "2": "Abuso segnalato da altri utenti",
            "3": "Creazione automatizzata o scraping",
            "4": "Attività sospetta",
            "5": "Spam / link non richiesti",
            "6": "Invio messaggi massivo a non-contatti",
            "7": "Accesso non autorizzato",
            "10": "Comportamento abusivo",
            "11": "Sospetta frode o truffa",
            "12": "Diffusione non autorizzata di dati personali",
            "14": "Uso di app non ufficiali (Modded WhatsApp)",
            "15": "Spam automatizzato",
            "17": "Violazione regole commerciali (Spam aziendale)",
            "21": "Bulk messaging / spam massivo",
            "26": "Contenuto inappropriato",
            "32": "Violazione ripetuta",
            "35": "Violazione grave (Permanente)"
        }

        const statoTesto = banned ? 'BANNATO ❌' : (['incorrect', 'not_banned_invalid_params', 'invalid_skey'].includes(reason) ? 'ATTIVO ✅' : 'NON REGISTRATO ⚪')

        let txt = `╭┈➤ 『 🔍 』 *444 NUMCHECK*\n`
        txt += `┆  『 👤 』 *User:* @${target}\n`
        if (pushName || waUsername) txt += `┆  『 🏷️ 』 *Nome:* ${pushName || waUsername}\n`
        if (lid) txt += `┆  『 🆔 』 *LID:* ${lid}\n`
        txt += `┆  『 🛡️ 』 *Stato:* ${statoTesto}\n`
        txt += `┆  『 📝 』 *Raw:* ${reason || 'none'}\n`
        
        if (banned && violation_type) {
            txt += `┆  『 🚫 』 *Ban Type:* ${violation_type}\n`
            txt += `┆  『 📄 』 *Motivo:* ${violationMap[violation_type] || 'Sconosciuto'}\n`
        }

        if (devices.length > 0) {
            txt += `┆\n┆  『 💻 』 *DISPOSITIVI:* ${devices.length}\n`
            devices.forEach(d => {
                let type = d.id === 0 ? 'Smartphone' : (d.id <= 20 ? 'Web' : 'Desktop')
                txt += `┆     ↳ [${d.id}] ${type}\n`
            })
        }

        const buttons = []
        buttons.push({ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copia Numero", copy_code: target }) })
        
        if (statusAbout) buttons.push({ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copia Bio", copy_code: statusAbout }) })
        
        if (bizInfo) {
            txt += `┆\n┆  『 💼 』 *BUSINESS INFO*\n`
            txt += `┆  『 🏷️ 』 *Cat:* ${bizInfo.category || 'N/D'}\n`
            if (bizInfo.email) buttons.push({ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copia Email", copy_code: bizInfo.email }) })
        }

        txt += `╰┈➤ 『 📦 』 \`annoyed system\``

        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:444 𝘾𝙃𝙀𝘾𝙆\nTEL;type=CELL;type=VOICE;waid=${target}:+${target}\nEND:VCARD`
        const fakeObj = {
            key: { participant: jid, remoteJid: m.chat, fromMe: false, id: 'PREM' + Date.now() },
            message: { contactMessage: { displayName: `_*444*_ 𝘾𝙃𝙀𝘾𝙆`, vcard: vcard } }
        }

        await conn.relayMessage(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: txt },
                        header: { title: `Report per +${target}`, hasSubtitle: true },
                        nativeFlowMessage: { buttons: buttons },
                        contextInfo: {
                            ...global.newsletter?.().contextInfo,
                            mentionedJid: [jid],
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
        m.reply(`*ERRORE:* ${e.message || e}`)
    }
}

handler.help = ['checknum']
handler.tags = ['tools']
handler.command = /^(checknum|bancheck|numcheck)$/i
handler.owner = true

export default handler