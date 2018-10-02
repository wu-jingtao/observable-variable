import isDeepEqual = require('lodash.isequal');

import { ObservableVariable, ObservableVariableOptions } from "./ObservableVariable";

export interface ObservableArrayOptions extends ObservableVariableOptions {
    /**
     * 某些数组操作执行后会触发onSet事件，出于性能考虑，onSet事件的oldValue与newValue相同，如果需要提供oldValue，则可以设置为true。
     */
    provideOnSetOldValue?: boolean;
}

/**
 * 可观察改变数组
 */
export class ObservableArray<T> extends ObservableVariable<T[]> {

    //#region 静态方法

    /**
     * 数组的最大长度
     */
    static readonly ARRAY_MAX_LENGTH = 2 ** 32 - 1;

    /**
     * 将一个数组转换成可观察数组，相当于 new ObservableArray(value)
     */
    static observe<T>(value: ObservableArray<T> | T[], options?: ObservableArrayOptions): ObservableArray<T>;
    /**
     * 将对象中指定位置的一个数组转换成可观察数组，路径通过`.`分割
     */
    static observe(object: object, path: string, options?: ObservableArrayOptions): void;
    /**
     * 将对象中指定位置的一个数组转换成可观察数组
     */
    static observe(object: object, path: string[], options?: ObservableArrayOptions): void;
    static observe(value: any, arg1?: any, arg2?: any): any {
        if (undefined === arg1)
            return new ObservableArray(value);
        else if ('[object Object]' === Object.prototype.toString.call(arg1))
            return new ObservableArray(value, arg1);
        else if ('string' === typeof arg1)
            arg1 = arg1.split('.');

        for (let index = 0, end = arg1.length - 1; index < end; index++) {
            value = value[arg1[index]];
        }

        value[arg1[arg1.length - 1]] = new ObservableArray(value[arg1[arg1.length - 1]], arg2);
    }

    //#endregion

    //#region 属性

    protected _onAdd: Set<(value: T) => void> = new Set();
    protected _onRemove: Set<(value: T) => void> = new Set();
    protected _onUpdate: Set<(newValue: T, oldValue: T, index: number) => void> = new Set();
    protected _onBeforeUpdate: (index: number, newValue: T, oldValue: T, changeTo: (value: T) => void, oArr: ObservableArray<T>) => boolean | void;

    /**
     * 某些数组操作执行后会触发onSet事件，出于性能考虑，onSet事件的oldValue与newValue相同，如果需要提供oldValue，则可以设置为true。
     */
    provideOnSetOldValue: boolean;

    constructor(value: ObservableArray<T> | T[], options: ObservableArrayOptions = {}) {
        super(value, options);

        if (this !== value)
            if (options.provideOnSetOldValue)
                this.provideOnSetOldValue = true;
    }

    /**
     * 数组的长度
     */
    get length() {
        return this._value.length;
    }

    set length(v: number) {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (v > this._value.length && v < ObservableArray.ARRAY_MAX_LENGTH)
            this.push(...(new Array(v - this._value.length)));
        else if (v < this._value.length && v >= 0) {
            const number = this._value.length - v;
            this.splice(this._value.length - number, number);
        }
    }

    /**
     * 获取数组中第一个元素
     */
    get first() {
        return this._value[0];
    }

    /**
     * 获取数组中最后一个元素
     */
    get last() {
        return this._value[this._value.length - 1];
    }

    //#endregion

