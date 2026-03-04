import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandSpec } from '../command.js';
import { removeFromQueue } from '../services/raisedHandsService.js';

export const lowerHand: CommandSpec = {
    metadata: new SlashCommandBuilder()
        .setName('lower-hand')
        .setDescription('Lower your hand to be removed from the queue'),
    run: async (interaction) => {
        const result = await removeFromQueue(interaction.user.id);
        await interaction.reply(result);
    },
};