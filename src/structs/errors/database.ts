import { ColorCodes, ColorFonts } from "../../types/utils";
import { chalk } from "../../utils/chalk";
import { errorDomain, errorType, ShellError } from "./base";

class DatabaseError extends ShellError {
    constructor(domain: errorDomain, message: string) {
        super(domain, errorType.Internal, message);
    }
}

export class ShellDatabaseInvalidPath extends DatabaseError {
    constructor(path: string) {
        super(errorDomain.Runtime, `Invalid key formation : ${chalk(path, ColorCodes.Red, ColorFonts.Light)}`)
    }
}
export class ShellDatabaseUnknownKey extends DatabaseError {
    constructor(databaseName: string, key: string) {
        super(errorDomain.Runtime, `Tried to access key ${chalk(key, ColorCodes.Red, ColorFonts.Light)} of database ${chalk(databaseName, ColorCodes.Yellow)}`);
    }
}
export class ShellEmptyUnionValues extends DatabaseError {
    constructor(path: string) {
        super(errorDomain.Runtime, `Tried to set a value of a different type for ${chalk(path, ColorCodes.Yellow)}`);
    }
}