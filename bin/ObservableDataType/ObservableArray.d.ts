import { ObservableVariable } from "./ObservableVariable";
/**
 * 可观察改变数组
 */
export declare class ObservableArray<T> extends ObservableVariable<T[]> {
    /**
     * 将一个数组转换成可观察数组，相当于 new ObservableArray(value)
     */
    static observe<T>(value: ObservableArray<T> | T[]): ObservableArray<T>;
    /**
     * 将对象中指定位置的一个数组转换成可观察数组，路径通过`.`分割
     */
    static observe(object: object, path: string): void;
    /**
     * 将对象中指定位置的一个数组转换成可观察数组
     */
    static observe(object: object, path: string[]): void;
    protected _onAdd: Set<(value: T) => void>;
    protected _onRemove: Set<(value: T) => void>;
    constructor(value: ObservableArray<T> | T[]);
    /**
     * 数组的长度
     */
    length: number;
    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: (newValue: T[], oldValue: T[]) => void): void;
    /**
     * 在值发生改变之前触发，返回void或true表示同意更改，返回false表示阻止更改。注意：该回调只允许设置一个，重复设置将覆盖之前的回调
     */
    on(event: 'beforeSet', callback: (newValue: T[], oldValue: T[], oArr: this) => boolean | void): void;
    /**
     * 当向数组中添加元素时触发
     */
    on(event: 'add', callback: (value: T) => void): void;
    /**
     * 当删除数组中元素时触发
     */
    on(event: 'remove', callback: (value: T) => void): void;
    once(event: 'set', callback: (newValue: T[], oldValue: T[]) => void): void;
    once(event: 'beforeSet', callback: (newValue: T[], oldValue: T[], oArr: this) => boolean | void): void;
    once(event: 'add', callback: (value: T) => void): void;
    once(event: 'remove', callback: (value: T) => void): void;
    off(event: 'set', callback?: (newValue: T[], oldValue: T[]) => void): void;
    off(event: 'beforeSet', callback?: (newValue: T[], oldValue: T[], oArr: this) => boolean | void): void;
    off(event: 'add', callback?: (value: T) => void): void;
    off(event: 'remove', callback?: (value: T) => void): void;
    /**
     * 从数组中删除最后一个元素，并返回该元素的值。此方法更改数组的长度。
     */
    pop(): T | undefined;
    /**
     * 将一个或多个元素添加到数组的末尾，并返回新数组的长度。
     */
    push(...items: T[]): number;
    /**
     * 从数组中删除第一个元素，并返回该元素的值。此方法更改数组的长度。
     */
    shift(): T | undefined;
    /**
     * 将一个或多个元素添加到数组的开头，并返回新数组的长度。
     */
    unshift(...items: T[]): number;
    /**
     * 从指定位置开始删除数组剩下的元素
     * @param start 从哪开始删除元素
     */
    splice(start: number, deleteCount?: number): T[];
    /**
     * 改变数组的内容，通过移除或添加新元素
     * @param start 从哪开始删除元素
     * @param deleteCount 删除多少个元素
     * @param items 要插入的元素
     */
    splice(start: number, deleteCount: number, ...items: T[]): T[];
    /**
     * 删除数组中第一个与之匹配的元素
     * @param value 要被删除的值
     */
    delete(value: T): boolean;
    /**
     * 删除数组中所有与之匹配的元素
     * @param value 要被删除的值
     */
    deleteAll(value: T): void;
    /**
     * 排序数组。注意，排序完成之后将触发onSet事件
     * @param compareFn 排序方法
     */
    sort(compareFn?: (a: T, b: T) => number): this;
    /**
     * 反转数组中元素顺序。注意，反转完成之后将触发onSet事件
     */
    reverse(): this;
    /**
     * 将数组中指定部分的值填充为指定值。注意，填充完成之后将触发onSet事件
     * @param value 要填充的值
     * @param start 开始位置
     * @param end 结束位置
     */
    fill(value: T, start?: number, end?: number): this;
    /**
     * 浅复制数组的一部分到同一数组中的另一个位置，并返回它，而不修改其大小。注意，完成之后将触发onSet事件
     */
    copyWithin(target: number, start: number, end?: number): this;
    /**
     * 用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。
     */
    concat(...items: ConcatArray<T>[]): T[];
    /**
     * 返回一个新的Array Iterator对象，该对象包含数组中每个索引的键/值对。
     */
    entries(): IterableIterator<[number, T]>;
    /**
     * 测试数组的所有元素是否都通过了指定函数的测试。
     */
    every(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
    /**
     * 创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。
     */
    filter<S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
    filter(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any): T[];
    /**
     * 返回数组中满足提供的测试函数的第一个元素的值。否则返回 undefined。
     */
    find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
    find(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined;
    /**
     * 返回数组中满足提供的测试函数的第一个元素的索引。否则返回-1。
     */
    findIndex(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): number;
    /**
     * 对数组的每个元素执行一次提供的函数。
     */
    forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
    /**
     * 用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 true，否则返回false。
     */
    includes(searchElement: T, fromIndex?: number): boolean;
    /**
     * 返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回-1。
     */
    indexOf(searchElement: T, fromIndex?: number): number;
    /**
     * 方法将一个数组（或一个类数组对象）的所有元素连接成一个字符串并返回这个字符串。
     */
    join(separator?: string): string;
    /**
     * 返回一个新的Array迭代器，它包含数组中每个索引的键。
     */
    keys(): IterableIterator<number>;
    /**
     * 返回指定元素（也即有效的 JavaScript 值或变量）在数组中的最后一个的索引，如果不存在则返回 -1。从数组的后面向前查找，从 fromIndex 处开始。
     */
    lastIndexOf(searchElement: T, fromIndex?: number): number;
    /**
     * 创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。
     */
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
    /**
     * 对累加器和数组中的每个元素（从左到右）应用一个函数，将其减少为单个值。
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
    /**
     * 接受一个函数作为累加器（accumulator）和数组的每个值（从右到左）将其减少为单个值。
     */
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
    /**
     * 返回一个从开始到结束（不包括结束）选择的数组的一部分浅拷贝到一个新数组对象。且原始数组不会被修改。
     */
    slice(start?: number, end?: number): T[];
    /**
     * 测试数组中的某些元素是否通过由提供的函数实现的测试。
     */
    some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
    /**
     * 返回一个字符串表示数组中的元素。数组中的元素将使用各自的 toLocaleString 方法转成字符串，这些字符串将使用一个特定语言环境的字符串（例如一个逗号 ","）隔开。
     */
    toLocaleString(): string;
    /**
     * 返回一个字符串，表示指定的数组及其元素。
     */
    toString(): string;
    /**
     * 返回一个新的 Array Iterator 对象，该对象包含数组每个索引的值
     */
    values(): IterableIterator<T>;
}
//# sourceMappingURL=ObservableArray.d.ts.map