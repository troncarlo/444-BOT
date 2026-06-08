import fs from 'fs'

const walletPath = './media/wallet.json'
const inventoryPath = './media/inventory.json'
const bancaPath = './media/banca.json'

const getDb = (path) => {
    if (!fs.existsSync('./media')) fs.mkdirSync('./media')
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}))
    return JSON.parse(fs.readFileSync(path, 'utf-8'))
}

const saveDb = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

const generateCard = () => {
    const isPremium = Math.random() > 0.8 
    const brand = isPremium ? 'MASTERCARD' : 'VISA'
    const prefix = isPremium ? '5' : '4'
    let number = prefix
    for (let i = 0; i < 15; i++) number += Math.floor(Math.random() * 10)
    
    return {
        brand: brand,
        tier: isPremium ? 'BLACK' : 'STANDARD',
        number: number.match(/.{1,4}/g).join(' '),
        cashback: isPremium ? 0.05 : 0.01,
        color: isPremium ? 'linear-gradient(135deg, #0f0f0f 0%, #annoyed 100%)' : 'linear-gradient(135deg, #002366 0%, #0056b3 100%)'
    }
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const jid = m.sender

    let walletDb = getDb(walletPath)
    let inventoryDb = getDb(inventoryPath)
    let bancaDb = getDb(bancaPath)

    if (!walletDb[jid]) walletDb[jid] = { money: 0, bank: 0 }
    if (!inventoryDb[jid]) inventoryDb[jid] = { canna: 0, piccone_lvl: 1, zaino_lvl: 1, carbone: 0, ferro: 0, oro: 0, diamante: 0 }
    if (!bancaDb[jid]) bancaDb[jid] = { hasCard: false }

    let pLvl = inventoryDb[jid].piccone_lvl || 1
    let zLvl = inventoryDb[jid].zaino_lvl || 1

    let prezzoPiccone = pLvl * 450
    let prezzoZaino = zLvl * 350

    if (!args[0] || (args[0] !== 'buy' && args[0] !== 'compra')) {
        const title = "🛒 NEGOZIO RPG"
        const headers = ["『🪧』", "『💶』", "『💌』"]
        const rows = [
            ["『💳』Carta", "200€", bancaDb[jid].hasCard ? "✅" : "MAX 1"],
            ["『🎣』Canna", "500€", inventoryDb[jid].canna >= 1 ? "✅" : "MAX 1"],
            ["『⛏️』Piccone", `${prezzoPiccone}€`, `Lvl. ${pLvl}`],
            ["『🎒』Zaino", `${prezzoZaino}€`, `Lvl. ${zLvl}`]
        ]

        await conn.sendTable(m.chat, title, headers, rows, m)

        let footerTxt = `\n*Scegli un'opzione qui sotto per upgradare, oppure scrivi:* \`${usedPrefix + command} buy [nome_item]\`\n\n*Saldo attuale:* ${walletDb[jid].money || 0}€`
        
        const buttons = [
            { buttonId: `${usedPrefix}${command} buy piccone`, buttonText: { displayText: '⛏️ UPGRADE PICCONE' }, type: 1 },
            { buttonId: `${usedPrefix}${command} buy zaino`, buttonText: { displayText: '🎒 UPGRADE ZAINO' }, type: 1 }
        ]

        const messageOptions = {
            text: footerTxt,
            mentions: [jid],
            ...global.newsletter()
        }

        if (buttons.length > 0) {
            messageOptions.buttons = buttons
            messageOptions.headerType = 1
        }

        return await conn.sendMessage(m.chat, messageOptions, { quoted: m })
    }

    if ((args[0] === 'buy' || args[0] === 'compra') && args[1]) {
        const item = args[1].toLowerCase()
        const money = walletDb[jid].money

        if (item === 'carta') {
            if (bancaDb[jid].hasCard) return m.reply('`𐔌⚠️꒱` Hai già acquistato la Carta Magnetica.')
            if (money < 200) return m.reply('`𐔌❌꒱` Fondi insufficienti. Servono 200€.')
            
            walletDb[jid].money -= 200
            const newCard = generateCard()
            bancaDb[jid] = { hasCard: true, ...newCard, cardNumber: newCard.number }
            
            saveDb(walletPath, walletDb)
            saveDb(bancaPath, bancaDb)
            return m.reply(`\`𐔌✅꒱\` *CARTA EMESSA CON SUCCESSO*\nTipologia: ${newCard.brand} ${newCard.tier}`)
        }

        if (item === 'canna') {
            if (inventoryDb[jid].canna >= 1) return m.reply('`𐔌⚠️꒱` Hai già acquistato una Canna da Pesca.')
            if (money < 500) return m.reply('`𐔌❌꒱` Fondi insufficienti. Servono 500€.')
            
            walletDb[jid].money -= 500
            inventoryDb[jid].canna = 1
            
            saveDb(walletPath, walletDb)
            saveDb(inventoryPath, inventoryDb)
            return m.reply('\`𐔌✅꒱\` *CANNA DA PESCA ACQUISTATA*\nPuoi ora andare a pescare.')
        }

        if (item === 'piccone') {
            if (pLvl >= 5) return m.reply('`𐔌⚠️꒱` Hai già il piccone al livello massimo (Lvl. 5).')
            if (money < prezzoPiccone) return m.reply(`\`𐔌❌꒱\` Fondi insufficienti. Servono ${prezzoPiccone}€.`)
            
            walletDb[jid].money -= prezzoPiccone
            inventoryDb[jid].piccone_lvl = pLvl + 1
            
            saveDb(walletPath, walletDb)
            saveDb(inventoryPath, inventoryDb)
            return m.reply(`\`𐔌✅꒱\` *PICCONE POTENZIATO*\nPassato al livello *${pLvl + 1}*!`)
        }

        if (item === 'zaino') {
            if (zLvl >= 5) return m.reply('`𐔌⚠️꒱` Hai già lo zaino al livello massimo (Lvl. 5).')
            if (money < prezzoZaino) return m.reply(`\`𐔌❌꒱\` Fondi insufficienti. Servono ${prezzoZaino}€.`)
            
            walletDb[jid].money -= prezzoZaino
            inventoryDb[jid].zaino_lvl = zLvl + 1
            
            saveDb(walletPath, walletDb)
            saveDb(inventoryPath, inventoryDb)
            return m.reply(`\`𐔌✅꒱\` *ZAINO POTENZIATO*\nPassato al livello *${zLvl + 1}*!`)
        }

        return m.reply('`𐔌❌꒱` Oggetto non trovato nel negozio.')
    }
}

handler.help = ['shop']
handler.tags = ['rpg']
handler.command = /^(shop|negozio)$/i

export default handler