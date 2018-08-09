import { ObservableVariable } from "./ObservableVariable";
/**
 * 可观察改变Map
 */
export declare class ObservableMap<K, V> extends ObservableVariable<Map<K, V>> {
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
    protected _onAdd: Set<(value: V, key: K) => void>;
    protected _onRemove: Set<(value: V, key: K) => void>;
    protected _onUpdate: Set<(newValue: V, oldValue: V, key: K) => void>;
    protected _onBeforeUpdate: (key: K, newValue: V, oldValue: V, map: Map<K, V>) => boolean | void;
    constructor(value: ObservableMap<K, V> | Map<K, V> | ReadonlyArray<[K, V]>);
    /**
     * Map元素个数
     */
    readonly size: number;
    protected toJSON(): any;
    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: (newValue: Map<K, V>, oldValue: Map<K, V>) => void): void;
    /**
     * 在值发生改变之前触发，返回void或true表示同意更改，返回false表示阻止更改。注意：该回调只允许设置一个，重复设置将覆盖之前的回调
     */
    on(event: 'beforeSet', callback: (newValue: Map<K, V>, oldValue: Map<K, V>, oMap: this) => boolean | void): void;
    /**
     * 当更新Map中某个元素的值时触发
     */
    on(event: 'update', callback: (newValue: V, oldValue: V, key: K) => void): void;
    /**
     * 在更新Map中某个元素的值之前触发，返回void或true表示同意更改，返回false表示阻止更改。
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。回调中的第四个参数"map" 是被包裹的Map对象，不是ObservableMap
     */
    on(event: 'beforeUpdate', callback: (key: K, newValue: V, oldValue: V, map: Map<K, V>) => boolean | void): void;
    /**
     * 当向Map中添加元素时触发
     */
    on(event: 'add', callback: (value: V, key: K) => void): void;
    /**
     * 当删除Map中元素时触发
     */
    on(event: 'remove', callback: (value: V, key: K) => void): void;
    once(event: 'set', callback: (newValue: Map<K, V>, oldValue: Map<K, V>) => void): void;
    once(event: 'beforeSet', callback: (newValue: Map<K, V>, oldValue: Map<K, V>, oMap: this) => boolean | void): void;
    once(event: 'update', callback: (newValue: V, oldValue: V, key: K) => void): void;
    once(event: 'beforeUpdate', callback: (key: K, newValue: V, oldValue: V, map: Map<K, V>) => boolean | void): void;
    once(event: 'add', callback: (value: V, key: K) => void): void;
    once(event: 'remove', callback: (value: V, key: K) => void): void;
    off(event: 'set', callback?: (newValue: Map<K, V>, oldValue: Map<K, V>) => void): void;
    off(event: 'beforeSet', callback?: (newValue: Map<K, V>, oldValue: Map<K, V>, oMap: this) => boolean | void): void;
    off(event: 'update', callback?: (newValue: V, oldValue: V, key: K) => void): void;
    off(event: 'beforeUpdate', callback?: (key: K, newValue: V, oldValue: V, map: Map<K, V>) => boolean | void): void;
    off(event: 'add', callback?: (value: V, key: K) => void): void;
    off(event: 'remove', callback?: (value: V, key: K) => void): void;
    /**
     * 移除Map对象中的所有元素。
     */
    clear(): void;
    /**
     * 用于移除 Map 对象中指定的元素。
     */
    delete(key: K): boolean;
    /**
     * 为Map对象添加一个指定键（key）和值（value）的新元素。
     */
    set(key: K, value: V): this;
    /**
     * 返回一个新的包含 [key, value] 对的 Iterator 对象，返回的迭代器的迭代顺序与 Map 对象的插入顺序相同。
     */
    entries(): IterableIterator<[K, V]>;
    /**
     * 以插入顺序对 Map 对象中的每一个键值对执行一次参数中提供的回调函数。
     */
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    /**
     * 用来获取一个 Map 对象中指定的元素。
     */
    get(key: K): V;
    /**
     * 返回一个bool值，用来表明map 中是否存在指定元素
     */
    has(key: K): boolean;
    /**
     * 返回一个新的 Iterator 对象。它包含按照顺序插入Map对象中每个元素的key值。
     */
    keys(): IterableIterator<K>;
    /**
     * 返回一个新的Iterator对象。它包含按顺序插入Map对象中每个元素的value值。
     */
    values(): IterableIterator<V>;
}
//# sourceMappingURL=ObservableMap.d.ts.map