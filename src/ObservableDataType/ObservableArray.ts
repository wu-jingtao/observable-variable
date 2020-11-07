import isDeepEqual from 'lodash.isequal';
import { ObservableVariable } from './ObservableVariable';
import type { ObservableVariableOptions } from './ObservableVariable';

/**
 * JS 数组的最大长度
 */
const JS_ARRAY_MAX_LENGTH = 2 ** 32 - 1;

export interface ObservableArrayOptions extends ObservableVariableOptions {
    /**
     * 某些数组操作执行后会触发 set 事件，出于性能考虑，set 事件的 oldValue 与 newValue 相同，如果需要提供 oldValue，则可以设置为 true。默认：false
     */
    provideOnSetOldValue?: boolean;
}

/**
 * 可观察改变数组
 */
export class ObservableArray<T> extends ObservableVariable<readonly T[]> {
    protected readonly _provideOnSetOldValue: boolean;
    protected readonly _onAdd: Set<(value: T, index: number, oArr: ObservableArray<T>) => void> = new Set();
    protected readonly _onDelete: Set<(value: T, index: number, oArr: ObservableArray<T>) => void> = new Set();
    protected readonly _onUpdate: Set<(newValue: T, oldValue: T, index: number, oArr: ObservableArray<T>) => void> = new Set();
    protected _onBeforeUpdate?: (newValue: T, oldValue: T, index: number, oArr: ObservableArray<T>) => T;

    /**
     * 数组的长度
     */
    get length(): number {
        return this._value.length;
    }

    set length(v: number) {
        if (v > JS_ARRAY_MAX_LENGTH || v < 0 || !Number.isInteger(v)) throw new RangeError('Invalid array length');

        if (v < this._value.length) {
            const number = this._value.length - v;
            this.splice(this._value.length - number, number);
        } else {
            /**
             * this.push(...new Array(v - this._value.length));
             * 
             * 当 v > this._value.length 时没有用这种是因为：
             *      1. JS 原生使用 empty 来填充空位，而我这样做用的是 undefined 来填充
             *      2. 通过 length 来拉长数组严格上来说并不算是向数组中添加元素（与在超过数组长度的位置上设置值类似），所以不需要触发 onAdd 事件
             */
            (this._value as T[]).length = v;
        }
    }

    /**
     * 获取数组中第一个元素
     */
    get first(): T | undefined {
        return this._value[0];
    }

    /**
     * 获取数组中最后一个元素
     */
    get last(): T | undefined {
        return this._value[this._value.length - 1];
    }

    constructor(value: ObservableArray<T> | readonly T[] = [], options: ObservableArrayOptions = {}) {
        super(value, options);
        if (this !== value) this._provideOnSetOldValue = options.provideOnSetOldValue ?? false;
    }

    // #region 事件绑定

    /**
     * 当改变变量值的时候触发
     */
    on(event: 'set', callback: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => void): void;
    /**
     * 在变量值发生改变之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受 ensureChange 的影响，只要用户设置变量值就会被触发
     */
    on(event: 'beforeSet', callback: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => readonly T[]): void;
    /**
     * 当更新数组中某个元素的值时触发
     */
    on(event: 'update', callback: (newValue: T, oldValue: T, index: number, oArr: this) => void): void;
    /**
     * 在更新数组中某个元素的值之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受 ensureChange 的影响，只要用户设置变量值就会被触发
     */
    on(event: 'beforeUpdate', callback: (newValue: T, oldValue: T, index: number, oArr: this) => T): void;
    /**
     * 当向数组中添加元素时触发
     */
    on(event: 'add', callback: (value: T, index: number, oArr: this) => void): void;
    /**
     * 当删除数组中元素时触发。注意，index 指向的是元素被删除之前在数组中的位置
     */
    on(event: 'delete', callback: (value: T, index: number, oArr: this) => void): void;
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

