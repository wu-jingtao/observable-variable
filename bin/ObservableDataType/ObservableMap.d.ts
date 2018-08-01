import { ObservableVariable, OnSetCallback } from "./ObservableVariable";
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
    protected _onAdd: Set<OnAddOrRemoveMapElementCallback<K, V>>;
    protected _onRemove: Set<OnAddOrRemoveMapElementCallback<K, V>>;
    constructor(value: ObservableMap<K, V> | Map<K, V> | ReadonlyArray<[K, V]>);
    /**
     * Map元素个数
     */
    readonly size: number;
    protected toJSON(): any;
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
    once(event: 'set', callback: OnSetCallback<Map<K, V>>): void;
    once(event: 'add', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    once(event: 'remove', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    off(event: 'set', callback?: OnSetCallback<Map<K, V>>): void;
    off(event: 'add', callback?: OnAddOrRemoveMapElementCallback<K, V>): void;
    off(event: 'remove', callback?: OnAddOrRemoveMapElementCallback<K, V>): void;
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
export interface OnAddOrRemoveMapElementCallback<K, V> {
    (value: V, key: K): void;
}
//# sourceMappingURL=ObservableMap.d.ts.map