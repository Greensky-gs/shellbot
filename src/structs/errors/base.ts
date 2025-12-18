import { ColorCodes, ColorFonts } from "../../types/utils";
import { chalk } from "../../utils/chalk";

export enum errorDomain {
    Prerun = 'PreRunShellError',
    Runtime = 'RunTimeShellError'
}
export enum errorType {
    Internal = 'internalError',
    WrongResult = 'WrongResError',
    Never = 'NeverError',
    User = 'UserError',
    DiscordAPI = 'DiscordAPIError'
}

export class ShellError extends Error {
    constructor(domain: errorDomain, type: errorType, message: string) {
        super(`${chalk(domain.toUpperCase().padEnd(ShellError.longestDomainLength() + 4, ' '), ColorCodes.Red)}  | ${chalk(type.padEnd(ShellError.longestErrorTypeLength() + 6), ColorCodes.Red, ColorFonts.Light)} : ${message}`);
    }

    static longestDomainLength() {
        return Math.min(...Object.values(errorDomain).map(x => x.length))
    }
    static longestErrorTypeLength() {
        return Math.min(...Object.values(errorType).map(x => x.length))
    }
}
export class ShellInternalNeverError extends ShellError {
    constructor(message: string, file: string) {
        super(errorDomain.Prerun, errorType.Internal, `${message}\nThrown at ${chalk(file, ColorCodes.Yellow)}`)
    }
}
export class ShellRuntimeNeverError extends ShellError {
    constructor(message: string) {
        super(errorDomain.Runtime, errorType.Never, message);
    }
}