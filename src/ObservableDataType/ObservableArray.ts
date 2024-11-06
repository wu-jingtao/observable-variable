import isDeepEqual from 'lodash.isequal';
import { ObservableVariable, type ObservableVariableOptions } from './ObservableVariable';

/**
 * JS 数组的最大长度
 */
const JS_ARRAY_MAX_LENGTH = 2 ** 32 - 1;

/**
 * 可观察 数组
 */
export class ObservableArray<T> extends ObservableVariable<readonly T[]> {
    protected readonly _onAdd: Set<(value: T, index: number, oArr: this) => void> = new Set();
    protected readonly _onDelete: Set<(value: T, index: number, oArr: this) => void> = new Set();
    protected readonly _onUpdate: Set<(newValue: T, oldValue: T, index: number, oArr: this) => void> = new Set();
    protected _onBeforeUpdate?: ((newValue: T, oldValue: T, index: number, oArr: this) => T) | undefined;

    /**
     * 数组的长度
     */
    get length(): number {
        return this._value.length;
    }

    set length(v: number) {
        if (v > JS_ARRAY_MAX_LENGTH || v < 0 || !Number.isInteger(v)) {
            throw new RangeError('Invalid array length');
        }

        if (v < this._value.length) {
            const number = this._value.length - v;
            this.splice(this._value.length - number, number);
        } else {
            /**
             * this.push(...new Array(v - this._value.length));
             *
             * 当 v > this._value.length 时没有用这种是因为：
             * 1. JS 原生使用 empty 来填充空位，而我这样做用的是 undefined 来填充
             * 2. 通过 length 来拉长数组严格上来说并不算是向数组中添加元素（与在超过数组长度的位置上设置值类似），所以不需要触发 onAdd 事件
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

    constructor(value: Iterable<T> = [], options: ObservableVariableOptions = {}) {
        if (value instanceof ObservableVariable) { return value as any } // eslint-disable-line no-constructor-return -- 确保变量不会被重复包装
        super(value as readonly T[], options);
        if (!Array.isArray(value)) { this._value = Array.from(value) }
    }

    // #region 事件绑定

    /**
     * 当变量值发生改变时触发
     */
    override on(event: 'set', callback: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => void): void;
    /**
     * 在变量值发生改变之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受 ensureChange 的影响，只要用户设置值就会被触发
     */
    override on(event: 'beforeSet', callback: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => readonly T[]): void;
    /**
     * 当更新数组中某个元素的值时触发
     */
    override on(event: 'update', callback: (newValue: T, oldValue: T, index: number, oArr: this) => void): void;
    /**
     * 在数组中某个元素的值发生改变之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受 ensureChange 的影响，只要用户设置变量值就会被触发
     */
    override on(event: 'beforeUpdate', callback: (newValue: T, oldValue: T, index: number, oArr: this) => T): void;
    /**
     * 当向数组中添加元素时触发
     */
    override on(event: 'add', callback: (value: T, index: number, oArr: this) => void): void;
    /**
     * 当删除数组中元素时触发。注意，index 指向的是元素被删除之前在数组中的位置
     */
    override on(event: 'delete', callback: (value: T, index: number, oArr: this) => void): void;
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

    override once(event: 'set', callback: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => void): void;
    override once(event: 'beforeSet', callback: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => readonly T[]): void;
    override once(event: 'update', callback: (newValue: T, oldValue: T, index: number, oArr: this) => void): void;
    override once(event: 'beforeUpdate', callback: (newValue: T, oldValue: T, index: number, oArr: this) => T): void;
    override once(event: 'add', callback: (value: T, index: number, oArr: this) => void): void;
    override once(event: 'delete', callback: (value: T, index: number, oArr: this) => void): void;
    override once(event: any, callback: any): void {
        super.once(event, callback);
    }

    override off(event: 'set', callback?: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => void): void;
    override off(event: 'beforeSet', callback?: (newValue: readonly T[], oldValue: readonly T[], oArr: this) => readonly T[]): void;
    override off(event: 'update', callback?: (newValue: T, oldValue: T, index: number, oArr: this) => void): void;
    override off(event: 'beforeUpdate', callback?: (newValue: T, oldValue: T, index: number, oArr: this) => T): void;
    override off(event: 'add', callback?: (value: T, index: number, oArr: this) => void): void;
    override off(event: 'delete', callback?: (value: T, index: number, oArr: this) => void): void;
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

    // #region 数组修改操作方法

    /**
     * 为数组添加或更新一个元素，添加成功将触发 add 事件，更新成功将触发 beforeUpdate 和 update 事件
     * @param index 数组索引(支持反向索引)
     * @param value 要设置的值
     * @returns 设置成功返回 true，设置失败返回 false
     */
    set(index: number, value: T): boolean {
        if (index < 0) { index = this._value.length + index }
        if (index < 0) { return false }

        if (index in this._value) {
            const oldValue = this._value[index]!;
            if (this._onBeforeUpdate) { value = this._onBeforeUpdate(value, oldValue, index, this) }
            if (this._ensureChange && (this._deepCompare ? isDeepEqual(value, oldValue) : value === oldValue)) { return false }

            (this._value as T[])[index] = value;
            for (const callback of this._onUpdate) { callback(value, oldValue, index, this) }
        } else {
            (this._value as T[])[index] = value;
            for (const callback of this._onAdd) { callback(value, index, this) }
        }

        return true;
    }

    /**
     * 删除数组中第一个与之匹配的元素，删除成功将会使得数组长度 -1 同时触发 delete 事件
     * @param value 要被删除的值
     * @returns 返回一个布尔值表示删除是否成功
     */
    delete(value: T): boolean {
        const index = this._value.indexOf(value);

        if (index !== -1) {
            (this._value as T[]).splice(index, 1);
            for (const callback of this._onDelete) { callback(value, index, this) }
            return true;
        } else {
            return false;
        }
    }

    /**
     * 删除数组中所有与之匹配的元素，删除成功将触发 delete 事件
     * @param value 要被删除的值
     * @returns 返回被删除元素的个数
     */
    deleteAll(value: T): number {
        let amount = 0;
        while (this.delete(value)) { amount++ }
        return amount;
    }

    /**
     * 从数组中删除最后一个元素，并返回该元素的值，删除成功将触发 delete 事件
     */
    pop(): T | undefined {
        if (this._value.length - 1 in this._value) {
            const value = (this._value as T[]).pop()!;
            for (const callback of this._onDelete) { callback(value, this._value.length, this) }
            return value;
        } else {
            return (this._value as T[]).pop();
        }
    }

    /**
     * 将一个或多个元素添加到数组的末尾，添加成功将触发 add 事件
     * @param items 要添加的元素
     * @returns 返回新数组的长度
     */
    push(...items: readonly T[]): number {
        if (this._onAdd.size > 0) {
            for (const item of items) {
                (this._value as T[]).push(item);
                for (const callback of this._onAdd) { callback(item, this._value.length - 1, this) }
            }
            return this._value.length;
        } else {
            return (this._value as T[]).push(...items);
        }
    }

    /**
     * 删除数组中第一个元素，并返回该元素的值，删除成功将触发 delete 事件
     */
    shift(): T | undefined {
        if (0 in this._value) {
            const value = (this._value as T[]).shift()!;
            for (const callback of this._onDelete) { callback(value, 0, this) }
            return value;
        } else {
            return (this._value as T[]).shift();
        }
    }

    /**
     * 将一个或多个元素添加到数组的开头，添加成功将触发 add 事件
     * @param items 要添加的元素
     * @returns 返回新数组的长度
     */
    unshift(...items: readonly T[]): number {
        if (this._onAdd.size > 0) {
            for (let index = 0; index < items.length; index++) {
                (this._value as T[]).splice(index, 0, items[index]!);
                for (const callback of this._onAdd) { callback(items[index]!, index, this) }
            }
            return this._value.length;
        } else {
            return (this._value as T[]).unshift(...items);
        }
    }

    /**
     * 从指定位置开始删除数组中剩下的元素。删除成功将触发 delete 事件
     * @param start 从哪开始删除元素
     * @returns 返回被删除的元素
     */
    splice(start: number): T[];
    /**
     * 通过删除或添加元素，改变数组内容。被删除的将触发 delete 事件，可以替换的将触发 update 事件，新添加的将触发 add 事件
     * @param start 从哪开始删除元素
     * @param deleteCount 删除多少个元素
     * @param items 要插入的元素
     * @returns 返回被删除的元素
     */
    splice(start: number, deleteCount: number, ...items: readonly T[]): T[];
    splice(start: number, deleteCount?: number, ...items: readonly T[]): T[] {
        if (this._onAdd.size > 0 || this._onUpdate.size > 0 || this._onBeforeUpdate || this._onDelete.size > 0) {
            // 被删除的元素
            const deletedElements: T[] = [];

            // 校正开始位置
            start = Math.trunc(start);
            start = start < 0 ? Math.max(this._value.length + start, 0) : Math.min(start, this._value.length);

            // 计算删除数量
            deleteCount = deleteCount === undefined
                ? this._value.length - start
                : deleteCount < 0 ? 0 : Math.min(Math.trunc(deleteCount), this._value.length - start);

            for (let i = 0, j = Math.max(deleteCount, items.length); i < j; i++) {
                let index = start + i;

                if (i < deleteCount && i < items.length) { // 更新元素
                    if (index in this._value) { // 确保不是空位
                        const oldValue = this._value[index]!;
                        let newValue = items[i] as T;
                        deletedElements.push(oldValue);

                        if (this._onBeforeUpdate) { newValue = this._onBeforeUpdate(newValue, oldValue, index, this) }
                        if (this._ensureChange && (this._deepCompare ? isDeepEqual(newValue, oldValue) : newValue === oldValue)) { continue }

                        (this._value as T[])[index] = newValue;
                        for (const callback of this._onUpdate) { callback(newValue, oldValue, index, this) }
                    } else {
                        deletedElements.length++;
                        (this._value as T[])[index] = items[i]!;
                        for (const callback of this._onAdd) { callback(items[i]!, index, this) }
                    }
                } else if (i < deleteCount) { // 删除元素
                    index = start + items.length;

                    if (index in this._value) { // 确保不是空位
                        const value = (this._value as T[]).splice(index, 1)[0]!;
                        for (const callback of this._onDelete) { callback(value, index, this) }
                        deletedElements.push(value);
                    } else {
                        (this._value as T[]).splice(index, 1);
                        deletedElements.length++;
                    }
                } else { // 添加元素
                    (this._value as T[]).splice(index, 0, items[i]!);
                    for (const callback of this._onAdd) { callback(items[i]!, index, this) }
                }
            }

            return deletedElements;
        } else {
            return (this._value as T[]).splice(start, deleteCount!, ...items);
        }
    }

    /**
     * 排序数组，排序完成之后将触发 set 和 beforeSet 事件
     * @param compare 大小比较方法
     */
    sort(compare?: (a: T, b: T) => number): this {
        if (this._onSet.size > 0 || this._onBeforeSet) {
            this.value = this._value.toSorted(compare);
        } else {
            (this._value as T[]).sort(compare);
        }

        return this;
    }

    /**
     * 反转数组中元素顺序，反转完成之后将触发 set 和 beforeSet 事件
     */
    reverse(): this {
        if (this._onSet.size > 0 || this._onBeforeSet) {
            this.value = this._value.toReversed();
        } else {
            (this._value as T[]).reverse();
        }

        return this;
    }

    /**
     * 将数组中指定部分填充为指定值。如果填充位有值则触发 update 和 beforeUpdate 事件，如果填充位没有值则触发 add 事件
     * @param value 要填充的值
     * @param start 开始位置
     * @param end 结束位置
     */
    fill(value: T, start?: number, end?: number): this {
        if (this._onAdd.size > 0 || this._onUpdate.size > 0 || this._onBeforeUpdate) {
            start = start === undefined ? 0 : Math.trunc(start);
            end = end === undefined ? this._value.length : Math.trunc(end);
            start = start < 0 ? Math.max(0, this._value.length + start) : Math.min(this._value.length, start);
            end = end < 0 ? Math.max(0, this._value.length + end) : Math.min(this._value.length, end);

            for (; start < end; start++) {
                if (start in this._value) {
                    const oldValue = this._value[start]!;
                    let newValue = value;
                    if (this._onBeforeUpdate) { newValue = this._onBeforeUpdate(newValue, oldValue, start, this) }
                    if (this._ensureChange && (this._deepCompare ? isDeepEqual(newValue, oldValue) : newValue === oldValue)) { continue }

                    (this._value as T[])[start] = newValue;
                    for (const callback of this._onUpdate) { callback(newValue, oldValue, start, this) }
                } else {
                    (this._value as T[])[start] = value;
                    for (const callback of this._onAdd) { callback(value, start, this) }
                }
            }
        } else {
            (this._value as T[]).fill(value, start, end);
        }

        return this;
    }

    /**
     * 浅复制数组的一部分到同一数组中的另一个位置。根据粘贴内容和位置会触发以下几种事件
     * 1. 粘贴一个值到一个已经有值的位置则触发 update 和 beforeUpdate 事件
     * 2. 粘贴一个空位到一个已经有值的位置则触发 delete 事件
     * 3. 粘贴一个值到一个空位则触发 add 事件
     * @param target 插入目标位置
     * @param start 复制起始位置
     * @param end 复制结束位置
     */
    copyWithin(target: number, start: number, end?: number): this {
        if (this._onAdd.size > 0 || this._onUpdate.size > 0 || this._onBeforeUpdate || this._onDelete.size > 0) {
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
                        const oldValue = this._value[target]!;
                        let newValue = replace[index] as T;
                        if (this._onBeforeUpdate) { newValue = this._onBeforeUpdate(newValue, oldValue, target, this) }
                        if (this._ensureChange && (this._deepCompare ? isDeepEqual(newValue, oldValue) : newValue === oldValue)) { continue }

                        (this._value as T[])[target] = newValue;
                        for (const callback of this._onUpdate) { callback(newValue, oldValue, target, this) }
                    } else {
                        const newValue = (this._value as T[])[target] = replace[index]!;
                        for (const callback of this._onAdd) { callback(newValue, target, this) }
                    }
                } else if (target in this._value) {
                    const oldValue = this._value[target]!;
                    delete (this._value as T[])[target];  // eslint-disable-line
                    for (const callback of this._onDelete) { callback(oldValue, target, this) }
                }
            }
        } else {
            (this._value as T[]).copyWithin(target, start, end);
        }

