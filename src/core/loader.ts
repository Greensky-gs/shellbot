import { join } from 'node:path';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { ShellEvent } from '../structs/events';
import { Client, ClientEvents } from 'discord.js';
import { ShellInvalidEventError } from '../structs/errors/events';
import { LoaderErrorLoaders, ShellLoaderNoClient } from '../structs/errors/loaders';
import { print } from '../utils/print';
import { chalk } from '../utils/chalk';
import { ColorCodes, ColorFonts } from '../types/utils';

const exploreAllFiles = (path: string): string[] => {
    if (statSync(path).isDirectory()) {
        return readdirSync(path).map(x => exploreAllFiles(join(path, x))).flat();
    } else {
        return [path];
    }
}

class EventLoader {
    private path: string;
    private eventList: ShellEvent<keyof ClientEvents>[] = [];
    private client: Client;

    constructor(path: string) {
        this.path = join(process.cwd(), join('dist', path));
        if (!existsSync(this.path)) {
            mkdirSync(this.path);
        }
    }

    public start() {
        const paths = exploreAllFiles(this.path);

        paths.forEach((path) => {
            const required = require(path);
            const event: ShellEvent<keyof ClientEvents> = required?.default ?? required;

            if (!event || !(event instanceof ShellEvent)) {
                throw new ShellInvalidEventError(path);
            }

            this.eventList.push(event);
        })
    } 

    public load() {
        if (!this.client) {
            throw new ShellLoaderNoClient(LoaderErrorLoaders.Events);
        }

        this.eventList.forEach((event) => {
            event.giveClient(this.client);
            event.setup()

            print(`EVENTS : Loaded ${chalk(event.event, ColorCodes.Yellow)}`, ColorCodes.Blue);
        })
    }

    public giveClient(client: Client) {
        if (!this.client) this.client = client;
    }

    public get name() {
        return 'EVENTS';
    }
}

export class Loader {
    private client: Client;

    private events: EventLoader;

    constructor() {
        this.events = new EventLoader('events');
    }

    private get loaders() {
        return [this.events];
    }
    private foreach(callback: (loader: (EventLoader)) => void) {
        this.loaders.forEach((l) => callback(l));
    }

    public start() {
        this.foreach((l) => {
            l.start()
            print(`LOADER : ${l.name} started`, ColorCodes.Cyan, ColorFonts.Light);
        });
    }

    public giveClient(client: Client) {
        if (!this.client) {
            this.client = client;

            this.foreach((l) => l.giveClient(client));
        }
    }
    public load() {
        if (!this.client) {
            throw new ShellLoaderNoClient(LoaderErrorLoaders.Global);
        }
        this.foreach((l) => {
            l.load();
            print(`LOADER : ${l.name} loaded`, ColorCodes.Cyan, ColorFonts.Light)
        })
    }
}