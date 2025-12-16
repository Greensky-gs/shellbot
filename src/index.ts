import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { Loader } from './core/loader';
import { ShellsDB } from './cache/databases';
config();

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => GatewayIntentBits[a]),
});

const loader = new Loader();
loader.giveClient(client);
loader.start();
loader.load();

client.login(process.env.token);
ShellsDB; // Loads the import without prettier removing the import