import { ObservableVariable, OnSetCallback } from "./ObservableVariable";

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

    protected _onAdd: Set<OnAddOrRemoveMapElementCallback<K, V>> = new Set();
    protected _onRemove: Set<OnAddOrRemoveMapElementCallback<K, V>> = new Set();

    constructor(value: ObservableMap<K, V> | Map<K, V> | ReadonlyArray<[K, V]>) {
        super(value as any);

        if (this !== value)
            if (Array.isArray(value))
                this._value = new Map(value);
    }

    /**
     * Map元素个数
     */
    get size(){
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
    on(event: 'set', callback: OnSetCallback<Map<K, V>>): void;
    /**
     * 当向Map中添加元素时触发
     */
    on(event: 'add', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    /**
     * 当删除Map中元素时触发
     */
    on(event: 'remove', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    on(event: any, callback: any): any {
        switch (event) {
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

    once(event: 'set', callback: OnSetCallback<Map<K, V>>): void;
    once(event: 'add', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    once(event: 'remove', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    once(event: any, callback: any): any {
        super.once(event, callback);
    }

    off(event: 'set', callback?: OnSetCallback<Map<K, V>>): void;
    off(event: 'add', callback?: OnAddOrRemoveMapElementCallback<K, V>): void;
    off(event: 'remove', callback?: OnAddOrRemoveMapElementCallback<K, V>): void;
    off(event: any, callback: any): any {
        switch (event) {
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
        if (this._onAdd.size > 0) {
            if (!this._value.has(key)) {
                this._value.set(key, value);
                this._onAdd.forEach(callback => callback(value, key));
            } else
                this._value.set(key, value);
        } else
            this._value.set(key, value);

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

export interface OnAddOrRemoveMapElementCallback<K, V> { (value: V, key: K): void };