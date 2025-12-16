import { shellOption } from "../types/command";

type cmdOption = shellOption & {
    value: string | number;
};

export class ShellCommandOptionsFinder {
    private options: cmdOption[];
    private simple: Record<string, cmdOption> = {};
    private double: Record<string, cmdOption> = {};
    
    constructor(options: cmdOption[]) {
        this.options = options;
        
        this.load();
    }
    private load() {
        this.options.forEach((option) => {
            if (option.doubleDash) this.double[option.prefix] = option;
            if (!option.doubleDash) this.simple[option.prefix] = option;
        });
    }
    private getV(name: string, d: boolean) {
        if (d) return this.double[name]?.value;
        return this.simple[name]?.value;
    }
    
    public getOption(name: string, double: boolean) {
        return [this.simple, this.double][+double][name];
    }
    public getChannel(name: string, double: boolean): string {
        return this.getV(name, double) as string;
    }
    public getRole(name: string, double: boolean): string {
        return this.getV(name, double) as string;
    }
    public getUser(name: string, double: boolean): string {
        return this.getV(name, double) as string;
    }
    public getNumber(name: string, double: boolean): number {
        return this.getV(name, double) as number;
    }
    public getString(name: string, double: boolean): string {
        return this.getV(name, double) as string;
    }
    public present(name: string, double: boolean): boolean {
        return Object.values([this.simple, this.double][+double]).filter(x => x.argument.type === 'presence').some(x => x.prefix == name);
    }
}
