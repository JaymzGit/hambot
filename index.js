//Import all libraries or dependecies
const botconfig = require("./botconfig.json");
const tokenfile = require("./token.json");
const Discord = require("discord.js");
const mysql = require("mysql");
const ping = require("minecraft-server-util")
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

//Check for any files in the commands folders (aka checking if the bot has the following commands or not)
fs.readdir("./commands/", (err, files) => {

//If there's a command file that ends with .js then proceed as normal otherwise, console will say "Couldn't find commands."
  if(err) console.log(err);
  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0){
    console.log("Couldn't find commands.");
    return;
  }

//To get output in console 
//>...[1:20:56 AM INFO]: [discord.js] - JS:tag.js
  jsfile.forEach((f, i) =>{
    var d = new Date().toLocaleTimeString();
    let props = require(`./commands/${f}`);
//Displays all files that are found in the commands folder
    console.log(`>...[${d} INFO]: [discord.js] - JS:${f}`);
    bot.commands.set(props.help.name, props);
  });
});

bot.on("ready", async () => {
	console.log(`\n${bot.user.username} is online!`);
	bot.user.setActivity("over Ham5teak", {type: "WATCHING"});
})

//Check for players adding reaction to selected message
bot.on('raw', event => {
const eventName = event.t;
	if(eventName == 'MESSAGE_REACTION_ADD') {
        if(event.d.message_id === '689427786754293761') {
            var reactionChannel = bot.channels.get(event.d.channel_id);
            if(reactionChannel.messages.has(event.d.message_id)) {
                return;
            }else {
                reactionChannel.fetchMessage(event.d.message_id)
                .then(msg => {
                    var msgReaction = msg.reactions.get(event.d.emoji.name + ":" + event.d.emoji.id);
                    var user = bot.users.get(event.d.user_id);
                    bot.emit('messagedReactionAdd', msgReaction, user);
                })
                .catch(err => console.log(err));
            }
        }
    }
 
//Check for players remove reaction to selected message
	else if(eventName == 'MESSAGE_REACTION_REMOVE') {
        if(event.d.message_id === '689427786754293761') {
            var reactionChannel = bot.channels.get(event.d.channel_id);
            if(reactionChannel.messages.has(event.d.message_id)) {
                return;
            }
            else {
                reactionChannel.fetchMessage(event.d.message_id)
                .then(msg => {
                    var msgReaction = msg.reactions.get(event.d.emoji.name + ":" + event.d.emoji.id);
                    var user = bot.users.get(event.d.user_id);
                    bot.emit('messagedReactionRemove', msgReaction, user);
                })
                .catch(err => console.log(err));
 
            }
        }
    }
});
 
//If they reacted to a correct emoji, they will be given a respective role.
bot.on('messageReactionAdd', (messageReaction, user) => {
    var rolename = messageReaction.emoji.name;
    var role = messageReaction.message.guild.roles.find(role => role.name.toLowerCase() == rolename.toLowerCase());
 
    if(role){
        var member = messageReaction.message.guild.members.find(member => member.id === user.id);
        if(member.roles.some(role => role.name === 'SVWarrior')) {
            return;
        }
        if(member.roles.some(role => role.name === 'SBWarrior')) {
            return;
        }
 
//If the role has been sucessfully added to them, their data gets inserted into a database.
    if(member){
        member.addRole(role.id);
        console.log('Succesfully added the role.');
        var sql = "SELECT * FROM `playerdata` WHERE playerid=" + "'" + member  + "'" + "";
        connection.query(sql);
    if(sql){
        var sql1 = "INSERT INTO `hambot`.`playerdata` (`playerid`, `rolename`) VALUES(" + "'" + member  + "'" + "," + "'" + rolename + "'" + ")";
        connection.query(sql1);
        if(sql1) {
        	console.log("Recorded player data.");
        }
    }
    else {
       	console.log("Failed to record player data. Player data already exists.")
        }
    }
	}
});
 
