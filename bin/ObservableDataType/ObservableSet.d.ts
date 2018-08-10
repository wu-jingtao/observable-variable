import { ObservableVariable } from "./ObservableVariable";
/**
 * 可观察改变集合
 */
export declare class ObservableSet<T> extends ObservableVariable<Set<T>> {
    /**
     * 将一个数组转换成可观察集合，相当于 new ObservableSet(value)
     */
    static observe<T>(value: ObservableSet<T> | Set<T> | T[]): ObservableSet<T>;
    /**
     * 将对象中指定位置的一个数组转换成可观察集合，路径通过`.`分割
     */
    static observe(object: object, path: string): void;
    /**
     * 将对象中指定位置的一个数组转换成可观察集合
     */
    static observe(object: object, path: string[]): void;
    protected _onAdd: Set<(value: T) => void>;
    protected _onRemove: Set<(value: T) => void>;
    constructor(value: ObservableSet<T> | Set<T> | T[]);
    /**
     * 集合元素个数
     */
    readonly size: number;
    protected toJSON(): any;
    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: (newValue: Set<T>, oldValue: Set<T>) => void): void;
    /**
     * 在值发生改变之前触发，返回void或true表示同意更改，返回false表示阻止更改。注意：该回调只允许设置一个，重复设置将覆盖之前的回调，同时设置的回调是以同步方式执行的
     */
    on(event: 'beforeSet', callback: (newValue: Set<T>, oldValue: Set<T>, oSet: this) => boolean | void): void;
    /**
     * 当向集合中添加元素时触发
     */
    on(event: 'add', callback: (value: T) => void): void;
    /**
     * 当删除集合中元素时触发
     */
    on(event: 'remove', callback: (value: T) => void): void;
    once(event: 'set', callback: (newValue: Set<T>, oldValue: Set<T>) => void): void;
    once(event: 'beforeSet', callback: (newValue: Set<T>, oldValue: Set<T>, oSet: this) => boolean | void): void;
    once(event: 'add', callback: (value: T) => void): void;
    once(event: 'remove', callback: (value: T) => void): void;
    off(event: 'set', callback?: (newValue: Set<T>, oldValue: Set<T>) => void): void;
    off(event: 'beforeSet', callback?: (newValue: Set<T>, oldValue: Set<T>, oSet: this) => boolean | void): void;
    off(event: 'add', callback?: (value: T) => void): void;
    off(event: 'remove', callback?: (value: T) => void): void;
    /**
     * 用来清空一个 Set 对象中的所有元素。
     */
    clear(): void;
    /**
     * 从一个 Set 对象中删除指定的元素。
     */
    delete(value: T): boolean;
    /**
     * 用来向一个 Set 对象的末尾添加一个指定的值。
     */
    add(value: T): this;
    /**
     * 返回一个新的包含 [value, value] 对的 Iterator 对象，返回的迭代器的迭代顺序与 Set 对象的插入顺序相同。
     */
    entries(): IterableIterator<[T, T]>;
    /**
     * 根据集合中元素的顺序，对每个元素都执行提供的 callback 函数一次。
     */
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
    /**
     * 返回一个布尔值来指示对应的值value是否存在Set对象中
     */
    has(value: T): boolean;
    /**
     * 行为与 value 方法完全一致，返回 Set 对象的元素。
     */
    keys(): IterableIterator<T>;
    /**
     * 返回一个 Iterator  对象，这个对象以插入Set 对象的顺序包含了原 Set 对象里的每个元素。
     */
    values(): IterableIterator<T>;
}
//# sourceMappingURL=ObservableSet.d.ts.map