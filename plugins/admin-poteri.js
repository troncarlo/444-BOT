import { jidNormalizedUser } from "@realvare/baileys"

var handler = async (m, { conn, text, command }) => {
  let action, successMsg, errorMsg, helpMsg;
  if (['promote', 'promuovi', 'p'].includes(command)) {
    action = 'promote';
    successMsg = `『 ✅ 』 \`È stato promosso al ruolo di amministratore.\``;
    errorMsg = `『 ❌ 』 \`Errore nel promuovere l'utente.\``;
    helpMsg = `『 👤 』 \`A chi vuoi dare amministratore?\``;
  } else if (['demote', 'retrocedi', 'r'].includes(command)) {
    action = 'demote';
    successMsg = `『 ✅ 』 \`È stato retrocesso dal ruolo di amministratore.\``;
    errorMsg = `『 ❌ 』 \`Errore nel retrocedere l'utente.\``;
    helpMsg = `『 👤 』 \`A chi vuoi togliere amministratore?\``;
  } else {
    return;
  }

  let number;
  if (m.mentionedJid && m.mentionedJid[0]) {
    number = m.mentionedJid[0].split('@')[0];
  } else if (m.quoted && m.quoted.sender) {
    number = m.quoted.sender.split('@')[0];
  } else if (text && !isNaN(text)) {
    number = text.replace(/[^0-9]/g, '');
  } else if (text) {
    let match = text.match(/@(\d+)/);
    if (match) number = match[1];
  } else {
    return m.reply(helpMsg);
  }

  if (!number || number.length < 7 || number.length > 15) {
    return m.reply(`『 🩼 』 \`Menziona un numero valido.\``);
  }

  let user = number + '@s.whatsapp.net';
  const target = jidNormalizedUser(user);

  const botId = jidNormalizedUser(conn.user.id);
  if (target === botId) {
    return m.reply(`『 ❌ 』 \`Non posso modificare il mio stesso ruolo.\``);
  }

  const owners = (global.owner || []).map(o => jidNormalizedUser(o[0] + '@s.whatsapp.net'));
  if (owners.includes(target)) {
    return m.reply(`『 ❌ 』 \`Non posso modificare il ruolo del mio creatore.\``);
  }

  const metadata = await conn.groupMetadata(m.chat);
  let participant = metadata.participants.find(p => 
    jidNormalizedUser(p.id) === target || 
    (p.jid && jidNormalizedUser(p.jid) === target) || 
    (p.lid && jidNormalizedUser(p.lid) === target)
  );

  if (participant && participant.admin === 'superadmin') {
    return m.reply(`『 ❌ 』 \`Non posso modificare il ruolo del creatore del gruppo.\``);
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], action);
    m.reply(successMsg);
  } catch (e) {
    m.reply(errorMsg);
  }
};

handler.help = ['promuovi', 'retrocedi', 'p', 'r'];
handler.tags = ['admin'];
handler.command = ['promote', 'promuovi', 'p', 'demote', 'retrocedi', 'r'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;