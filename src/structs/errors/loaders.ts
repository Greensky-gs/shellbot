import { ColorCodes, ColorFonts } from "../../types/utils";
import { chalk } from "../../utils/chalk";
import { errorDomain, errorType, ShellError } from "./base";

export enum LoaderErrorLoaders {
    Commands = 'CommandsLoader',
    Events = 'EventsLoader',
    Modals = 'ModalsLoader',
    Global = 'GlobalLoader'
};

class LoaderError extends ShellError {
    constructor(loaderType: LoaderErrorLoaders, message: string) {
        super(errorDomain.Prerun, errorType.Internal, `${chalk(loaderType.padEnd(LoaderError.longestLoader() + 1), ColorCodes.Purple)} | ${message}`);
    }

    static longestLoader() {
        return Math.min(...Object.values(LoaderErrorLoaders).map(x => x.length));
    }
}

export class ShellLoaderNoClient extends LoaderError {
    constructor(loaderType: LoaderErrorLoaders) {
        super(loaderType, `Client promised but not gived`);
    }
}
export class ShellLoaderIncorrectInstance extends LoaderError {
    constructor(loaderType: LoaderErrorLoaders, file: string) {
        super(loaderType, `Found an incorrect type for ${chalk(file, ColorCodes.Red, ColorFonts.Light)} (expected a ${chalk(loaderType, ColorCodes.Yellow)} compatbile)`)
    }
}