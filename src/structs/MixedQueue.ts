import { MixedQueueUnqueueEmptyQueue, MixedQueueViewEmptyQueue } from "./errors/abstract";

export class MixedQueue<T> {
    private values: T[] = [];
    private size: number = 0;

    constructor() {}

    public get height() {
        return this.size;
    }
    public queue(element: T) {
        this.values.unshift(element);
        this.size++;
        return this;
    }
    public stack(element: T) {
        this.values.push(element);
        this.size++;
        return this;
    }
    public unqueue(): T {
        if (!this.size) {
            throw new MixedQueueUnqueueEmptyQueue();
        }
        this.size--;
        return this.values.pop();
    }
    public peak(): T {
        if (!this.size) {
            throw new MixedQueueViewEmptyQueue();
        };
        return this.values[this.size - 1];
    }
    public empty() {
        return !this.size;
    }

    public toString() {
        return this.values.map(x => x).join(', ');
    }
}