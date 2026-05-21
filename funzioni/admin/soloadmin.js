export async function soloadmin(m, { isAdmin, isOwner, isMod }) {
    if (m.isBaileys || !m.isGroup) return true
    
    const chat = global.db.data.groups[m.chat]
    
    if (chat?.soloadmin) {
        const isAuthorized = isAdmin || isMod || isOwner || m.fromMe
        
        if (!isAuthorized) {
            return false
        }
    }
    
    return true
}
