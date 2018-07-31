import { ObservableVariable, OnSetCallback } from "./ObservableVariable";

/**
 * 可观察改变数组
 */
export class ObservableArray<T extends Array<K>, K> extends ObservableVariable<T> {

    //#region 静态方法

    /**
     * 将一个数组转换成可观察数组，相当于 new ObservableArray(value)
     */
    static observe<T extends Array<K>, K>(value: ObservableArray<T, K> | T): ObservableArray<T, K>;
    /**
     * 将对象中指定位置的一个数组转换成可观察数组，路径通过`.`分割
     */
    static observe(object: object, path: string): void;
    /**
     * 将对象中指定位置的一个数组转换成可观察数组
     */
    static observe(object: object, path: string[]): void;
    static observe(value: any, path?: any): any {
        if (path === undefined) {
            return new ObservableArray(value);
        } else if ('string' === typeof path) {
            path = path.split('.');
        }

        for (let index = 0, end = path.length - 1; index < end; index++) {
            value = value[path[index]];
        }

        value[path[path.length - 1]] = new ObservableArray(value[path[path.length - 1]]);
    }

    //#endregion

    //#region 属性

    protected _onAdd: Set<OnAddOrRemoveArrayElementCallback<K>> = new Set();
    protected _onRemove: Set<OnAddOrRemoveArrayElementCallback<K>> = new Set();

    //#endregion