//When the player removes his reaction, his role gets remove, hence remove the data from database.
bot.on('messageReactionRemove', (messageReaction, user) =>{
    var rolename = messageReaction.emoji.name;
    var role = messageReaction.message.guild.roles.find(role => role.name.toLowerCase() == rolename.toLowerCase());
 
    if(role){
        var member = messageReaction.message.guild.members.find(member => member.id === user.id);
        if(member){
            member.removeRole(role.id);
            console.log('Succesfully removed the role.')
            var sql = "delete FROM `hambot`.`playerdata` WHERE playerid=" + "'" + member  + "'" + "";
            connection.query(sql);
            if(sql) {
            	console.log("Deleted player data.");
        	}
        }
    }
});


bot.on("message", async message => {

//Checks for if the channel name in lower case includes "announcements" OR "updates"
if (message.channel.name.includes("announcements") || message.channel.name.includes("updates")) {
    let user = message.author;
    let role = message.author.role;
    let channel = message.channel.name;
    if (user.bot) return;
        try {
            const name = message.member.displayName;
            //If the message is bigger than size 0 (0 = message only) (>1 = message + GIF/picture)
            if (message.attachments.size > 0) {
                var Attachment = (message.attachments).array();
                const embed = new Discord.RichEmbed()
                .setDescription(message.content)
                .setAuthor(name, message.author.avatarURL)
                .setImage(Attachment[0].url)
                .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
                .setColor('#00FFFF')
        		const sentEmbed = await message.channel.send(embed);
                await message.delete(500);
                //Logs to console an announcement was made.
                console.log(`\nAn image-inclusive announcement was made in #${channel}`)  
        		await sentEmbed.react('👍');
        		await sentEmbed.react('❤️');
            } else {
                //Does the same thing but if message doesn't include picture/GIF
                const name = message.member.displayName;
                const embed = new Discord.RichEmbed()
                .setDescription(message.content)
                .setAuthor(name, message.author.avatarURL)
                .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
                .setColor('#00FFFF')
        		const sentEmbed = await message.channel.send(embed);
                await message.delete();
                //Logs to console an announcement was made.
                console.log(`\nAn announcement was made in #${channel}`)
        		await sentEmbed.react('👍');
        		await sentEmbed.react('❤️');
            }
        } catch (error) {
            //Logs to console any errors.
            console.error(error)
        }
    }
 
//Checks for if the channel name in lower case includes "polls" or "suggestions"
if (message.channel.name.toLowerCase().includes('polls')|| message.channel.name.toLowerCase().includes('suggestions')) {
    let user = message.author;
    let role = message.author.role;
    let channel = message.channel.name;
    if (user.bot) return;
    try {
        const name = message.member.displayName;
        const embed = new Discord.RichEmbed()
        .setDescription(message.content)
        .setAuthor(name, message.author.avatarURL)
        .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
        .setColor('#00FFFF')
 
        const sentEmbed = await message.channel.send(embed);
        await message.delete();
        await sentEmbed.react('✅');
        await sentEmbed.react('❌');
    } catch (error) {
            console.error(error)
        }
}

//Alert System
if (message.content.includes("op")) {
if (message.channel.name.includes("console")){ 
    if (message.content.includes("a server operator")) {
    	//Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 689768738890973213
        const staff = '701520308976353421';
        const alerts = '701629915296170046';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "a server operator";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(staff).send(`**WARNING!** \`/op\` or \`/deop\` was used. Check \<#701629915296170046>\ for more info`);
        message.delete(200);
        bot.channels.get(alerts).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-creative")) {
if (message.content.includes("[HamAlerts] Thank you")) {
    //Channel ID for receipts = 701630463823052810
    const receipts = '701630463823052810';
    let channel = message.channel.name;
    var messageSplitted = message.content.split("\n");  
    var substring = "[HamAlerts]";
    filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
    //console.log(filtered)
    bot.channels.get(receipts).send(`\`\`\`${filtered}\`\`\``);
    }
}

if (message.channel.name.includes("console-lobby")) {
if (message.content.includes("[LP] Set * to true for ")) {
    if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for lp = 701630251666767952
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = " [LP]";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
      	bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
	}
}
}

if (message.channel.name.includes("console-survival")) {
if (message.content.includes("[LP] Set * to true for ")) {
    if(message.content.includes("[Messaging] Sending log with id:")){
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = " [LP]";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
      	bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
	}
}
}

if (message.channel.name.includes("console-svsurvival")) {
if (message.content.includes("[LP] Set * to true for ")) {
    if(message.content.includes("[Messaging] Sending log with id:")){
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = " [LP]";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
	}
}
}

if (message.channel.name.includes("console-prison")) {
if (message.content.includes("[LP] Set * to true for ")) {
    if(message.content.includes("[Messaging] Sending log with id:")){
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = " [LP]";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
	}
}
}

if (message.channel.name.includes("console-factions")) {
if (message.content.includes("[LP] Set * to true for  ")) {
    if(message.content.includes("[Messaging] Sending log with id:")){
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = " [LP]";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
	}
}
}

if (message.channel.name.includes("console-skyblocks")) {
if (message.content.includes("[LP] Set * to true for ")) {
    if(message.content.includes("[Messaging] Sending log with id:")){
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = " [LP]";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
	}
}
}

if (message.channel.name.includes("console-creative")) {
if (message.content.includes("[LP] Set * to true for ")) {
    if(message.content.includes("[Messaging] Sending log with id:")){
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = " [LP]";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
	}
}
}

if (message.channel.name.includes("console-minigames")) {
if (message.content.includes("[LP] Set * to true for ")) {
    if(message.content.includes("[Messaging] Sending log with id:")){
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = " [LP]";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
	}
}
}


//Guarantees no duplicate of message because it will only be from console-lobby
if (message.channel.name.includes("console-lobby")) {
    if (message.content.includes("now inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "now inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
        }
    }
}
}

if (message.channel.name.includes("console-survival")) {
    if (message.content.includes("now inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "now inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
        }
    }
}
}

if (message.channel.name.includes("console-svsurvival")) {
    if (message.content.includes("now inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "now inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
        }
    }
}
}