    //#region 事件绑定方法

    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: (newValue: T[], oldValue: T[]) => void): void;
    /**
     * 在值发生改变之前触发，返回false表示阻止更改，如果要更改newValue可以调用changeTo。
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调，同时设置的回调是以同步方式执行的。
     * 注意：如果要执行changeTo，则就不应再返回false了，否则将使得changeTo无效。
     */
    on(event: 'beforeSet', callback: (newValue: T[], oldValue: T[], changeTo: (value: T[]) => void, oArr: this) => boolean | void): void;
    /**
     * 当更新Array中某个元素的值时触发
     */
    on(event: 'update', callback: (newValue: T, oldValue: T, index: number) => void): void;
    /**
     * 在更新Array中某个元素的值之前触发，返回false表示阻止更改，如果要更改newValue可以调用changeTo。
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调，同时设置的回调是以同步方式执行的。
     * 注意：如果要执行changeTo，则就不应再返回false了，否则将使得changeTo无效。
     */
    on(event: 'beforeUpdate', callback: (index: number, newValue: T, oldValue: T, changeTo: (value: T) => void, oArr: this) => boolean | void): void;
    /**
     * 当向数组中添加元素时触发
     */
    on(event: 'add', callback: (value: T) => void): void;
    /**
     * 当删除数组中元素时触发
     */
    on(event: 'remove', callback: (value: T) => void): void;
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

    once(event: 'set', callback: (newValue: T[], oldValue: T[]) => void): void;
    once(event: 'beforeSet', callback: (newValue: T[], oldValue: T[], changeTo: (value: T[]) => void, oArr: this) => boolean | void): void;
    once(event: 'update', callback: (newValue: T, oldValue: T, index: number) => void): void;
    once(event: 'beforeUpdate', callback: (index: number, newValue: T, oldValue: T, changeTo: (value: T) => void, oArr: this) => boolean | void): void;
    once(event: 'add', callback: (value: T) => void): void;
    once(event: 'remove', callback: (value: T) => void): void;
    once(event: any, callback: any): any {
        super.once(event, callback);
    }

    off(event: 'set', callback?: (newValue: T[], oldValue: T[]) => void): void;
    off(event: 'beforeSet', callback?: (newValue: T[], oldValue: T[], changeTo: (value: T[]) => void, oArr: this) => boolean | void): void;
    off(event: 'update', callback?: (newValue: T, oldValue: T, index: number) => void): void;
    off(event: 'beforeUpdate', callback?: (index: number, newValue: T, oldValue: T, changeTo: (value: T) => void, oArr: this) => boolean | void): void;
    off(event: 'add', callback?: (value: T) => void): void;
    off(event: 'remove', callback?: (value: T) => void): void;
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

    //#region 数组修改操作方法

    /**
     * 改变数组指定位置上的值。注意：当index大于或等于数组长度时将触发onAdd事件，当小于数组长度时将触发onUpdate和onBeforeUpdate事件。
     */
    set(index: number, value: T): T {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (index >= this._value.length) {   //说明是添加新的元素
            this._value[index] = value;
            this._onAdd.forEach(callback => callback(value));
            return value;
        } else {
            const oldValue = this._value[index];

            if (this.ensureChange && (this.deepCompare ? isDeepEqual(value, oldValue) : value === oldValue)) return value;

            const inputValue = value;

            if (this._onBeforeUpdate !== undefined) {
                if (this._onBeforeUpdate(index, value, oldValue, v => { value = v }, this) === false)
                    return inputValue;
                else if (this.ensureChange && (this.deepCompare ? isDeepEqual(value, oldValue) : value === oldValue))
                    return inputValue;
            }

            this._value[index] = value;
            this._onUpdate.forEach(callback => callback(value, oldValue, index));

            return inputValue;
        }
    }

    /**
     * 删除数组中第一个与之匹配的元素
     * @param value 要被删除的值
     */
    delete(value: T): boolean {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        const index = this._value.indexOf(value);

        if (index !== -1) {
            this._value.splice(index, 1);

            if (this._onRemove.size > 0)
                this._onRemove.forEach(callback => callback(value));

            return true;
        } else
            return false;
    }

    /**
     * 删除数组中所有与之匹配的元素
     * @param value 要被删除的值
     */
    deleteAll(value: T): void {
        while (this.delete(value));
    }

    /**
     * 从数组中删除最后一个元素，并返回该元素的值。此方法更改数组的长度。
     */
    pop(): T | undefined {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onRemove.size > 0) {
            const originalLength = this._value.length;
            const result = this._value.pop();

            if (originalLength > this._value.length)
                this._onRemove.forEach(callback => callback(result as T));

            return result;
        } else
            return this._value.pop();
    }

    /**
     * 将一个或多个元素添加到数组的末尾，并返回新数组的长度。
     */
    push(...items: T[]): number {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onAdd.size > 0) {
            items.forEach(item => {
                this._value.push(item);
                this._onAdd.forEach(callback => callback(item));
            });

            return this._value.length;
        } else
            return this._value.push(...items);
    }

    /**
     * 从数组中删除第一个元素，并返回该元素的值。此方法更改数组的长度。
     */
    shift(): T | undefined {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onRemove.size > 0) {
            const originalLength = this._value.length;
            const result = this._value.shift();

            if (originalLength > this._value.length)
                this._onRemove.forEach(callback => callback(result as T));

            return result;
        } else
            return this._value.shift();
    }

    /**
     * 将一个或多个元素添加到数组的开头，并返回新数组的长度。
     */
    unshift(...items: T[]): number {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onAdd.size > 0) {
            items.forEach((item, index) => {
                this._value.splice(index, 0, item);
                this._onAdd.forEach(callback => callback(item));
            });

            return this._value.length;
        } else
            return this._value.unshift(...items);
    }

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
    splice(start: number, deleteCount?: number, ...items: T[]): T[] {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onAdd.size > 0 || this._onRemove.size > 0) {
            let deleteElements: T[] = [];  //被删除的元素

            start = Math.trunc(start);
            start = start < 0 ? Math.max(this._value.length + start, 0) : Math.min(start, this._value.length);

            if (this._onRemove.size > 0) {
                deleteCount = deleteCount === undefined ? this._value.length - start : deleteCount < 0 ? 0 : Math.min(Math.trunc(deleteCount), this._value.length - start);

                for (let index = deleteCount - 1; index >= 0; index--) {
                    const element = this._value.splice(start + index, 1)[0];
                    this._onRemove.forEach(callback => callback(element));
                    deleteElements.push(element);
                }

                //没有unshift是出于性能的考虑
                deleteElements.reverse();
            } else
                deleteElements = this._value.splice(start, deleteCount);

            if (this._onAdd.size > 0) {
                items.forEach((item, index) => {
                    this._value.splice(start + index, 0, item);
                    this._onAdd.forEach(callback => callback(item));
                });
            } else
                this._value.splice(start, 0, ...items);

            return deleteElements;
        } else
            return this._value.splice(start, deleteCount as number, ...items);
    }

    /**
     * 排序数组。注意，排序完成之后将触发onSet事件
     * @param compareFn 排序方法
     */
    sort(compareFn?: (a: T, b: T) => number): this {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onSet.size > 0) {
            const oldValue = this.provideOnSetOldValue ? this._value.slice() : this._value;
            this._value.sort(compareFn);
            this._onSet.forEach(callback => callback(this._value, oldValue));
        } else
            this._value.sort(compareFn);

        return this;
    }

    /**
     * 反转数组中元素顺序。注意，反转完成之后将触发onSet事件
     */
    reverse(): this {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onSet.size > 0) {
            const oldValue = this.provideOnSetOldValue ? this._value.slice() : this._value;
            this._value.reverse();
            this._onSet.forEach(callback => callback(this._value, oldValue));
        } else
            this._value.reverse();

        return this;
    }

    /**
     * 将数组中指定部分的值填充为指定值。注意，填充完成之后将触发onSet事件
     * @param value 要填充的值
     * @param start 开始位置
     * @param end 结束位置
     */
    fill(value: T, start?: number, end?: number): this {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onSet.size > 0) {
            const oldValue = this.provideOnSetOldValue ? this._value.slice() : this._value;
            this._value.fill(value, start, end);
            this._onSet.forEach(callback => callback(this._value, oldValue));
        } else
            this._value.fill(value, start, end);

        return this;
    }

    /**
     * 浅复制数组的一部分到同一数组中的另一个位置，并返回它，而不修改其大小。注意，完成之后将触发onSet事件
     */
    copyWithin(target: number, start: number, end?: number): this {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onSet.size > 0) {
            const oldValue = this.provideOnSetOldValue ? this._value.slice() : this._value;
            this._value.copyWithin(target, start, end);
            this._onSet.forEach(callback => callback(this._value, oldValue));
        } else
            this._value.copyWithin(target, start, end);

        return this;
    }

    //#endregion

    //#region 数组读取操作方法

    /**
     * 读取数组某个位置上的值
     */
    get(index: number): T {
        return this._value[index];
    }

    /**
     * 判读数组某个位置上的值不等于undefined
     */
    has(index: number): boolean {
        return this._value[index] !== undefined;
    }

    /**
     * 用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。
     */
    concat(...items: ConcatArray<T>[]) {
        return this._value.concat(...items);
    }

    /**
     * 返回一个新的Array Iterator对象，该对象包含数组中每个索引的键/值对。
     */
    entries() {
        return this._value.entries();
    }

    /**
     * 测试数组的所有元素是否都通过了指定函数的测试。
     */
    every(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean {
        return this._value.every(callbackfn, thisArg);
    }

    /**
     * 创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。 
     */
    filter<S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[]
    filter(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any): T[]
    filter(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any): T[] {
        return this._value.filter(callbackfn, thisArg);
    }

    /**
     * 返回数组中满足提供的测试函数的第一个元素的值。否则返回 undefined。
     */
    find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined
    find(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined
    find(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined {
        return this._value.find(predicate, thisArg);
    }

    /**
     * 返回数组中满足提供的测试函数的第一个元素的索引。否则返回-1。
     */
    findIndex(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): number {
        return this._value.findIndex(predicate);
    }

    /**
     * 对数组的每个元素执行一次提供的函数。
     */
    forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
        this._value.forEach(callbackfn);
    }

    /**
     * 用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 true，否则返回false。
     */
    includes(searchElement: T, fromIndex?: number): boolean {
        return this._value.includes(searchElement, fromIndex);
    }

    /**
     * 返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回-1。
     */
    indexOf(searchElement: T, fromIndex?: number): number {
        return this._value.indexOf(searchElement, fromIndex);
    }

    /**
     * 方法将一个数组（或一个类数组对象）的所有元素连接成一个字符串并返回这个字符串。
     */
    join(separator?: string): string {
        return this._value.join(separator);
    }

    /**
     * 返回一个新的Array迭代器，它包含数组中每个索引的键。
     */
    keys() {
        return this._value.keys();
    }

    /**
     * 返回指定元素（也即有效的 JavaScript 值或变量）在数组中的最后一个的索引，如果不存在则返回 -1。从数组的后面向前查找，从 fromIndex 处开始。
     */
    lastIndexOf(searchElement: T, fromIndex?: number): number {
        return this._value.lastIndexOf(searchElement, fromIndex);
    }

    /**
     * 创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。
     */
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
        return this._value.map(callbackfn);
    }

    /**
     * 对累加器和数组中的每个元素（从左到右）应用一个函数，将其减少为单个值。
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U
    reduce(callbackfn: any, initialValue?: any): any {
        return this._value.reduce(callbackfn, initialValue);
    }

    /**
     * 接受一个函数作为累加器（accumulator）和数组的每个值（从右到左）将其减少为单个值。
     */
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U
    reduceRight(callbackfn: any, initialValue?: any): any {
        return this._value.reduceRight(callbackfn, initialValue);
    }

    /**
     * 返回一个从开始到结束（不包括结束）选择的数组的一部分浅拷贝到一个新数组对象。且原始数组不会被修改。
     */
    slice(start?: number, end?: number): T[] {
        return this._value.slice(start, end);
    }

    /**
     * 测试数组中的某些元素是否通过由提供的函数实现的测试。
     */
    some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean {
        return this._value.some(callbackfn, thisArg);
    }

    /**
     * 返回一个字符串表示数组中的元素。数组中的元素将使用各自的 toLocaleString 方法转成字符串，这些字符串将使用一个特定语言环境的字符串（例如一个逗号 ","）隔开。
     */
    toLocaleString() {
        return this._value.toLocaleString();
    }

    /**
     * 返回一个字符串，表示指定的数组及其元素。
     */
    toString() {
        return this._value.toString();
    }

    /**
     * 返回一个新的 Array Iterator 对象，该对象包含数组每个索引的值
     */
    values() {
        return this._value.values();
    }

    //#endregion
}