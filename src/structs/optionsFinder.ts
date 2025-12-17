import { shellArgument, shellArgumentType, shellArgumentTypeReturn, shellOption } from "../types/command";
import { ColorCodes } from "../types/utils";
import { chalk } from "../utils/chalk";
import { ShellInternalNeverError } from "./errors/base";
import { ShellCommandOptsFinderTypeError } from "./errors/command";

type cmdOption = shellOption & {
    value: string | number;
};
type cmdArg = shellArgument & {
    value: string | number;
}

export class ShellCommandOptionsFinder {
    private options: cmdOption[];
    private args: Record<string, cmdArg> = {};
    private simple: Record<string, cmdOption> = {};
    private double: Record<string, cmdOption> = {};
    
    constructor(options: cmdOption[], args: cmdArg[]) {
        this.options = options;
        this.args = Object.fromEntries(args.map((x) => ([ x.name, x ])));
        
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
    private getA(name: string) {
        return this.args[name];
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

    public getArgument<T extends shellArgumentType, R = shellArgumentTypeReturn<T>>(name: string, type: T, mandatory: boolean, defaultValue: R = null): R {
        const arg = this.getA(name);
        if (mandatory && !arg) {
            throw new ShellInternalNeverError(`Didn't find argument ${chalk(name, ColorCodes.Yellow)} but is mandatory`, 'optionsFinder.ts');
        }
        if (!arg) return defaultValue;
        if (arg.type !== type) {
            throw new ShellCommandOptsFinderTypeError(name, arg.type, type, 'optionsFinder.ts');
        }

        return arg.value as R;
    }
}