    once(event: 'set', callback: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => void): void;
    once(event: 'beforeSet', callback: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => readonly T[]): void;
    once(event: 'update', callback: (newValue: T, oldValue: T, index: number, oArr: this) => void): void;
    once(event: 'beforeUpdate', callback: (newValue: T, oldValue: T, index: number, oArr: this) => T): void;
    once(event: 'add', callback: (value: T, index: number, oArr: this) => void): void;
    once(event: 'delete', callback: (value: T, index: number, oArr: this) => void): void;
    once(event: any, callback: any): void {
        super.once(event, callback);
    }

    off(event: 'set', callback?: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => void): void;
    off(event: 'beforeSet', callback?: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => readonly T[]): void;
    off(event: 'update', callback?: (newValue: T, oldValue: T, index: number, oArr: this) => void): void;
    off(event: 'beforeUpdate', callback?: (newValue: T, oldValue: T, index: number, oArr: this) => T): void;
    off(event: 'add', callback?: (value: T, index: number, oArr: this) => void): void;
    off(event: 'delete', callback?: (value: T, index: number, oArr: this) => void): void;
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

    // #endregion

    // #region 数组修改操作方法

    /**
     * 为数组添加或更新一个元素，添加成功将触发 add 事件，更新将触发 beforeUpdate 和 update 事件
     */
    set(index: number, value: T): this {
        if (index in this._value) {
            const oldValue = this._value[index];
            if (this._onBeforeUpdate) value = this._onBeforeUpdate(value, oldValue, index, this);
            if (this._ensureChange && (this._deepCompare ? isDeepEqual(value, oldValue) : value === oldValue)) return this;

            (this._value as T[])[index] = value;
            for (const callback of this._onUpdate) callback(value, oldValue, index, this);
        } else {
            (this._value as T[])[index] = value;
            for (const callback of this._onAdd) callback(value, index, this);
        }

        return this;
    }

    /**
     * 删除数组中第一个与之匹配的元素，返回一个布尔值表示删除是否成功，删除成功将会使得数组长度 -1 同时触发 delete 事件
     */
    delete(value: T): boolean {
        const index = this._value.indexOf(value);

        if (index !== -1) {
            (this._value as T[]).splice(index, 1);
            for (const callback of this._onDelete) callback(value, index, this);
            return true;
        } else
            return false;
    }

    /**
     * 删除数组中所有与之匹配的元素，返回被删除元素的个数，删除成功将触发 delete 事件
     */
    deleteAll(value: T): number {
        let amount = 0;
        while (this.delete(value)) amount++;
        return amount;
    }

    /**
     * 从数组中删除最后一个元素，并返回该元素的值，删除成功将触发 delete 事件
     */
    pop(): T | undefined {
        if (this._value.length > 0) {
            const value = (this._value as T[]).pop()!;
            for (const callback of this._onDelete) callback(value, this._value.length, this);
            return value;
        }
    }

    /**
     * 将一个或多个元素添加到数组的末尾，并返回新数组的长度，添加成功将触发 add 事件
     */
    push(...items: T[]): number {
        if (this._onAdd.size > 0) {
            for (const item of items) {
                (this._value as T[]).push(item);
                for (const callback of this._onAdd) callback(item, this._value.length - 1, this);
            }
            return this._value.length;
        } else
            return (this._value as T[]).push(...items);
    }

    /**
     * 删除数组中第一个元素，并返回该元素的值，删除成功将触发 delete 事件
     */
    shift(): T | undefined {
        if (this._value.length > 0) {
            const value = (this._value as T[]).shift()!;
            for (const callback of this._onDelete) callback(value, 0, this);
            return value;
        }
    }

    /**
     * 将一个或多个元素添加到数组的开头，并返回新数组的长度，添加成功将触发 add 事件
     */
    unshift(...items: T[]): number {
        if (this._onAdd.size > 0) {
            for (let index = 0; index < items.length; index++) {
                (this._value as T[]).splice(index, 0, items[index]);
                for (const callback of this._onAdd) callback(items[index], 0, this);
            }
            return this._value.length;
        } else
            return (this._value as T[]).unshift(...items);
    }

