import isDeepEqual from 'lodash.isequal';
import { ObservableVariable, type ObservableVariableOptions } from './ObservableVariable';

/**
 * 可观察 Map
 */
export class ObservableMap<K, V> extends ObservableVariable<ReadonlyMap<K, V>> {
    protected readonly _onAdd: Set<(value: V, key: K, oMap: this) => void> = new Set();
    protected readonly _onDelete: Set<(value: V, key: K, oMap: this) => void> = new Set();
    protected readonly _onUpdate: Set<(newValue: V, oldValue: V, key: K, oMap: this) => void> = new Set();
    protected _onBeforeUpdate?: ((newValue: V, oldValue: V, key: K, oMap: this) => V) | undefined;

    /**
     * Map 中元素个数
     */
    get size(): number {
        return this._value.size;
    }

    constructor(value: Iterable<[K, V]> = new Map(), options?: ObservableVariableOptions) {
        if (value instanceof ObservableVariable) { return value as any } // eslint-disable-line no-constructor-return -- 确保变量不会被重复包装
        super(value as ReadonlyMap<K, V>, options);
        if (!(this._value instanceof Set)) { this._value = new Map(value) }
    }

    // @ts-expect-error: 由于 Map 的 toJSON 方法只会返回一个空对象，为了让结果有意义，这里将 Map 转换为数组，所以需要强行覆盖父类返回值类型
    toJSON(): [K, V][] | undefined {
        return this._serializable ? [...this._value] : undefined;
    }

    // #region 事件绑定

