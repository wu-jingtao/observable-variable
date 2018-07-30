import { ObservableVariable, OnSetCallback } from "./ObservableVariable";

/**
 * 可观察改变数组
 */
export class ObservableArray<T extends Array<K>, K> extends ObservableVariable<T> {

    //#region 静态方法

    /**
     * 将一个数组转换成可观察数组，相当于 new ObservableArray(value)
     */
    static observe<T extends Array<K>, K>(value: T): ObservableArray<T, K>;
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

    //#region 基本数组操作方法

    /**
     * 移除被观察数组中的最后一个元素
     */
    pop(): K | undefined {
        const originalLength = this._value.length;
        const result = this._value.pop();
        
        if (this._onRemove.size > 0)
            if (originalLength > this._value.length)
                this._onRemove.forEach(callback => callback(result as any));

        return result;
    }

    /**
     * 添加一个或多个元素到被观察数组的末尾，并返回数组的长度
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
     * 移除被观察数组中的第一个元素
     */
    shift(): K | undefined {
        const originalLength = this._value.length;
        const result = this._value.shift();

        if (this._onRemove.size > 0)
            if (originalLength > this._value.length)
                this._onRemove.forEach(callback => callback(result as any));

        return result;
    }

    /**
     * 添加一个或多个元素到被观察数组的开头，并返回数组的长度
     */
    unshift(...items: K[]): number {
        if (this._onAdd.size > 0) {
            items.forEach(item => {
                this._value.unshift(item);
                this._onAdd.forEach(callback => callback(item));
            });

            return this._value.length;
        } else
            return this._value.unshift(...items);
    }

    /**
     * 从指定位置开始删除被观察数组剩下的元素
     * @param start 从哪开始删除元素
     */
    splice(start: number, deleteCount?: number): K[];
    /**
     * 改变被观察数组的内容，通过移除或添加新元素
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
     * 删除被观察数组中第一个与之匹配的元素
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
     * 删除被观察数组中所有与之匹配的元素
     * @param value 要被删除的值
     */
    deleteAll(value: K): void {
        while (this.delete(value));
    }

    /**
     * 排序被观察数组。注意，排序完成之后将触发onSet事件
     * @param compareFn 排序方法
     */
    sort(compareFn?: (a: K, b: K) => number): void {
        this._value.sort(compareFn);

        if (this._onSet.size > 0)
            this._onSet.forEach(callback => callback(this._value, this._value));
    }

    /**
     * 反转被观察数组中元素顺序。注意，反转完成之后将触发onSet事件
     */
    reverse(): K[] {
        this._value.reverse();

        if (this._onSet.size > 0)
            this._onSet.forEach(callback => callback(this._value, this._value));

        return this._value;
    }

    /**
     * 将被观察数组中指定部分的值填充为指定值。注意，填充完成之后将触发onSet事件
     * @param value 要填充的值
     * @param start 开始位置
     * @param end 结束位置
     */
    fill(value: K, start?: number, end?: number): void {
        this._value.fill(value, start, end);

        if (this._onSet.size > 0)
            this._onSet.forEach(callback => callback(this._value, this._value));
    }

    //#endregion
}

export interface OnAddOrRemoveArrayElementCallback<K> { (value: K): void };