    //#region 事件绑定方法

    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: OnSetCallback<T>): void;
    /**
     * 当向数组中添加元素时触发
     */
    on(event: 'add', callback: OnAddOrRemoveArrayElementCallback<K>): void;
    /**
     * 当删除数组中元素时触发
     */
    on(event: 'remove', callback: OnAddOrRemoveArrayElementCallback<K>): void;
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

    once(event: 'set', callback: OnSetCallback<T>): void;
    once(event: 'add', callback: OnAddOrRemoveArrayElementCallback<K>): void;
    once(event: 'remove', callback: OnAddOrRemoveArrayElementCallback<K>): void;
    once(event: any, callback: any): any {
        const tempCallback = (...args: any[]) => { this.off(event, tempCallback); callback(...args); };
        this.on(event, tempCallback);
    }

    off(event: 'set', callback?: OnSetCallback<T>): void;
    off(event: 'add', callback: OnAddOrRemoveArrayElementCallback<K>): void;
    off(event: 'remove', callback: OnAddOrRemoveArrayElementCallback<K>): void;
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

    //#region 数组修改操作方法

    /**
     * 从数组中删除最后一个元素，并返回该元素的值。此方法更改数组的长度。
     */
    pop(): K | undefined {
        if (this._onRemove.size > 0) {
            const originalLength = this._value.length;
            const result = this._value.pop();

            if (originalLength > this._value.length)
                this._onRemove.forEach(callback => callback(result as K));

            return result;
        } else
            return this._value.pop();
    }

    /**
     * 将一个或多个元素添加到数组的末尾，并返回新数组的长度。
     */
    push(...items: K[]): number {
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
    shift(): K | undefined {
        if (this._onRemove.size > 0) {
            const originalLength = this._value.length;
            const result = this._value.shift();

            if (originalLength > this._value.length)
                this._onRemove.forEach(callback => callback(result as K));

            return result;
        } else
            return this._value.shift();
    }

    /**
     * 将一个或多个元素添加到数组的开头，并返回新数组的长度。
     */
    unshift(...items: K[]): number {
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
    splice(start: number, deleteCount?: number): K[];
    /**
     * 改变数组的内容，通过移除或添加新元素
     * @param start 从哪开始删除元素
     * @param deleteCount 删除多少个元素
     * @param items 要插入的元素
     */
    splice(start: number, deleteCount: number, ...items: K[]): K[];
    splice(start: number, deleteCount?: number, ...items: K[]): K[] {
        if (this._onAdd.size > 0 || this._onRemove.size > 0) {
            let deleteElements: K[] = [];  //被删除的元素

            if (this._onRemove.size > 0) {
                for (let index = 0, end = deleteCount === undefined || start + deleteCount > this._value.length ? this._value.length - start : deleteCount; index < end; index++) {
                    const element = this._value.splice(start, 1)[0];
                    this._onRemove.forEach(callback => callback(element));
                    deleteElements.push(element);
                }
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
     * 删除数组中第一个与之匹配的元素
     * @param value 要被删除的值
     */
    delete(value: K): boolean {
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
    deleteAll(value: K): void {
        while (this.delete(value));
    }

    /**
     * 排序数组。注意，排序完成之后将触发onSet事件
     * @param compareFn 排序方法
     */
    sort(compareFn?: (a: K, b: K) => number): this {
        this._value.sort(compareFn);

        if (this._onSet.size > 0)
            this._onSet.forEach(callback => callback(this._value, this._value));

        return this;
    }

    /**
     * 反转数组中元素顺序。注意，反转完成之后将触发onSet事件
     */
    reverse(): this {
        this._value.reverse();

        if (this._onSet.size > 0)
            this._onSet.forEach(callback => callback(this._value, this._value));

        return this;
    }

    /**
     * 将数组中指定部分的值填充为指定值。注意，填充完成之后将触发onSet事件
     * @param value 要填充的值
     * @param start 开始位置
     * @param end 结束位置
     */
    fill(value: K, start?: number, end?: number): this {
        this._value.fill(value, start, end);

        if (this._onSet.size > 0)
            this._onSet.forEach(callback => callback(this._value, this._value));

        return this;
    }

    /**
     * 浅复制数组的一部分到同一数组中的另一个位置，并返回它，而不修改其大小。注意，完成之后将触发onSet事件
     */
    copyWithin(target: number, start: number, end?: number): this {
        this._value.copyWithin(target, start, end);

        if (this._onSet.size > 0)
            this._onSet.forEach(callback => callback(this._value, this._value));

        return this;
    }

    //#endregion

    //#region 数组读取操作方法

    /**
     * 用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。
     */
    concat(...items: ConcatArray<K>[]) {
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
    every(callbackfn: (value: K, index: number, array: K[]) => boolean, thisArg?: any): boolean {
        return this._value.every(callbackfn, thisArg);
    }

    /**
     * 创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。 
     */
    filter<S extends K>(callbackfn: (value: K, index: number, array: K[]) => value is S, thisArg?: any): S[]
    filter(callbackfn: (value: K, index: number, array: K[]) => any, thisArg?: any): K[]
    filter(callbackfn: (value: K, index: number, array: K[]) => any, thisArg?: any): K[] {
        return this._value.filter(callbackfn, thisArg);
    }

    /**
     * 返回数组中满足提供的测试函数的第一个元素的值。否则返回 undefined。
     */
    find<S extends K>(predicate: (this: void, value: K, index: number, obj: K[]) => value is S, thisArg?: any): S | undefined
    find(predicate: (value: K, index: number, obj: K[]) => boolean, thisArg?: any): K | undefined
    find(predicate: (value: K, index: number, obj: K[]) => boolean, thisArg?: any): K | undefined {
        return this._value.find(predicate, thisArg);
    }

    /**
     * 返回数组中满足提供的测试函数的第一个元素的索引。否则返回-1。
     */
    findIndex(predicate: (value: K, index: number, obj: K[]) => boolean, thisArg?: any): number {
        return this._value.findIndex(predicate);
    }

    /**
     * 对数组的每个元素执行一次提供的函数。
     */
    forEach(callbackfn: (value: K, index: number, array: K[]) => void, thisArg?: any): void {
        this._value.forEach(callbackfn);
    }

    /**
     * 用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 true，否则返回false。
     */
    includes(searchElement: K, fromIndex?: number): boolean {
        return this._value.includes(searchElement, fromIndex);
    }

    /**
     * 返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回-1。
     */
    indexOf(searchElement: K, fromIndex?: number): number {
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
    lastIndexOf(searchElement: K, fromIndex?: number): number {
        return this._value.lastIndexOf(searchElement, fromIndex);
    }

    /**
     * 创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。
     */
    map<U>(callbackfn: (value: K, index: number, array: K[]) => U, thisArg?: any): U[] {
        return this._value.map(callbackfn);
    }

    /**
     * 对累加器和数组中的每个元素（从左到右）应用一个函数，将其减少为单个值。
     */
    reduce(callbackfn: (previousValue: K, currentValue: K, currentIndex: number, array: K[]) => K): K
    reduce(callbackfn: (previousValue: K, currentValue: K, currentIndex: number, array: K[]) => K, initialValue: K): K
    reduce<U>(callbackfn: (previousValue: U, currentValue: K, currentIndex: number, array: K[]) => U, initialValue: U): U
    reduce(callbackfn: any, initialValue?: any): any {
        return this._value.reduce(callbackfn, initialValue);
    }

    /**
     * 接受一个函数作为累加器（accumulator）和数组的每个值（从右到左）将其减少为单个值。
     */
    reduceRight(callbackfn: (previousValue: K, currentValue: K, currentIndex: number, array: K[]) => K): K
    reduceRight(callbackfn: (previousValue: K, currentValue: K, currentIndex: number, array: K[]) => K, initialValue: K): K
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: K, currentIndex: number, array: K[]) => U, initialValue: U): U
    reduceRight(callbackfn: any, initialValue?: any): any {
        return this._value.reduceRight(callbackfn, initialValue);
    }

    /**
     * 返回一个从开始到结束（不包括结束）选择的数组的一部分浅拷贝到一个新数组对象。且原始数组不会被修改。
     */
    slice(start?: number, end?: number): K[] {
        return this._value.slice(start, end);
    }

    /**
     * 测试数组中的某些元素是否通过由提供的函数实现的测试。
     */
    some(callbackfn: (value: K, index: number, array: K[]) => boolean, thisArg?: any): boolean {
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

export interface OnAddOrRemoveArrayElementCallback<K> { (value: K): void };