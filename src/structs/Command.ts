import { parseMentionnable } from "../utils/regexes";
import {
	commandCallbackType,
	shellOption,
	shellOptions,
} from "../types/command";

export class ShellCommand {
	private options: shellOptions;
	private _callback: commandCallbackType;
	
	constructor(options: shellOptions) {
		this.options = options;
	}
	
	public parseArguments(content: string) {
		const splitted = content.split(/ +/g);
		
		let mandatoryFound = 0;
		const dashedOptions: (shellOption & { value: string | number })[] = [];
		const invalidDashedOptions = [];
		
		const ddashedOptions: (shellOption & { value: string | number })[] = [];
		const invalidDdashedOptions = [];
		
		let i = 0;
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
					if (matching.argument.mandatory) mandatoryFound++;
				}
				if (matching.argument.type == "number") {
					if (!next) {
						invalidDashedOptions.push(splitted[i]);
						i++;
						continue;
					}
					const num = parseFloat(next);
					if (!num) {
						i++;
						invalidDashedOptions.push(splitted[i]);
						continue;
					}
					
					dashedOptions.push({
						...matching,
						value: num,
					});
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
					if (matching.argument.mandatory) mandatoryFound++;
				}
				if (matching.argument.type == "number") {
					if (!next) {
						invalidDdashedOptions.push(splitted[i]);
						i++;
						continue;
					}
					const num = parseFloat(next);
					if (!num) {
						i++;
						invalidDdashedOptions.push(splitted[i]);
						continue;
					}
					
					ddashedOptions.push({
						...matching,
						value: num,
					});
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
				}
			}
			i++;
		}
		
		const mandatories = this.options.options.filter((x) => x.argument.mandatory).length;
		
		return {
			dashedOptions: dashedOptions,
			invalidDashedOptions,
			doubleDashedOptions: ddashedOptions,
			invalidDdashedOptions,
			allIncluded: mandatories == mandatoryFound,
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