    /**
     * 当变量值发生改变时触发
     */
    override on(event: 'set', callback: (newValue: ReadonlyMap<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => void): void;
    /**
     * 在变量值发生改变之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受 ensureChange 的影响，只要用户设置值就会被触发
     */
    override on(event: 'beforeSet', callback: (newValue: ReadonlyMap<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => ReadonlyMap<K, V>): void;
    /**
     * 当更新 Map 中某个元素的值时触发
     */
    override on(event: 'update', callback: (newValue: V, oldValue: V, key: K, oMap: this) => void): void;
    /**
     * 在 Map 中某个元素的值发生改变之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受 ensureChange 的影响，只要用户设置变量值就会被触发
     */
    override on(event: 'beforeUpdate', callback: (newValue: V, oldValue: V, key: K, oMap: this) => V): void;
    /**
     * 当向 Map 中添加元素时触发
     */
    override on(event: 'add', callback: (value: V, key: K, oMap: this) => void): void;
    /**
     * 当删除 Map 中元素时触发
     */
    override on(event: 'delete', callback: (value: V, key: K, oMap: this) => void): void;
    override on(event: any, callback: any): void {
        switch (event) {
            case 'update': {
                this._onUpdate.add(callback);
                break;
            }
            case 'beforeUpdate': {
                this._onBeforeUpdate = callback;
                break;
            }
            case 'add': {
                this._onAdd.add(callback);
                break;
            }
            case 'delete': {
                this._onDelete.add(callback);
                break;
            }
            default: {
                super.on(event, callback);
                break;
            }
        }
    }

    override once(event: 'set', callback: (newValue: ReadonlyMap<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => void): void;
    override once(event: 'beforeSet', callback: (newValue: ReadonlyMap<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => ReadonlyMap<K, V>): void;
    override once(event: 'update', callback: (newValue: V, oldValue: V, key: K, oMap: this) => void): void;
    override once(event: 'beforeUpdate', callback: (newValue: V, oldValue: V, key: K, oMap: this) => V): void;
    override once(event: 'add', callback: (value: V, key: K, oMap: this) => void): void;
    override once(event: 'delete', callback: (value: V, key: K, oMap: this) => void): void;
    override once(event: any, callback: any): void {
        super.once(event, callback);
    }

    override off(event: 'set', callback?: (newValue: ReadonlyMap<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => void): void;
    override off(event: 'beforeSet', callback?: (newValue: ReadonlyMap<K, V>, oldValue: ReadonlyMap<K, V>, oMap: this) => ReadonlyMap<K, V>): void;
    override off(event: 'update', callback?: (newValue: V, oldValue: V, key: K, oMap: this) => void): void;
    override off(event: 'beforeUpdate', callback?: (newValue: V, oldValue: V, key: K, oMap: this) => V): void;
    override off(event: 'add', callback?: (value: V, key: K, oMap: this) => void): void;
    override off(event: 'delete', callback?: (value: V, key: K, oMap: this) => void): void;
    override off(event: any, callback: any): void {
        switch (event) {
            case 'update': {
                callback ? this._onUpdate.delete(callback) : this._onUpdate.clear();
                break;
            }
            case 'beforeUpdate': {
                this._onBeforeUpdate = undefined;
                break;
            }
            case 'add': {
                callback ? this._onAdd.delete(callback) : this._onAdd.clear();
                break;
            }
            case 'delete': {
                callback ? this._onDelete.delete(callback) : this._onDelete.clear();
                break;
            }
            default: {
                super.off(event, callback);
                break;
            }
        }
    }

    // #endregion

    // #region Map 修改操作方法

    /**
     * 清除 Map 中的所有元素，清除成功将触发 delete 事件
     */
    clear(): void {
        if (this._onDelete.size > 0) {
            for (const [key, value] of this._value) {
                (this._value as Map<K, V>).delete(key);
                for (const callback of this._onDelete) { callback(value, key, this) }
            }
        } else {
            (this._value as Map<K, V>).clear();
        }
    }

    /**
     * 用于删除 Map 中指定的元素，删除成功将触发 delete 事件
     * @param key 要删除的键名
     * @returns 如果 Map 中有这个值就返回 true，否则返回 false
     */
    delete(key: K): boolean {
        if (this._onDelete.size > 0) {
            if (this._value.has(key)) {
                const value = this._value.get(key)!;
                (this._value as Map<K, V>).delete(key);
                for (const callback of this._onDelete) { callback(value, key, this) }
                return true;
            } else {
                return false;
            }
        } else {
            return (this._value as Map<K, V>).delete(key);
        }
    }

    /**
     * 为 Map 添加或更新一个元素，添加成功将触发 add 事件，更新将触发 beforeUpdate 和 update 事件
     * @param key 要设置的键名
     * @param value 要设置的值
     */
    set(key: K, value: V): this {
        if (this._value.has(key)) {
            const oldValue = this._value.get(key)!;
            if (this._onBeforeUpdate) { value = this._onBeforeUpdate(value, oldValue, key, this) }
            if (this._ensureChange && (this._deepCompare ? isDeepEqual(value, oldValue) : value === oldValue)) { return this }

            (this._value as Map<K, V>).set(key, value);
            for (const callback of this._onUpdate) { callback(value, oldValue, key, this) }
        } else {
            (this._value as Map<K, V>).set(key, value);
            for (const callback of this._onAdd) { callback(value, key, this) }
        }
        return this;
    }

    // #endregion

    // #region Map读取操作方法

    /**
     * 返回一个 [key, value] 键值对 Iterator 对象，返回的迭代器的迭代顺序与 Map 中元素的插入顺序相同
     */
    entries(): IterableIterator<[K, V]> {
        return this._value.entries();
    }

    /**
     * 以插入顺序对 Map 中的每一个键值对执行一次参数中提供的回调函数
     * @param callback 回调函数
     * @param thisArg 回调函数中的 this
     */
    forEach<H>(callback: (this: H, value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: H): void {
        this._value.forEach(callback, thisArg);
    }

    /**
     * 获取 Map 中指定的元素
     * @param key 要获取元素的键名
     */
    get(key: K): V | undefined {
        return this._value.get(key);
    }

    /**
     * 返回一个 bool 值，用来表明 Map 中是否存在指定元素
     * @param key 要查询的键名
     */
    has(key: K): boolean {
        return this._value.has(key);
    }

    /**
     * 返回一个 Iterator 对象，它包含按照顺序插入 Map 对象中每个元素的 key 值
     */
    keys(): IterableIterator<K> {
        return this._value.keys();
    }

    /**
     * 返回一个 Iterator 对象，它包含按顺序插入 Map 对象中每个元素的 value 值
     */
    values(): IterableIterator<V> {
        return this._value.values();
    }

    /**
     * 返回一个 [key, value] 键值对 Iterator 对象，返回的迭代器的迭代顺序与 Map 中元素的插入顺序相同
     */
    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this._value[Symbol.iterator]();
    }

    // #endregion
}

export function oMap<K, V>(value?: Iterable<[K, V]>, options?: ObservableVariableOptions): ObservableMap<K, V> {
    return new ObservableMap(value, options);
}
