import { ObservableVariable } from "./ObservableVariable";

/**
 * 可观察改变Map
 */
export class ObservableMap<K, V> extends ObservableVariable<Map<K, V>> {

    //#region 静态方法

    /**
     * 将一个数组转换成可观察Map，相当于 new ObservableMap(value)
     */
    static observe<K, V>(value: ObservableMap<K, V> | Map<K, V> | ReadonlyArray<[K, V]>): ObservableMap<K, V>;
    /**
     * 将对象中指定位置的一个数组转换成可观察Map，路径通过`.`分割
     */
    static observe(object: object, path: string): void;
    /**
     * 将对象中指定位置的一个数组转换成可观察Map
     */
    static observe(object: object, path: string[]): void;
    static observe(value: any, path?: any): any {
        if (path === undefined) {
            return new ObservableMap(value);
        } else if ('string' === typeof path) {
            path = path.split('.');
        }

        for (let index = 0, end = path.length - 1; index < end; index++) {
            value = value[path[index]];
        }

        value[path[path.length - 1]] = new ObservableMap(value[path[path.length - 1]]);
    }

    //#endregion

    //#region 属性

    protected _onAdd: Set<(value: V, key: K) => void> = new Set();
    protected _onRemove: Set<(value: V, key: K) => void> = new Set();
    protected _onUpdate: Set<(newValue: V, oldValue: V, key: K) => void> = new Set();
    protected _onBeforeUpdate: (key: K, newValue: V, oldValue: V, map: Map<K, V>) => boolean;

    constructor(value: ObservableMap<K, V> | Map<K, V> | ReadonlyArray<[K, V]>) {
        super(value as any);

        if (this !== value)
            if (Array.isArray(value))
                this._value = new Map(value);
    }

    /**
     * Map元素个数
     */
    get size() {
        return this._value.size;
    }

    //#endregion

    //#region toJSON

    protected toJSON(): any {
        return this.serializable ? [...this._value] : undefined;
    }

    //#endregion