if (message.channel.name.includes("console-prison")) {
    if (message.content.includes("now inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "now inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
        }
    }
}
}

if (message.channel.name.includes("console-factions")) {
    if (message.content.includes("now inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "now inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-skyblocks")) {
    if (message.content.includes("now inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "now inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-creative")) {
    if (message.content.includes("now inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "now inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-minigames")) {
    if (message.content.includes("now inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "now inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

//remove
if (message.channel.name.includes("console-lobby")) {
    if (message.content.includes("no longer inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "no longer inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-survival")) {
    if (message.content.includes("no longer inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "no longer inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-svsurvival")) {
    if (message.content.includes("no longer inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "no longer inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-prison")) {
    if (message.content.includes("no longer inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "no longer inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-factions")) {
    if (message.content.includes("no longer inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "no longer inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-skyblocks")) {
    if (message.content.includes("no longer inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "no longer inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-creative")) {
    if (message.content.includes("no longer inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "no longer inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-minigames")) {
    if (message.content.includes("no longer inherits permissions from")) {
        if(message.content.includes("for a duration of")) {
            return
        }else{
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "no longer inherits permissions from";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
            bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);        }
    }
}
}

if (message.channel.name.includes("console-lobby")) {   
    if (message.content.includes("[LP] Demoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046        
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Demoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-survival")) {   
    if (message.content.includes("[LP] Demoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046        
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Demoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-svsurvival")) {   
    if (message.content.includes("[LP] Demoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046        
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Demoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
                bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-prison")) {   
    if (message.content.includes("[LP] Demoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046        
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Demoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
                bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-skyblocks")) {   
    if (message.content.includes("[LP] Demoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046        
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Demoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-creative")) {   
    if (message.content.includes("[LP] Demoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046        
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Demoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-minigames")) {   
    if (message.content.includes("[LP] Demoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046        
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Demoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

//Promote
if (message.channel.name.includes("console-lobby")) {
    if (message.content.includes("[LP] Promoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Promoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-survival")) {
    if (message.content.includes("[LP] Promoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Promoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-svsurvival")) {
    if (message.content.includes("[LP] Promoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Promoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-prison")) {
    if (message.content.includes("[LP] Promoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Promoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-factions")) {
    if (message.content.includes("[LP] Promoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Promoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-skyblocks")) {
    if (message.content.includes("[LP] Promoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Promoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-creative")) {
    if (message.content.includes("[LP] Promoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Promoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

if (message.channel.name.includes("console-minigames")) {
    if (message.content.includes("[LP] Promoting")) {
        if(message.content.includes("[Messaging] Sending log with id:")){
        //Channel ID for staff = 701520308976353421
        //Channel ID for alerts = 701629915296170046     
        const staff = '701520308976353421';
        const lp = '701630251666767952';
        let channel = message.channel.name;
        var messageSplitted = message.content.split("\n");
        var substring = "[LP] Promoting";
        filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
        bot.channels.get(lp).send(`\`\`\`${filtered}\`\`\` It originated from ${channel}!`);
    }
}
}

// if(message.content.includes("issued server command: /sudo") && message.content.includes("console")) {
//   if (message.content.includes("Performed '/op' command as")) {
//         var messageSplitted = message.content.split("\n");
//         var substring = "Performed '/op' comamnd as";
//         filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
//         //Channel ID for staff = 701520308976353421
//         //Channel ID for alerts = 701629915296170046
//         const staff = '701520308976353421';
//         const alerts = '701629915296170046';
//         let channel = message.channel.name;
//         bot.channels.get(staff).send(`**WARNING!** \`sudo\` command used for /op. Check \<#701629915296170046>\ for more info.`);
//         bot.channels.get(alerts).send(`**WARNING!** \`sudo\` command used for /op. Message :\`\`\`${filtered}\`\`\`It originated from ${channel}!`);
//     }
// }

// if (message.channel.name.includes("console")) {
//     if (message.content.includes("[LP] Preparing a new editor session. Please wait...")) {
//         //Channel ID for staff = 701520308976353421
//         //Channel ID for alerts = 701629915296170046     
//         const staff = '701520308976353421';
//         const lp = '701630251666767952';
//         let channel = message.channel.name;
//         var messageSplitted = message.content.split("\n");
//         var substring = " [LP] Preparing";
//         filtered = messageSplitted.filter(function (str) { return str.includes(substring); });
//         bot.channels.get(lp).send(`**WARNING!** \`[LuckPerms] lp editor\` used. It originated from ${channel}!`);
// }
// }
 
//Ham5teak Server Assistance
for (var i = 0; i < message.embeds.length; i++) {
    if (message.embeds[i] && message.embeds[i].description && message.embeds[i].description.toLowerCase().includes("this user wants the service:")) {
    try {
        const embed = new Discord.RichEmbed()
        .setColor('#0xff3300')
        .setTitle('🥩 Ham5teak Server Assistance')
        .setDescription(`Hello! The Ham5teak Staff Team would like to assist you. \nIn order to make this process easier for us staff, please choose from the following choices by replying with the respective options \n(E.g : send a single number as a message) : \n\n**1**. **Item Lost** \n**2**. **Reporting an Issue/Bug** \n**3**. **Same IP Connection** \n**4**. **Connection Problems**\n**5**. **Forgot Password**\n**6**. **Ban/Mute Appeal**\n**7**. **Queries**`)
        .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
        await message.channel.send(embed);
        console.log('\nA ticket has been created and Ham5teak Bot has replied accordingly.');
 
    } catch (error) {
        console.log(error)
    }
}
}

    let user = message.author;
if(!user.bot){
    if(message.content === ("1") && message.channel.topic.startsWith("TICKET")) {
        try {
        	const embed = new Discord.RichEmbed()
            .setColor('FF0000')
            .setTitle('🥩 Ham5teak Server Assistance')
            .setDescription("1. **Item Lost Due To Server Lag/Crash** \nIn-game Name:\nServer:\nItems you lost:  \n\nIf they are enchanted tools, please mention the enchantments if possible.")
            .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
            await message.channel.send(embed);
         	await message.delete();

        } catch (error) {
            console.error(error)
        }
    }
 
if(message.content === ("2") && message.channel.topic.startsWith("TICKET")) {
    try {
        const embed = new Discord.RichEmbed()
        .setColor('FF7F00')
        .setTitle('🥩 Ham5teak Server Assistance')
        .setDescription("2. **Issue/Bug Report** \nIn-Game Name : \nServer: \nIssue/Bug :")
        .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
        await message.channel.send(embed);
        await message.delete();
     
    } catch (error) {
    console.error(error)
  }
}
 
if(message.content === ("3") && message.channel.topic.startsWith("TICKET")) {
    try {  
      	const embed = new Discord.RichEmbed()
        .setColor('FFFF00')
        .setTitle('🥩 Ham5teak Server Assistance')
        .setDescription("3. **Same IP Connection** \nIn-Game Name of Same IP Connection : \n- \n- \n\nIP Address : (Format should be xxx.xxx.xxx.xxx)")
        .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
        await message.channel.send(embed);
        await message.delete();
     
    } catch (error) {
    console.error(error)
  }
}
 
  if(message.content === ("4") && message.channel.topic.startsWith("TICKET")) {
    try {
        const embed = new Discord.RichEmbed()
        .setColor('00FF00')
        .setTitle('🥩 Ham5teak Server Assistance')
        .setDescription("4. **Connection Problems** \nIn-game Name:\n\nWhat connection problem are you facing? Please explain briefly.")
        .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
        await message.channel.send(embed);
        await message.delete();  
    } catch (error) {
        console.error(error)
    }
}
 
if(message.content === ("5") && message.channel.topic.startsWith("TICKET")) {
    try {
        const embed = new Discord.RichEmbed()
        .setColor('0000FF')
        .setTitle('🥩 Ham5teak Server Assistance')
        .setDescription("5. **Forgot Password** \nIn-game Name:\nIP Address : (Format should be xxx.xxx.xxx.xxx)")
        .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
        await message.channel.send(embed);
        await message.delete();  
    } catch (error) {
        console.error(error)
    }
}
 
if(message.content === ("6") && message.channel.topic.startsWith("TICKET")) {
    try {
        const embed = new Discord.RichEmbed()
        .setColor('2E2B5F')
        .setTitle('🥩 Ham5teak Server Assistance')
        .setDescription("6. **Ban/Mute Appeal** \nWhy did you get banned/muted? \nWas it on discord or in-game? \n\nIf it was in-game, what is your in-game name and who banned/muted you? \nAlso - please do a ban appeal/mute appeal next time using https://ham5teak.xyz/forums/ban-appeal.21/")
        .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
        await message.channel.send(embed);
        await message.delete();
    } catch (error) {
        console.error(error)
    }
}
 
if(message.content === ("7") && message.channel.topic.startsWith("TICKET")) {
    try {
      const embed = new Discord.RichEmbed()
        .setColor('8B00FF')
        .setTitle('🥩 Ham5teak Server Assistance')
        .setDescription("7. **Queries** \nPlease state your questions here and wait patiently for a staff to reply. If you have to do something at the moment, please leave a note for Staff.")
        .setFooter('Ham5teak Bot 2.0 | play.ham5teak.xyz | Made by Jaymz#7815')
        await message.channel.send(embed);
        await message.delete();
    } catch (error) {
        console.error(error)
    }
}
}

  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

  if(!prefixes[message.guild.id]){
    prefixes[message.guild.id] = {
      prefixes: botconfig.prefix
    };
  }

  let prefix = prefixes[message.guild.id].prefixes;

  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);
 
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : '139.99.125.125',
  port     : '3306',
  user     : 'jaymz',
  password : 'vax95zjjwnChhUNR',
  database : 'hambot',
});

})

bot.login(tokenfile.token);