    /**
     * 从指定位置开始删除数组中剩下的元素，结果返回被删除的元素，删除成功将触发 delete 事件
     * @param start 从哪开始删除元素
     */
    splice(start: number): T[];
    /**
     * 改变数组的内容，通过删除或添加元素，结果返回被删除的元素，删除成功将触发 delete 事件，添加成功将触发 add 事件，先触发 delete 事件后触发 add 事件
     * @param start 从哪开始删除元素
     * @param deleteCount 删除多少个元素
     * @param items 要插入的元素
     */
    splice(start: number, deleteCount: number, ...items: T[]): T[];
    splice(start: number, deleteCount?: number, ...items: T[]): T[] {
        if (this._onAdd.size > 0 || this._onDelete.size > 0) {
            // 被删除的元素
            let deletedElements: T[] = [];

            // 校正开始位置
            start = Math.trunc(start);
            start = start < 0 ? Math.max(this._value.length + start, 0) : Math.min(start, this._value.length);

            if (this._onDelete.size > 0) {
                deleteCount = deleteCount === undefined ? this._value.length - start :
                    deleteCount < 0 ? 0 : Math.min(Math.trunc(deleteCount), this._value.length - start);

                for (let i = deleteCount - 1; i >= 0; i--) {
                    const index = start + i;

                    if (index in this._value) { // 确保要删除的元素不是空位
                        const value = (this._value as T[]).splice(index, 1)[0];
                        for (const callback of this._onDelete) callback(value, index, this);
                        deletedElements.push(value);
                    } else {
                        (this._value as T[]).splice(index, 1);
                        deletedElements.length++;
                    }
                }

                deletedElements.reverse(); // 没有使用 unshift 是出于性能的考虑
            } else
                deletedElements = (this._value as T[]).splice(start, deleteCount);

            if (this._onAdd.size > 0) {
                for (let i = 0; i < items.length; i++) {
                    const index = start + i;
                    (this._value as T[]).splice(index, 0, items[i]);
                    for (const callback of this._onAdd) callback(items[i], index, this);
                }
            } else
                (this._value as T[]).splice(start, 0, ...items);

            return deletedElements;
        } else
            return (this._value as T[]).splice(start, deleteCount!, ...items);
    }

    /**
     * 排序数组，排序完成之后将触发 set 事件，不会触发 beforeSet 事件
     * 注意：出于性能考虑，set 事件的 oldValue 与 newValue 相同，如果需要提供 oldValue，则需将 provideOnSetOldValue 设置为 true
     */
    sort(compare?: (a: T, b: T) => number): this {
        if (this._onSet.size > 0) {
            const oldValue = this._provideOnSetOldValue ? this._value.slice() : this._value;
            (this._value as T[]).sort(compare);
            for (const callback of this._onSet) callback(this._value, oldValue, this);
        } else
            (this._value as T[]).sort(compare);

        return this;
    }

    /**
     * 反转数组中元素顺序，反转完成之后将触发 set 事件，不会触发 beforeSet 事件
     * 注意：出于性能考虑，set 事件的 oldValue 与 newValue 相同，如果需要提供 oldValue，则需将 provideOnSetOldValue 设置为 true
     */
    reverse(): this {
        if (this._onSet.size > 0) {
            const oldValue = this._provideOnSetOldValue ? this._value.slice() : this._value;
            (this._value as T[]).reverse();
            for (const callback of this._onSet) callback(this._value, oldValue, this);
        } else
            (this._value as T[]).reverse();

        return this;
    }

    /**
     * 将数组中指定部分填充为指定值。如果填充位有值则触发 update 事件，但不会触发 beforeUpdate 事件，如果填充位没有值则触发 add 事件
     * @param value 要填充的值
     * @param start 开始位置
     * @param end 结束位置
     */
    fill(value: T, start?: number, end?: number): this {
        if (this._onAdd.size > 0 || this._onUpdate.size > 0) {
            start = start === undefined ? 0 : Math.trunc(start);
            end = end === undefined ? this._value.length : Math.trunc(end);
            start = start < 0 ? Math.max(0, this._value.length + start) : Math.min(this._value.length, start);
            end = end < 0 ? Math.max(0, this._value.length + end) : Math.min(this._value.length, end);

            for (; start < end; start++) {
                if (start in this._value) {
                    if (this._onUpdate.size > 0) {
                        const oldValue = this._value[start];
                        (this._value as T[])[start] = value;
                        if (this._ensureChange && (this._deepCompare ? isDeepEqual(value, oldValue) : value === oldValue)) continue;
                        for (const callback of this._onUpdate) callback(value, oldValue, start, this);
                    } else
                        (this._value as T[])[start] = value;
                } else {
                    (this._value as T[])[start] = value;
                    for (const callback of this._onAdd) callback(value, start, this);
                }
            }
        } else
            (this._value as T[]).fill(value, start, end);

        return this;
    }

