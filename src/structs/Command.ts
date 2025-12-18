import { parseMentionnable } from "../utils/regexes";
import {
	commandCallbackType,
	shellArgument,
	shellOption,
	shellOptions,
} from "../types/command";
import { ShellArgsBuildMandatoryOrderError, ShellCommandArgumentUnknownType, ShellCommandOptionUnknownType, ShellCommandPresenceArgumentError } from "./errors/command";

export class ShellCommand {
	private options: shellOptions;
	private _callback: commandCallbackType;
	
	constructor(options: shellOptions) {
		this.options = options;

		this.check();
	}

	private check() {
		let crossed = false;
		this.options.arguments.forEach((arg) => {
			if (arg.mandatory) crossed = true;
			if (crossed && !arg.mandatory) {
				// TODO inversé
				throw new ShellArgsBuildMandatoryOrderError(this.options.name, arg.name);
			}
			if (arg.type === 'presence') {
				throw new ShellCommandPresenceArgumentError(this.options.name, arg.name);
			}
			if (!['channel', 'user', 'role', 'number', 'string'].includes(arg.type)) {
				throw new ShellCommandArgumentUnknownType(this.options.name, arg.name, arg.type);
			}
		});
		this.options.options.forEach((opt) => {
			if (!['channel', 'user', 'role', 'number', 'string', 'presence'].includes(opt.argument.type)) {
				throw new ShellCommandOptionUnknownType(this.options.name, opt.prefix, opt.argument.type);
			}
		})
	}
	
