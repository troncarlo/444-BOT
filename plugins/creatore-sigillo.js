import fs from 'fs'
import path from 'path'

function getOwnerJids() {
    const ownersPath = path.join(process.cwd(), 'media', 'owners.json')
    let dynamicOwners = []
    try { dynamicOwners = JSON.parse(fs.readFileSync(ownersPath, 'utf-8')).dynamicOwners || [] } catch (e) {}
    return { dynamicOwners }
}

let handler = async (m, { conn }) => {
    const jid = m.chat
    const botJid = conn.decodeJid(conn.user.id)
    
    const groupMetadata = await conn.groupMetadata(jid).catch(() => null)
    if (!groupMetadata) return

    const { dynamicOwners } = getOwnerJids()
    const participants = groupMetadata.participants || []

    let protectedIds = [botJid]

    global.owner.forEach(owner => {
        if (owner[0]) protectedIds.push(owner[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net')
        if (owner[3]) protectedIds.push(owner[3].replace(/[^0-9]/g, '') + '@lid')
    })

    dynamicOwners.forEach(owner => {
        if (owner.jid) {
            const cleanJid = owner.jid.split('@')[0].replace(/[^0-9]/g, '')
            if (owner.jid.endsWith('@lid')) {
                protectedIds.push(cleanJid + '@lid')
            } else {
                protectedIds.push(cleanJid + '@s.whatsapp.net')
            }
        }
    })

    let lidToJidMap = {}
    participants.forEach(p => {
        const pId = p.id || ''
        let rLid = p.lid ? p.lid.split('@')[0] : (pId.includes('@lid') ? pId.split('@')[0] : null)
        let rJid = p.jid ? p.jid.split('@')[0].split(':')[0] : (pId.includes('@s.whatsapp.net') ? pId.split('@')[0].split(':')[0] : null)
        if (rLid && rJid) lidToJidMap[rLid] = rJid
    })

    const adminsToRemove = []
    const users = []

    participants.forEach(p => {
        const rawId = p.id || ''
        let realJid = conn.decodeJid(rawId)
        let rawSender = realJid.split('@')[0]
        
        if (lidToJidMap[rawSender]) {
            realJid = lidToJidMap[rawSender] + '@s.whatsapp.net'
        }

        users.push(realJid)

        if (p.admin === 'admin' || p.admin === 'superadmin') {
            if (!protectedIds.includes(realJid) && !protectedIds.includes(conn.decodeJid(rawId))) {
                adminsToRemove.push(rawId)
            }
        }
    })

    if (adminsToRemove.length > 0) {
        await conn.groupParticipantsUpdate(jid, adminsToRemove, 'demote').catch(() => {})
    }

    const txt = `_L'ora è ormai arrivata anche per questo gruppo, una luce più grande si è ora accesa e qui la potrete trovare:_\n\nhttps://chat.whatsapp.com/D1jj0V6hyK12mEr1YQTkNx\nhttps://chat.whatsapp.com/D1jj0V6hyK12mEr1YQTkNx`

    await conn.sendMessage(jid, {
        text: txt,
        mentions: users
    })
}

handler.help = ['sigilla']
handler.tags = ['owner']
handler.command = ['sigilla']
handler.owner = true
handler.group = true
handler.botAdmin = true

export default handler