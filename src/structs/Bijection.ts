import { BijectionInvalidLength } from "./errors/abstract";

export class Bijection<K extends string | number | symbol, V extends string | number | symbol> {
    private base: Record<K,V> = {} as Record<K,V>;
    private reciproc: Record<V,K> = {} as Record<V,K>;
    private _size: number;

    constructor(entry: Record<K, V>) {
        this._size = Object.entries(entry).filter(([k,v]) => {
            this.base[k]=v;
            this.reciproc[v as V]= k as K;

            return true;
        }).length;

        const ensSize = Object.keys(this.base).length;
        const resSize = Object.keys(this.reciproc).length;
        if (ensSize !== resSize) {
            throw new BijectionInvalidLength(ensSize, resSize);
        }
    }

    public get size() {
        return this._size;
    }

    public basic(key: K): V {
        return this.base[key];
    }
    public reverted(value: V): K {
        return this.reciproc[value];
    }
    public inStart(key: K): boolean {
        return (Object.keys(this.base) as K[]).includes(key);
    }
    public inRes(key: V): boolean {
        return (Object.keys(this.reciproc) as V[]).includes(key);
    }
    public exists(key: K | V) {
        return this.inStart(key as K) || this.inRes(key as V);
    }
    public toRes(key: K | V): V {
        if (this.inRes(key as V)) return key as V;
        return this.basic(key as K);
    }
    public toStart(key: K | V): K {
        if (this.inStart(key as K)) return key as K;
        return this.reverted(key as V);
    }

    public get ens(): K[] {
        return Object.keys(this.base) as K[];
    }
    public get res(): V[] {
        return Object.values(this.base) as V[];
    }
}