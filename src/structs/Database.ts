import { join } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { ShellDatabaseInvalidPath, ShellDatabaseUnknownKey, ShellEmptyUnionValues } from './errors/database';

type databasePrimitive = 'string' | 'number' | 'boolean' | 'object' | 'array';
type databaseExpectation<P extends databasePrimitive> = P extends 'string' ? string : P extends 'number' ? number : P extends 'boolean' ? boolean : P extends 'object' ? Record<any, any> : P extends 'array' ? any[] : never;

export class Database {
    private path: string;
    private content = {};
    private name: string;
    
    constructor(path: string, name: string) {
        if (!existsSync(join(process.cwd(), 'dist/databases'))) mkdirSync(join(process.cwd(), 'dist/databases'));

        this.path = join(process.cwd(), join('dist/databases', path)) + '.json';
        if (!existsSync(this.path)) writeFileSync(this.path, '{}');

        this.content = JSON.parse(readFileSync(this.path).toString());
        this.name = name;
    }

    private save() {
        writeFileSync(this.path, JSON.stringify(this.content, null, 0));
    }
    public exists(path: string) {
        if (/\.\./g.test(path)) {
            throw new ShellDatabaseInvalidPath(path);
        }

        const keys = path.split('.');
        let current = this.content;

        for (const key of keys) {
            if (!(current instanceof Object)) {
                throw new ShellDatabaseInvalidPath(path);
            }

            if (((x: string[]) => x.length > 0 && x.includes(key))(Object.keys(current))) {
                current = current[key];
            } else {
                return false;
            }
        }
        return true;
    }
    private runPath(path: string) {
        if (!this.exists(path)) {
            throw new ShellDatabaseUnknownKey(this.name, path);
        }

        const keys = path.split('.');
        let current = this.content;

        keys.forEach((key) => {
            current = current[key];
        });
        return current;
    }
    public getValue<Expected extends databasePrimitive>(path: string, expected: Expected): databaseExpectation<Expected> {
        if (!this.exists(path)) {
            throw new ShellDatabaseUnknownKey(this.name, path);
        }
        const value = this.runPath(path);
        return value as databaseExpectation<Expected>;
    }
    public writeValue<E extends databasePrimitive, T = databaseExpectation<E>>(path: string, expected: E, value: T): T {
        if (this.exists(path) && (typeof this.getValue(path, expected) != typeof value)) {
            throw new ShellEmptyUnionValues(path);
        }

        const successives = path.split('.');
        
        let current = this.content;

        let i = 0;
        while (i < successives.length - 1) {
            const key = successives[i];
            if (!current[key] || typeof current[key] !== 'object') current[key] = {};

            current = current[key];
            i++;
        }

        current[successives[successives.length - 1]] = value;

        this.save();
        return value;
    }
}