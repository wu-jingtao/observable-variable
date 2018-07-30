import { ObservableVariable, OnSetCallback } from "./ObservableVariable";

/**
 * 可观察改变字典
 */
export class ObservableMap<T extends Map<K, V>, K, V> extends ObservableVariable<T> {

    //#region 静态方法

    /**
     * 将一个数组转换成可观察字典，相当于 new ObservableMap(value)
     */
    static observe<T extends Map<K, V>, K, V>(value: ObservableMap<T, K, V> | T | [K, V][]): ObservableMap<T, K, V>;
    /**
     * 将对象中指定位置的一个数组转换成可观察字典，路径通过`.`分割
     */
    static observe(object: object, path: string): void;
    /**
     * 将对象中指定位置的一个数组转换成可观察字典
     */
    static observe(object: object, path: string[]): void;
    static observe(value: any, path?: any): any {
        if (path === undefined) {
            return new ObservableMap(value);
        } else if ('string' === typeof path) {
            path = path.split('.');
        }

        for (let index = 0, end = path.length - 1; index < end; index++) {
            value = value[path[index]];
        }

        value[path[path.length - 1]] = new ObservableMap(value[path[path.length - 1]]);
    }

    //#endregion

    //#region 属性

    protected _onAdd: Set<OnAddOrRemoveMapElementCallback<K, V>> = new Set();
    protected _onRemove: Set<OnAddOrRemoveMapElementCallback<K, V>> = new Set();

    constructor(value: ObservableMap<T, K, V> | T | [K, V][]) {
        super(value as T);

        //能执行的这一步说明传入的值不是ObservableMap
        if (Array.isArray(value))
            this._value = new Map<K, V>(value) as T;
    }

    //#endregion

    //#region 事件绑定方法

    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: OnSetCallback<T>): void;
    /**
     * 当向字典中添加元素时触发
     */
    on(event: 'add', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    /**
     * 当删除字典中元素时触发
     */
    on(event: 'remove', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
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
    once(event: 'add', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    once(event: 'remove', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    once(event: any, callback: any): any {
        const tempCallback = (...args: any[]) => { this.off(event, tempCallback); callback(...args); };
        this.on(event, tempCallback);
    }

    off(event: 'set', callback?: OnSetCallback<T>): void;
    off(event: 'add', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
    off(event: 'remove', callback: OnAddOrRemoveMapElementCallback<K, V>): void;
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

    //#region 基本字典操作方法

    /**
     * 删除被观察字典中所有元素
     */
    clear(): void {
        if (this._onRemove.size > 0) {
            this._value.forEach((value, key) => {
                this._value.delete(key);
                this._onRemove.forEach(callback => callback(value, key));
            });
        } else
            this._value.clear();
    }

    /**
     * 删除被观察字典中特定元素
     */
    delete(key: K): boolean {
        if (this._onRemove.size > 0) {
            if (this._value.has(key)) {
                const value = this._value.get(key);
                this._value.delete(key);
                this._onRemove.forEach(callback => callback(value as V, key));
                return true;
            } else
                return false;
        } else
            return this._value.delete(key);
    }

    /**
     * 添加或更新被观察字典中指定元素
     */
    set(key: K, value: V): this {
        if (this._onAdd.size > 0) {
            if (!this._value.has(key)) {
                this.set(key, value);
                this._onAdd.forEach(callback => callback(value, key));
            } else
                this._value.set(key, value);
        } else
            this._value.set(key, value);

        return this;
    }

    entries() { }
    forEach() { }
    get() { }
    has() { }
    keys() { }
    values() { }

    //#endregion
}

export interface OnAddOrRemoveMapElementCallback<K, V> { (value: V, key: K): void };