    /**
     * 浅复制数组的一部分到同一数组中的另一个位置。根据粘贴内容和位置会触发以下几种事件  
     *      1. 粘贴一个值到一个已经有值的位置则触发 update 事件，但不会触发 beforeUpdate 事件
     *      2. 粘贴一个空位到一个已经有值的位置则触发 delete 事件
     *      3. 粘贴一个值到一个空位则触发 add 事件
     */
    copyWithin(target: number, start: number, end?: number): this {
        if (this._onAdd.size > 0 || this._onUpdate.size > 0 || this._onDelete.size > 0) {
            target = Math.trunc(target);
            start = Math.trunc(start);
            end = end === undefined ? this._value.length : Math.trunc(end);
            target = target < 0 ? Math.max(0, this._value.length + target) : Math.min(this._value.length, target);
            start = start < 0 ? Math.max(0, this._value.length + start) : Math.min(this._value.length, start);
            end = end < 0 ? Math.max(0, this._value.length + end) : Math.min(this._value.length, end);

            const replace = this._value.slice(start, end);

            for (let index = 0; target < this._value.length && index < replace.length; index++, target++) {
                if (index in replace) { // 复制的不是空位
                    if (target in this._value) { // 插入的位置不是空位
                        const oldValue = this._value[target];
                        const newValue = (this._value as T[])[target] = replace[index];
                        if (this._ensureChange && (this._deepCompare ? isDeepEqual(newValue, oldValue) : newValue === oldValue)) continue;
                        for (const callback of this._onUpdate) callback(newValue, oldValue, target, this);
                    } else {
                        const newValue = (this._value as T[])[target] = replace[index];
                        for (const callback of this._onAdd) callback(newValue, target, this);
                    }
                } else if (target in this._value) {
                    const oldValue = this._value[target];
                    delete (this._value as T[])[target];  // eslint-disable-line
                    for (const callback of this._onDelete) callback(oldValue, target, this);
                }
            }
        } else
            (this._value as T[]).copyWithin(target, start, end);

        return this;
    }

    // #endregion

    // #region 数组读取操作方法

    /**
     * 读取数组某个位置上的值
     */
    get(index: number): T | undefined {
        return this._value[index];
    }

    /**
     * 判读数组某个位置上是否有值。注意这个判断的是是不是空位而不是 null 或 undefined
     */
    has(index: number): boolean {
        return index in this._value;
    }

    /**
     * 用于合并两个或多个数组，此方法不会更改现有数组，而是返回一个新数组
     */
    concat(...items: (T | ConcatArray<T>)[]): T[] {
        return this._value.concat(...items);
    }

    /**
     * 返回一个 Iterator 对象，该对象包含数组中每个元素的键值对
     */
    entries(): IterableIterator<[number, T]> {
        return this._value.entries();
    }

