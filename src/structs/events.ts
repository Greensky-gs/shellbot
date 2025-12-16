import { Client, ClientEvents } from "discord.js";
import { ShellEventNoClientError } from "./errors/events";
import { ShellInternalNeverError } from "./errors/base";

type callback<K extends keyof ClientEvents> = (...params: ClientEvents[K]) => void | unknown;

export class ShellEvent<K extends keyof ClientEvents> {
    private key: K;
    private params: callback<K>;
    private once: boolean;
    private client: Client;

    constructor(key: K, once: boolean, run: callback<K>) {
        this.key = key;
        this.params = run;
        this.once = once;
    }

    public giveClient(client: Client) {
        if (!this.client) this.client = client;
    }
    public setup() {
        if (!this.client) {
            throw new ShellEventNoClientError();
        }

        if (this.once) this.client.once(this.key, this.params);
        else if (!this.once) this.client.on(this.key, this.params);
        else {
            throw new ShellInternalNeverError(`No client on or once`, 'structs/events.ts');
        }
    }

    public get event() {
        return this.key;
    }
    public get run() {
        return this.params;
    }
}