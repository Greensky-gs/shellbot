import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { Loader } from './core/loader';
config();

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => GatewayIntentBits[a]),
});

const loader = new Loader();
loader.giveClient(client);
loader.start();
loader.load();

client.login(process.env.token);