    //#region 事件绑定方法

    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: (newValue: Map<K, V>, oldValue: Map<K, V>) => void): void;
    /**
     * 在值发生改变之前触发，返回void或true表示同意更改，返回false表示阻止更改。注意：该回调只允许设置一个，重复设置将覆盖之前的回调
     */
    on(event: 'beforeSet', callback: (newValue: Map<K, V>, oldValue: Map<K, V>, oMap: this) => boolean): void;
    /**
     * 当更新Map中某个元素的值时触发
     */
    on(event: 'update', callback: (newValue: V, oldValue: V, key: K) => void): void;
    /**
     * 在更新Map中某个元素的值之前触发，返回void或true表示同意更改，返回false表示阻止更改。
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。回调中的第四个参数"map" 是被包裹的Map对象，不是ObservableMap
     */
    on(event: 'beforeUpdate', callback: (key: K, newValue: V, oldValue: V, map: Map<K, V>) => boolean): void;
    /**
     * 当向Map中添加元素时触发
     */
    on(event: 'add', callback: (value: V, key: K) => void): void;
    /**
     * 当删除Map中元素时触发
     */
    on(event: 'remove', callback: (value: V, key: K) => void): void;
    on(event: any, callback: any): any {
        switch (event) {
            case 'update':
                this._onUpdate.add(callback);
                break;

            case 'beforeUpdate':
                this._onBeforeUpdate = callback;
                break;

            case 'add':
                this._onAdd.add(callback);
                break;

            case 'remove':
                this._onRemove.add(callback);
                break;

            default:
                super.on(event, callback);
                break;
        }
    }

    once(event: 'set', callback: (newValue: Map<K, V>, oldValue: Map<K, V>) => void): void;
    once(event: 'beforeSet', callback: (newValue: Map<K, V>, oldValue: Map<K, V>, oMap: this) => boolean): void;
    once(event: 'update', callback: (newValue: V, oldValue: V, key: K) => void): void;
    once(event: 'beforeUpdate', callback: (key: K, newValue: V, oldValue: V, map: Map<K, V>) => boolean): void;
    once(event: 'add', callback: (value: V, key: K) => void): void;
    once(event: 'remove', callback: (value: V, key: K) => void): void;
    once(event: any, callback: any): any {
        super.once(event, callback);
    }

    off(event: 'set', callback?: (newValue: Map<K, V>, oldValue: Map<K, V>) => void): void;
    off(event: 'beforeSet', callback?: (newValue: Map<K, V>, oldValue: Map<K, V>, oMap: this) => boolean): void;
    off(event: 'update', callback?: (newValue: V, oldValue: V, key: K) => void): void;
    off(event: 'beforeUpdate', callback?: (key: K, newValue: V, oldValue: V, map: Map<K, V>) => boolean): void;
    off(event: 'add', callback?: (value: V, key: K) => void): void;
    off(event: 'remove', callback?: (value: V, key: K) => void): void;
    off(event: any, callback: any): any {
        switch (event) {
            case 'update':
                callback ? this._onUpdate.delete(callback) : this._onUpdate.clear();
                break;

            case 'beforeUpdate':
                this._onBeforeUpdate = undefined as any;
                break;

            case 'add':
                callback ? this._onAdd.delete(callback) : this._onAdd.clear();
                break;

            case 'remove':
                callback ? this._onRemove.delete(callback) : this._onRemove.clear();
                break;

            default:
                super.off(event, callback);
                break;
        }
    }

    //#endregion

    //#region Map修改操作方法

    /**
     * 移除Map对象中的所有元素。
     */
    clear(): void {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onRemove.size > 0) {
            this._value.forEach((value, key) => {
                this._value.delete(key);
                this._onRemove.forEach(callback => callback(value, key));
            });
        } else
            this._value.clear();
    }

    /**
     * 用于移除 Map 对象中指定的元素。
     */
    delete(key: K): boolean {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onRemove.size > 0) {
            if (this._value.has(key)) {
                const value = this._value.get(key);
                this._value.delete(key);
                this._onRemove.forEach(callback => callback(value as V, key));
                return true;
            } else
                return false;
        } else
            return this._value.delete(key);
    }

    /**
     * 为Map对象添加一个指定键（key）和值（value）的新元素。
     */
    set(key: K, value: V): this {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._value.has(key)) {
            const oldValue = this._value.get(key) as V;

            if (this._onBeforeUpdate !== undefined)
                if (this._onBeforeUpdate(key, value, oldValue, this._value) === false)
                    return this;

            this._value.set(key, value);
            this._onUpdate.forEach(callback => callback(value, oldValue, key));
        } else {
            this._value.set(key, value);
            this._onAdd.forEach(callback => callback(value, key));
        }

        return this;
    }

    //#endregion

    //#region Map读取操作方法

    /**
     * 返回一个新的包含 [key, value] 对的 Iterator 对象，返回的迭代器的迭代顺序与 Map 对象的插入顺序相同。
     */
    entries() {
        return this._value.entries();
    }

    /**
     * 以插入顺序对 Map 对象中的每一个键值对执行一次参数中提供的回调函数。
     */
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        this._value.forEach(callbackfn, thisArg);
    }

    /**
     * 用来获取一个 Map 对象中指定的元素。
     */
    get(key: K): V {
        return this._value.get(key) as V;
    }

    /**
     * 返回一个bool值，用来表明map 中是否存在指定元素
     */
    has(key: K): boolean {
        return this._value.has(key);
    }

    /**
     * 返回一个新的 Iterator 对象。它包含按照顺序插入Map对象中每个元素的key值。
     */
    keys() {
        return this._value.keys();
    }

    /**
     * 返回一个新的Iterator对象。它包含按顺序插入Map对象中每个元素的value值。
     */
    values() {
        return this._value.values();
    }

    //#endregion
}