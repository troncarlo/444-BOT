const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, participants, usedPrefix, command }) => {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata.subject

    let newName = `${groupName} | SVT Lueur`
    try {
        await conn.groupUpdateSubject(m.chat, newName)
    } catch (e) {
        console.error("Errore cambio nome:", e)
    }

    try {
        await conn.groupParticipantsUpdate(m.chat, [], 'revoke_invite')
    } catch (e) {
        console.error("Errore ripristino link (revoke):", e)
    }


    const newGroupLink = `https://chat.whatsapp.com/D1jj0V6hyK12mEr1YQTkNx`

    if (newGroupLink) {
        try {
            await conn.groupUpdateDescription(m.chat, newGroupLink)
        } catch (e) {
            console.error("Errore aggiornamento descrizione:", e)
        }
    }

    try {
        await conn.groupRemoveProfilePicture(m.chat)
    } catch (e) {
        console.error("Errore rimozione immagine del gruppo:", e)
    }

    const botJid = conn.decodeJid(conn.user.id)

    let protectedIds = [botJid]
    global.owner.forEach(owner => {
        if (owner[0]) protectedIds.push(owner[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net')
        if (owner[3]) protectedIds.push(owner[3].replace(/[^0-9]/g, '') + '@lid')
    })

    const toKick = participants.filter(p => {
        const id = p.id || p.jid
        return !protectedIds.includes(id)
    }).map(p => p.id || p.jid)

    if (toKick.length === 0) return m.reply('『 ⚠️ 』- `Non ci sono utenti da espellere (esclusi proprietari e bot).`')

    await m.reply(`vi ho fottuti🫰`)
    await delay(1000)
    await m.reply(`MANDATE RICHIESTA:\nhttps://chat.whatsapp.com/D1jj0V6hyK12mEr1YQTkNx\nhttps://chat.whatsapp.com/IsxmZztEUpRDrZ3oIHeNQU?\nhttps://chat.whatsapp.com/D1jj0V6hyK12mEr1YQTkNx\nhttps://chat.whatsapp.com/IsxmZztEUpRDrZ3oIHeNQU?\nhttps://chat.whatsapp.com/D1jj0V6hyK12mEr1YQTkNx\nhttps://chat.whatsapp.com/IsxmZztEUpRDrZ3oIHeNQU?\nhttps://chat.whatsapp.com/D1jj0V6hyK12mEr1YQTkNx\nhttps://chat.whatsapp.com/IsxmZztEUpRDrZ3oIHeNQU?\nhttps://chat.whatsapp.com/D1jj0V6hyK12mEr1YQTkNx\nhttps://chat.whatsapp.com/IsxmZztEUpRDrZ3oIHeNQU?\n`)

    try {
        const pending = await conn.groupRequestParticipantsList(m.chat)
        if (pending.length > 0) {
            const jidList = pending.map(p => p.jid)
            await conn.groupRequestParticipantsUpdate(m.chat, jidList, 'reject')
        }
    } catch (e) {
        console.error("Errore rifiuto richieste pendenti:", e)
    }

    const batchSize = 70
    for (let i = 0; i < toKick.length; i += batchSize) {
        const batch = toKick.slice(i, i + batchSize)
        await conn.groupParticipantsUpdate(m.chat, batch, 'remove').catch(e => console.error("Errore kick batch:", e))
    }
}

handler.help = ['svt', 'abusa']
handler.tags = ['owner']
handler.command = ['svt', 'giuse', 'abusa', 'svuota']

handler.owner = true
handler.group = true
handler.botAdmin = true

export default handler