	public parseArguments(content: string, sudoing: boolean) {
		const splitted = content.split(/ +/g);
		
		let mandatoryFound = 0;
		const dashedOptions: (shellOption & { value: string | number })[] = [];
		const invalidDashedOptions = [];
		
		const ddashedOptions: (shellOption & { value: string | number })[] = [];
		const invalidDdashedOptions = [];
		
		let i = 0;
		const ignoredIndexes: number[] = [0];
		if (sudoing) ignoredIndexes.push(1);

		while (i < splitted.length) {
			if (/^-[a-zA-Z]/.test(splitted[i])) {
				const name = splitted[i].slice(1);
				
				const matching = this.options.options.find(
					(x) => !x.doubleDash && x.prefix == name
				);
				if (!matching) {
					i++;
					continue;
				}
				if (matching.argument.type == 'presence') {
					dashedOptions.push({
						...matching,
						value: 0
					})
					if (matching.argument.mandatory) mandatoryFound++;
					ignoredIndexes.push(i);
				}
				
				const next = splitted[i + 1];
				
				if (["user", "channel", "role"].includes(matching.argument.type)) {
					if (!next) {
						invalidDashedOptions.push(splitted[i]);
						i++;
						continue;
					}
					const res = parseMentionnable(next);
					if (!res) {
						i++;
						invalidDashedOptions.push(splitted[i]);
						continue;
					}
					if (res[1] != matching.argument.type) {
						invalidDashedOptions.push(splitted[i]);
						i++;
						continue;
					}
					
					dashedOptions.push({
						...matching,
						value: res[0],
					});
					ignoredIndexes.push(i, i + 1);
					if (matching.argument.mandatory) mandatoryFound++;
				}
				if (matching.argument.type == "number") {
					if (!next) {
						invalidDashedOptions.push(splitted[i]);
						i++;
						continue;
					}
					const num = parseFloat(next);
					if (isNaN(num) || [undefined, null].includes(num)) {
						i++;
						invalidDashedOptions.push(splitted[i]);
						continue;
					}
					
					dashedOptions.push({
						...matching,
						value: num,
					});
					ignoredIndexes.push(i, i + 1);
					if (matching.argument.mandatory) mandatoryFound++;
				}
				if (matching.argument.type == "string") {
					if (!next || !next.startsWith('"')) {
						i++;
						invalidDashedOptions.push(splitted[i]);
						continue;
					}
					let startIndex = i + 1;
					let endIndex = -1;
					let running = i + 1;
					
					while (running < splitted.length) {
						const prime = (running == startIndex ? splitted[running].slice(1) : splitted[running]).replace(/\\"/g, "").endsWith('"');
						if (prime) {
							endIndex = running;
							break;
						}
						running++;
					}
					
					if (endIndex == -1) {
						i++;
						invalidDashedOptions.push(splitted[i]);
						continue;
					}
					
					const txt = splitted.slice(startIndex, endIndex + 1).join(" ");
					dashedOptions.push({
						...matching,
						value: txt.slice(1, txt.length - 1).replace(/\\"/g, '"'),
					});
					if (matching.argument.mandatory) mandatoryFound++;
					ignoredIndexes.push(i);
					for (let iPush = startIndex; iPush <= startIndex; iPush++) {
						ignoredIndexes.push(iPush);
					}
				}
			} else if (/^--[a-zA-Z]/.test(splitted[i])) {
				const name = splitted[i].slice(2);
				
				const matching = this.options.options.find(
					(x) => x.doubleDash && x.prefix == name
				);
				if (!matching) {
					i++;
					continue;
				}

				if (matching.argument.type == 'presence') {
					dashedOptions.push({
						...matching,
						value: 0
					})
					ignoredIndexes.push(i);
					if (matching.argument.mandatory) mandatoryFound++;
				}
				
				const next = splitted[i + 1];
				
				if (["user", "channel", "role"].includes(matching.argument.type)) {
					if (!next) {
						invalidDdashedOptions.push(splitted[i]);
						i++;
						continue;
					}
					const res = parseMentionnable(next);
					if (!res) {
						i++;
						invalidDdashedOptions.push(splitted[i]);
						continue;
					}
					if (res[1] != matching.argument.type) {
						invalidDdashedOptions.push(splitted[i]);
						i++;
						continue;
					}
					
					ddashedOptions.push({
						...matching,
						value: res[0],
					});
					ignoredIndexes.push(i);
					if (matching.argument.mandatory) mandatoryFound++;
				}
				if (matching.argument.type == "number") {
					if (!next) {
						invalidDdashedOptions.push(splitted[i]);
						i++;
						continue;
					}
					const num = parseFloat(next);
					if (isNaN(num) || [undefined, null].includes(num)) {
						i++;
						invalidDdashedOptions.push(splitted[i]);
						continue;
					}
					
					ddashedOptions.push({
						...matching,
						value: num,
					});
					ignoredIndexes.push(i);
					if (matching.argument.mandatory) mandatoryFound++;
				}
				if (matching.argument.type == "string") {
					if (!next || !next.startsWith('"')) {
						i++;
						invalidDdashedOptions.push(splitted[i]);
						continue;
					}
					let startIndex = i + 1;
					let endIndex = -1;
					let running = i + 1;
					
					while (running < splitted.length) {
						const prime = (running == startIndex ? splitted[running].slice(1) : splitted[running]).replace(/\\"/g, "").endsWith('"');
						if (prime) {
							endIndex = running;
							break;
						}
						running++;
					}
					
					if (endIndex == -1) {
						i++;
						invalidDdashedOptions.push(splitted[i]);
						continue;
					}
					
					const txt = splitted.slice(startIndex, endIndex + 1).join(" ");
					ddashedOptions.push({
						...matching,
						value: txt.slice(1, txt.length - 1).replace(/\\"/g, '"'),
					});
					if (matching.argument.mandatory) mandatoryFound++;
					ignoredIndexes.push(i);
					for (let iPush = startIndex; iPush <= startIndex; iPush++) {
						ignoredIndexes.push(iPush);
					}
				}
			}
			i++;
		}
		
		const dashedMandatories = this.options.options.filter((x) => x.argument.mandatory).length;

		const cleanArgs = splitted.filter((_, i) => !ignoredIndexes.includes(i));
		const argumentValues: (shellArgument & { value: string | number })[] = [];
		const invalidArgs: shellArgument[] = [];
		let mandatoryArgsFound = 0;

		for (const arg of this.options.arguments) {
			if (arg.type === 'channel' || arg.type === 'role' || arg.type === 'user') {
				const val = cleanArgs.shift();
				if (!val) {
					if (arg.mandatory) invalidArgs.push(arg);
					break;
				}

				const res = parseMentionnable(val);
				if (!res) {
					if (arg.mandatory) {
						invalidArgs.push(arg)
					};
					continue;
				}
				if (res[1] != arg.type) {
					invalidArgs.push(arg);
					if (arg.mandatory) break;
					continue;
				}

				argumentValues.push({
					...arg,
					value: res[0]
				});
				if (arg.mandatory) mandatoryArgsFound++;
			}
			if (arg.type === 'number') {
				const val = cleanArgs.shift();
				if (!val) {
					if (arg.mandatory) invalidArgs.push(arg);
					break;
				}

				const res = parseFloat(val);
				if (isNaN(res) || [undefined, null].includes(res)) {
					if (arg.mandatory) {
						invalidArgs.push(arg);
						break;
					};
					continue;
				}

				argumentValues.push({
					...arg,
					value: res
				});
				if (arg.mandatory) mandatoryArgsFound++;
			}
			if (arg.type === 'string') {
				if (!cleanArgs[0]?.startsWith?.('"')) {
					if (arg.mandatory) {
						invalidArgs.push(arg);
						break;
					};
					continue;
				}
				let startIndex = 0;
				let endIndex = -1;
				let running = 0;

				while (running < cleanArgs.length) {
					const prime = (running == startIndex ? cleanArgs[running].slice(1) : cleanArgs[running]).replace(/\\"/g, "").endsWith('"');
					if (prime) {
						endIndex = running;
						break;
					}
					running++;
				}

				if (endIndex == -1) {
					invalidArgs.push(arg);
					if (arg.mandatory) break;
					continue;
				}
				
				const txt = cleanArgs.slice(startIndex, endIndex + 1).join(" ");
				argumentValues.push({
					...arg,
					value: txt.slice(1, txt.length - 1).replace(/\\"/g, '"'),
				});

				cleanArgs.splice(startIndex, endIndex + 1);
				if (arg.mandatory) mandatoryArgsFound++;
			}
		};
		
		return {
			dashedOptions: dashedOptions,
			invalidDashedOptions,
			doubleDashedOptions: ddashedOptions,
			invalidDdashedOptions,
			allDashedIncluded: dashedMandatories == mandatoryFound,
			allIncluded: this.options.arguments.filter(x => x.mandatory).length === mandatoryArgsFound,
			arguments: argumentValues,
			invalidArguments: invalidArgs
		};
	}
	
	public run(callback: commandCallbackType): this {
		this._callback = callback;
		return this;
	}
	
	public get callback() {
		return this._callback;
	}
	public get opts() {
		return this.options;
	}
}
