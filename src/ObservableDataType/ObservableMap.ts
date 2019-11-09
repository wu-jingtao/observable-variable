import isDeepEqual from 'lodash.isequal';
import { ObservableVariable, IObservableVariableOptions } from './ObservableVariable';

/**
 * 可观察改变Map
 */
export class ObservableMap<K, V> extends ObservableVariable<ReadonlyMap<K, V>> {
    protected _value: Map<K, V>;
    protected _onAdd: Set<(value: V, key: K, oMap: ObservableMap<K, V>) => void> = new Set();
    protected _onDelete: Set<(value: V, key: K, oMap: ObservableMap<K, V>) => void> = new Set();
    protected _onUpdate: Set<(newValue: V, oldValue: V, key: K, oMap: ObservableMap<K, V>) => void> = new Set();
    protected _onBeforeUpdate?: (newValue: V, oldValue: V, key: K, oMap: ObservableMap<K, V>) => V;

    /**
     * Map中元素个数
     */
    get size(): number {
        return this._value.size;
    }

    constructor(value: ObservableMap<K, V> | Map<K, V> | [K, V][], options?: IObservableVariableOptions) {
        super(value as any, options);
        if (this !== value && Array.isArray(value)) this._value = new Map(value);
    }

    toJSON(): any {
        return this._serializable ? [...this._value] : undefined;
    }

    /**
     * 当改变变量值的时候触发
     */
    on(event: 'set', callback: (newValue: Map<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => void): void;
    /**
     * 在变量值发生改变之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受ensureChange的影响，只要用户设置变量值就会被触发
     */
    on(event: 'beforeSet', callback: (newValue: Map<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => ReadonlyMap<K, V>): void;
    /**
     * 当更新Map中某个元素的值时触发
     */
    on(event: 'update', callback: (newValue: V, oldValue: V, key: K, oMap: this) => void): void;
    /**
     * 在更新Map中某个元素的值之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受ensureChange的影响，只要用户设置变量值就会被触发
     */
    on(event: 'beforeUpdate', callback: (newValue: V, oldValue: V, key: K, oMap: this) => V): void;
    /**
     * 当向Map中添加元素时触发
     */
    on(event: 'add', callback: (value: V, key: K, oMap: this) => void): void;
    /**
     * 当删除Map中元素时触发
     */
    on(event: 'delete', callback: (value: V, key: K, oMap: this) => void): void;
    on(event: any, callback: any): void {
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

            case 'delete':
                this._onDelete.add(callback);
                break;

            default:
                super.on(event, callback);
                break;
        }
    }

    once(event: 'set', callback: (newValue: Map<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => void): void;
    once(event: 'beforeSet', callback: (newValue: Map<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => ReadonlyMap<K, V>): void;
    once(event: 'update', callback: (newValue: V, oldValue: V, key: K, oMap: this) => void): void;
    once(event: 'beforeUpdate', callback: (newValue: V, oldValue: V, key: K, oMap: this) => V): void;
    once(event: 'add', callback: (value: V, key: K, oMap: this) => void): void;
    once(event: 'delete', callback: (value: V, key: K, oMap: this) => void): void;
    once(event: any, callback: any): void {
        super.once(event, callback);
    }

    off(event: 'set', callback?: (newValue: Map<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => void): void;
    off(event: 'beforeSet', callback?: (newValue: Map<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => ReadonlyMap<K, V>): void;
    off(event: 'update', callback?: (newValue: V, oldValue: V, key: K, oMap: this) => void): void;
    off(event: 'beforeUpdate', callback?: (newValue: V, oldValue: V, key: K, oMap: this) => V): void;
    off(event: 'add', callback?: (value: V, key: K, oMap: this) => void): void;
    off(event: 'delete', callback?: (value: V, key: K, oMap: this) => void): void;
    off(event: any, callback: any): void {
        switch (event) {
            case 'update':
                callback ? this._onUpdate.delete(callback) : this._onUpdate.clear();
                break;

            case 'beforeUpdate':
                this._onBeforeUpdate = undefined;
                break;

            case 'add':
                callback ? this._onAdd.delete(callback) : this._onAdd.clear();
                break;

            case 'delete':
                callback ? this._onDelete.delete(callback) : this._onDelete.clear();
                break;

            default:
                super.off(event, callback);
                break;
        }
    }

    // #region Map修改操作方法

    /**
     * 清除Map中的所有元素，清除成功将触发delete事件
     */
    clear(): void {
        if (this._onDelete.size > 0) {
            for (const [key, value] of this._value) {
                this._value.delete(key);
                for (const callback of this._onDelete) callback(value, key, this);
            }
        } else
            this._value.clear();
    }

    /**
     * 用于删除Map中指定的元素，删除成功将触发delete事件
     */
    delete(key: K): boolean {
        if (this._onDelete.size > 0) {
            if (this._value.has(key)) {
                const value = this._value.get(key) as V;
                this._value.delete(key);
                for (const callback of this._onDelete) callback(value, key, this);
                return true;
            } else
                return false;
        } else
            return this._value.delete(key);
    }

    /**
     * 为Map添加或更新一个元素，添加成功将触发add事件，更新将触发beforeUpdate和update事件
     */
    set(key: K, value: V): this {
        if (this._value.has(key)) {
            const oldValue = this._value.get(key) as V;
            if (this._onBeforeUpdate) value = this._onBeforeUpdate(value, oldValue, key, this);
            if (this._ensureChange && (this._deepCompare ? isDeepEqual(value, oldValue) : value === oldValue)) return this;

            this._value.set(key, value);
            for (const callback of this._onUpdate) callback(value, oldValue, key, this);
        } else {
            this._value.set(key, value);
            for (const callback of this._onAdd) callback(value, key, this);
        }

        return this;
    }

    // #endregion

    // #region Map读取操作方法

    /**
     * 返回一个[key, value]键值对Iterator对象，返回的迭代器的迭代顺序与Map中元素的插入顺序相同
     */
    entries(): IterableIterator<[K, V]> {
        return this._value.entries();
    }

    /**
     * 以插入顺序对Map中的每一个键值对执行一次参数中提供的回调函数
     */
    forEach<H = undefined>(callback: (this: H, value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: H): void {
        this._value.forEach(callback, thisArg);
    }

    /**
     * 获取Map中指定的元素
     */
    get(key: K): V | undefined {
        return this._value.get(key);
    }

    /**
     * 返回一个bool值，用来表明Map中是否存在指定元素
     */
    has(key: K): boolean {
        return this._value.has(key);
    }

    /**
     * 返回一个Iterator对象，它包含按照顺序插入Map对象中每个元素的key值
     */
    keys(): IterableIterator<K> {
        return this._value.keys();
    }

    /**
     * 返回一个Iterator对象，它包含按顺序插入Map对象中每个元素的value值
     */
    values(): IterableIterator<V> {
        return this._value.values();
    }

    // #endregion
}

export function oMap<K, V>(value: ObservableMap<K, V> | Map<K, V> | [K, V][], options?: IObservableVariableOptions): ObservableMap<K, V> {
    return new ObservableMap(value, options);
}