        return this;
    }

    // #endregion

    // #region 数组读取操作方法

    /**
     * 读取数组某个位置上的值
     * @param index 位置索引(支持反向索引)
     */
    at(index: number): T | undefined {
        return this._value.at(index);
    }

    /**
     * at 的别名
     * @param index 位置索引(支持反向索引)
     */
    get(index: number): T | undefined {
        return this._value.at(index);
    }

    /**
     * 判断数组某个位置上是否有值，注意这个判断针对的是空位而不是 null 或 undefined
     * @param index 位置索引(支持反向索引)
     */
    has(index: number): boolean {
        if (index < 0) { index = this._value.length + index }
        return index in this._value;
    }

    /**
     * 用于合并两个或多个数组，此方法不会更改现有数组，而是返回一个新数组
     * @param items 要合并的数组
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
     * @param predicate 回调函数
     * @param thisArg 回调函数中的 this
     */
    every<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): boolean {
        return this._value.every(predicate, thisArg);
    }

    /**
     * 创建一个新数组, 其包含通过指定函数测试的所有元素
     * @param callback 回调函数
     * @param thisArg 回调函数中的 this
     */
    filter<H>(callback: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): T[] {
        return this._value.filter(callback, thisArg);
    }

    /**
     * 返回数组中满足指定函数测试的第一个元素，否则返回 undefined
     * @param predicate 回调函数
     * @param thisArg 回调函数中的 this
     */
    find<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): T | undefined {
        return this._value.find(predicate, thisArg);
    }

    /**
     * 返回数组中满足指定函数测试的最后一个元素，否则返回 undefined
     * @param predicate 回调函数
     * @param thisArg 回调函数中的 this
     */

    findLast<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): T | undefined {
        return this._value.findLast(predicate, thisArg);
    }

    /**
     * 返回数组中满足指定函数测试的第一个元素的索引，否则返回 -1
     * @param predicate 回调函数
     * @param thisArg 回调函数中的 this
     */
    findIndex<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): number {
        return this._value.findIndex(predicate, thisArg);
    }

    /**
     * 返回数组中满足指定函数测试的最后一个元素的索引，否则返回 -1
     * @param predicate 回调函数
     * @param thisArg 回调函数中的 this
     */
    findLastIndex<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): number {
        return this._value.findLastIndex(predicate, thisArg);
    }

    /**
     * 扁平化数组，返回一个新的数组来保存扁平化后的结果
     * @param depth 要扁平化的深度，默认1
     */
    flat<D extends number = 1>(depth?: D): FlatArray<readonly T[], D>[] {
        return this._value.flat(depth);
    }

    /**
     * 等同于 arr.map().flat(1)
     * @param callback 回调函数
     * @param thisArg 回调函数中的 this
     */
    flatMap<U, H>(callback: (this: H, value: T, index: number, array: T[]) => U | U[], thisArg?: H): U[] {
        return this._value.flatMap(callback, thisArg);
    }

    /**
     * 对数组的每个元素执行一次提供的函数
     * @param callback 回调函数
     * @param thisArg 回调函数中的 this
     */
    forEach<H>(callback: (this: H, value: T, index: number, array: readonly T[]) => void, thisArg?: H): void {
        this._value.forEach(callback, thisArg);
    }

    /**
     * 判断数组中是否包含一个指定的值
     * @param searchElement 要查找的元素
     * @param fromIndex 从什么位置开始查找
     * @returns 如果包含则返回 true，否则返回 false
     */
    includes(searchElement: T, fromIndex?: number): boolean {
        return this._value.includes(searchElement, fromIndex);
    }

    /**
     * 返回在数组中找到的第一个元素的索引，如果不存在，则返回 -1
     * @param searchElement 要查找的元素
     * @param fromIndex 从什么位置开始查找
     */
    indexOf(searchElement: T, fromIndex?: number): number {
        return this._value.indexOf(searchElement, fromIndex);
    }

    /**
     * 返回在数组中找到的最后一个元素的索引，如果不存在则返回 -1(从数组的后面向前查找，从 fromIndex 处开始)
     * @param searchElement 要查找的元素
     * @param fromIndex 从什么位置开始查找
     */
    lastIndexOf(searchElement: T, fromIndex?: number): number {
        return this._value.lastIndexOf(searchElement, fromIndex);
    }

    /**
     * 将一个数组（或一个类数组对象）的所有元素连接成一个字符串并返回这个字符串
     * @param separator 分隔符。默认逗号
     */
    join(separator?: string): string {
        return this._value.join(separator);
    }

    /**
     * 返回一个新的 Array 迭代器，它包含数组中每个索引的键
     */
    keys(): IterableIterator<number> {
        return this._value.keys();
    }

    /**
     * 创建一个新数组，其结果是数组中的每个元素在经过回调函数后的值
     * @param callback 回调函数
     * @param thisArg 回调函数中的 this
     */
    map<U, H>(callback: (this: H, value: T, index: number, array: readonly T[]) => U, thisArg?: H): U[] {
        return this._value.map(callback, thisArg);
    }

    /**
     * 对数组中的每个元素（从左到右）应用一个函数，将其减少为单个值
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: readonly T[]) => T): T;
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: readonly T[]) => T, initialValue: T): T;
    reduce(callbackfn: any, initialValue?: any): any {
        return this._value.reduce(callbackfn, initialValue);
    }

    /**
     * 对数组中的每个元素（从右到左）应用一个函数，将其减少为单个值
     */
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: readonly T[]) => T): T;
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: readonly T[]) => T, initialValue: T): T;
    reduceRight(callbackfn: any, initialValue?: any): any {
        return this._value.reduceRight(callbackfn, initialValue);
    }

    /**
     * 返回一个从 start 到 end 的数组浅拷贝(原始数组不会被修改)
     * @param start 开始位置。默认开头
     * @param end 结束位置。默认结尾
     */
    slice(start?: number, end?: number): T[] {
        return this._value.slice(start, end);
    }

    /**
     * 判断数组中是否有元素可以通过回调函数的测试
     * @param predicate 回调函数
     * @param thisArg 回调函数中的 this
     */
    some<H>(predicate: (this: H, value: T, index: number, array: readonly T[]) => unknown, thisArg?: H): boolean {
        return this._value.some(predicate, thisArg);
    }

    /**
     * 复制一个数组，然后覆盖掉指定位置的值，如果索引为负数，则从数组末尾替换
     * @param index 要覆盖的位置.
     * @param value 要覆盖的值
     */
    with(index: number, value: T): T[] {
        return this._value.with(index, value);
    }

    /**
     * 复制一个数组，并反转里面所有的元素
     */
    toReversed(): T[] {
        return this._value.toReversed();
    }

    /**
     * 复制一个数组，并排序里面所有的元素
     * @param compareFn 大小比较方法
     */
    toSorted(compareFn?: (a: T, b: T) => number): T[] {
        return this._value.toSorted(compareFn);
    }

    /**
     * 复制一个数组，从指定位置开始，删除指定数量的元素
     * @param start 从什么位置开始删除
     * @param deleteCount 要删除的元素数量。默认删除到结尾
     * @param items 要插入的元素
     */
    toSpliced(start: number, deleteCount?: number, ...items: T[]): T[] {
        return this._value.toSpliced(start, deleteCount!, ...items);
    }

    /**
     * 返回一个字符串表示数组中的元素。数组中的元素将使用各自的 toLocaleString 方法转成字符串，这些字符串将使用一个特定语言环境的字符串（例如一个逗号 ","）隔开
     */
    override toLocaleString(): string {
        return this._value.toLocaleString();
    }

    /**
     * 返回一个字符串，表示数组及其元素。
     */
    override toString(): string {
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

export function oArr<T>(value?: Iterable<T>, options?: ObservableVariableOptions): ObservableArray<T> {
    return new ObservableArray(value, options);
}
