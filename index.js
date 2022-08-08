const Discord = require("discord.js");
const token = "OTk3MzE2NTQ3OTU1NjU0NzQ2.GQoESc.d2aGnOfzkKA6w9Mk4w5K7zoNZylHUk6SxzA_28"
const testoken = "ODI0NDA4MzI4MTIxNjE0Mzg2.YFu8Fg._JoT7ydIV1AKXQcrvzo9xE4nC60"
const words = require("./words.json");
const fs = require("fs");

const client = new Discord.Client({ 
    intents: [
        Discord.GatewayIntentBits.Guilds, 
        Discord.GatewayIntentBits.GuildMembers, 
        Discord.GatewayIntentBits.DirectMessages, 
        Discord.GatewayIntentBits.GuildMessages, 
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates
    ], 
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.Message,
        Discord.Partials.User
    ]
});

const addWord = {
    name: "addword",
    type: Discord.ApplicationCommandType.ChatInput,
    description: "Adiciona uma palavra ou frase na lista!",
    options: [
        {
            name: "palavra",
            description: "Palavra/Frase que quer adicinoar!",
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async(interaction, args) => {
        const embed = new Discord.EmbedBuilder()
        .setTitle("Parabens")
        .setDescription(`Você adicionou a palavra/frase **${args.palavra}** na lista!`)
        interaction.reply({ embeds: [embed] })
        
        words.push(args.palavra)

        fs.writeFile(
            './words.json',
            JSON.stringify(words), 
            function(err) {if(err) console.log(err)}
        )
    }
}
Object.freeze(addWord)

const deleteWord = {
    name: "deleteword",
    type: Discord.ApplicationCommandType.ChatInput,
    description: "Remove uma palavra ou frase da lista!",
    options: [
        {
            name: "id",
            description: "Id da palavra/frase que quer remover! (/seewords)",
            type: Discord.ApplicationCommandOptionType.Number,
            required: true
        }
    ],
    run: async(interaction, args) => {
        if(args.id > words.length) {
            const embed = new Discord.EmbedBuilder()
            .setTitle("Pelo amor de deus")
            .setDescription(`Tem que ser um numero de 1 a ${words.length}`)

            return interaction.reply({ embeds: [embed] })
        }
        const embed = new Discord.EmbedBuilder()
        .setTitle("Parabens")
        .setDescription(`Voce removeu a palavra ou frase ${words[args.id - 1]} da porra da lista!`)

        interaction.reply({ embeds: [embed] })

        words[args.id - 1] = undefined

        fs.writeFile(
            './words.json',
            JSON.stringify(words), 
            function(err) {if(err) console.log(err)}
        )

    }
}
Object.freeze(deleteWord)

const seeWords = {
    name: "seewords",
    type: Discord.ApplicationCommandType.ChatInput,
    description: "Mostra a lista de palavras!",
    run: async(interaction, args) => {

        let description = "";
        let i = 0

        words.forEach(j => {
            i++
            description += `\n**${i}** - ${j}`
        })

        const embed = new Discord.EmbedBuilder()
        .setTitle("Palavras/frases que são bloqueadas pelo bot!")
        .setDescription(description)
        .setColor("#00CDFF")

        interaction.reply({ embeds: [embed] })
    }
}
Object.freeze(seeWords)

const backup = {
    name: "backup",
    type: Discord.ApplicationCommandType.ChatInput,
    description: "faz um backcup das palavras que estao censuradas :)",
    run: async(interaction, args) => {

        let attachment = "./words.json"
        interaction.reply({ files: [attachment] })
    }
}
Object.freeze(backup)

const commands = [addWord, deleteWord, seeWords, backup]

client.on('ready', async () => {
    console.log(`Logado com ${client.user.username}`)
    await client.application.commands.set(commands);
})

client.on('messageCreate',async (msg) => {

    let guild = client.guilds.cache.get("771694267575042079")
    let guildChannels = await guild.channels.fetch()
    
    if(msg.channel.type == Discord.ChannelType.DM){
        let channel = guildChannels.get("852899262874386462") 

        channel.send(`${msg.author.tag} me mandou **${msg.content ? msg.content : "nao tem content, dps arrumo :)"}**`)
    }
    
    words.some(async w => {
        if(msg.content.toLowerCase().replaceAll(/[&\/\-\#,+()$~%.'":*?<>{}]/g,"").replaceAll(" ","").includes(w)){
            msg.delete()
            msg.author.send(`Essa palavra e proibida aqui!`)
            let channel = guildChannels.get("1006025742968180826")

            channel.send(`Censurei ${msg.author.tag}`)
        }
    })
})

client.on('interactionCreate',(interaction) => {
    if (interaction.type == Discord.InteractionType.ApplicationCommand) {
        const args = [];
        
        for (let option of interaction.options.data) {
            if (option.value) args[option.name] = option.value;
            
        }
        
        commands.forEach(c => {
            if(c.name == interaction.commandName){
                return c.run(interaction, args);
            }
        })
    }
})

client.login(token)