    /**
     * 测试数组的所有元素是否都通过了指定函数的测试
     */
    every<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): boolean {
        return this._value.every(predicate, thisArg);  // eslint-disable-line
    }

    /**
     * 创建一个新数组, 其包含通过所提供函数实现的测试的所有元素
     */
    filter<H>(callback: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): T[] {
        return this._value.filter(callback, thisArg); // eslint-disable-line
    }

    /**
     * 返回数组中满足提供的测试函数的第一个元素的值，否则返回 undefined
     */
    find<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): T | undefined {
        return this._value.find(predicate, thisArg); // eslint-disable-line
    }

    /**
     * 返回数组中满足提供的测试函数的第一个元素的索引，否则返回 -1
     */
    findIndex<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): number {
        return this._value.findIndex(predicate, thisArg);
    }

    /**
     * 扁平化数组，返回一个新的数组来保存扁平化后的结果
     * @param depth 要扁平化的深度，默认1
     */
    flat<D extends number = 1>(depth?: D): FlatArray<readonly T[], D>[] {
        return this._value.flat(depth);
    }

    /**
     * 类似于 map 方法，只不过对于 map 方法返回的结果执行了一次 flat 方法（效果相当于多返回值 map 方法）
     */
    flatMap<U, H>(callback: (this: H, value: T, index: number, array: T[]) => U | U[], thisArg?: H): U[] {
        return this._value.flatMap(callback, thisArg);
    }

    /**
     * 对数组的每个元素执行一次提供的函数
     */
    forEach<H>(callback: (this: H, value: T, index: number, array: readonly T[]) => void, thisArg?: H): void {
        this._value.forEach(callback, thisArg);
    }

    /**
     * 用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 true，否则返回 false
     */
    includes(searchElement: T, fromIndex?: number): boolean {
        return this._value.includes(searchElement, fromIndex);
    }

    /**
     * 返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回 -1
     */
    indexOf(searchElement: T, fromIndex?: number): number {
        return this._value.indexOf(searchElement, fromIndex);
    }

    /**
     * 返回指定元素（也即有效的 JavaScript 值或变量）在数组中的最后一个的索引，如果不存在则返回 -1。从数组的后面向前查找，从 fromIndex 处开始
     */
    lastIndexOf(searchElement: T, fromIndex?: number): number {
        return this._value.lastIndexOf(searchElement, fromIndex);
    }

    /**
     * 方法将一个数组（或一个类数组对象）的所有元素连接成一个字符串并返回这个字符串
     */
    join(separator?: string): string {
        return this._value.join(separator);
    }

    /**
     * 返回一个新的Array迭代器，它包含数组中每个索引的键
     */
    keys(): IterableIterator<number> {
        return this._value.keys();
    }

    /**
     * 创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果
     */
    map<U, H>(callback: (this: H, value: T, index: number, array: readonly T[]) => U, thisArg?: H): U[] {
        return this._value.map(callback, thisArg);
    }

    /**
     * 对累加器和数组中的每个元素（从左到右）应用一个函数，将其减少为单个值
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U
    reduce(callbackfn: any, initialValue?: any): any {
        return this._value.reduce(callbackfn, initialValue);
    }

    /**
     * 接受一个函数作为累加器（accumulator）和数组的每个值（从右到左）将其减少为单个值
     */
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U
    reduceRight(callbackfn: any, initialValue?: any): any {
        return this._value.reduceRight(callbackfn, initialValue);
    }

    /**
     * 返回一个从开始到结束（不包括结束）选择的数组的一部分浅拷贝到一个新数组对象。且原始数组不会被修改
     */
    slice(start?: number, end?: number): T[] {
        return this._value.slice(start, end);
    }

    /**
     * 测试数组中的某些元素是否通过由提供的函数实现的测试
     */
    some<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): boolean {
        return this._value.some(predicate, thisArg);  // eslint-disable-line
    }

    /**
     * 返回一个字符串表示数组中的元素。数组中的元素将使用各自的 toLocaleString 方法转成字符串，这些字符串将使用一个特定语言环境的字符串（例如一个逗号 ","）隔开
     */
    toLocaleString(): string {
        return this._value.toLocaleString();
    }

    /**
     * 返回一个字符串，表示指定的数组及其元素。
     */
    toString(): string {
        return this._value.toString();
    }

    /**
     * 返回一个 Iterator 对象，该对象包含数组每个索引的值
     */
    values(): IterableIterator<T> {
        return this._value.values();
    }

    /**
     * 返回一个 Iterator 对象，该对象包含数组每个索引的值
     */
    [Symbol.iterator](): IterableIterator<T> {
        return this._value[Symbol.iterator]();
    }

    // #endregion
}

export function oArr<T>(value?: ObservableArray<T> | T[], options?: ObservableArrayOptions): ObservableArray<T> {
    return new ObservableArray(value, options);
}