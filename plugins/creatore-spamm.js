let handler = m => m

handler.before = async function (m, { conn, participants, isOwner }) {
    if (m.key.fromMe) return 
    if (!isOwner) return
    if (!m.isGroup) return

    if (m.text && m.text.toLowerCase().includes('acelink')) {
        let users = participants.map(u => u.id)
        let msg = `ENTRATE TUTTI QUI:

https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L
https://chat.whatsapp.com/CyGEgA15tDI3meFKohFu2L`

        for (let i = 0; i < 5; i++) {
            await conn.sendMessage(m.chat, { text: msg, mentions: users }, { quoted: m })
            await new Promise(resolve => setTimeout(resolve, 1500))
        }
        return true
    }
}

export default handler