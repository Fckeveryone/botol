const fs = require('fs-extra')
const groupList = JSON.parse(fs.readFileSync('./whitelist.json'))
const { create, Client } = require('@open-wa/wa-automate')
const welcome = require('./lib/welcome')
const msgHandler = require('./msgHndlr')
const options = require('./options')

const start = async (client = new Client()) => {
        console.log('[DEV]', color('Amarr', 'blue'))
        console.log('[SERVER] Server Started!')
        // Force it to keep the current session
        client.onStateChanged((state) => {
            console.log('[Client State]', state)
            if (state === 'CONFLICT' || state === 'UNLAUNCHED') client.forceRefocus()
        })
        // listening on message
        client.onMessage((async (message) => {
            client.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 3000) {
                    client.cutMsgCache()
                }
            })
            msgHandler(client, message)
        }))
     // listen group invitation
     client.onAddedToGroup(({ groupMetadata: { id }, contact: { name } }) =>
     client.getGroupMembersId(id)
         .then((ids) => {
             console.log('[CLIENT]', color(`Invited to Group. [ ${name} : ${ids.length}]`, 'yellow'))
             // conditions if the group members are not in whitelist then the bot will leave the group
             if (groupList.includes(id)) {
                 client.sendText(id, ` *${name}* Group telah terdaftar`)
             } else {
                 client.sendText(id, ` Groups ID : ${id} *Group tidak terdaftar*, silahkan hubungi *+6281384143551* untuk mendaftar.`).then(() => client.leaveGroup(id))
             }
         }))
         
 client.onRemovedFromGroup((data) => {
     console.log(data)
 })
        client.onGlobalParicipantsChanged((async (heuh) => {
            await welcome(client, heuh)
            //left(client, heuh)
            }))
        
        /*client.onAck((x => {
            const { from, to, ack } = x
            if (x !== 3) client.sendSeen(to)
        }))*/
        
        // listening on Incoming Call
        client.onIncomingCall(( async (call) => {
            await client.sendText(call.peerJid, 'Maaf, saya tidak bisa menerima panggilan. nelfon = block!')
            .then(() => client.contactBlock(call.peerJid))
        }))
    

    }

create('botol', options(true, start))
    .then(client => start(client))
    .catch((error) => console.log(error))