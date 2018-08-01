import { ObservableVariable, OnSetCallback } from "./ObservableVariable";

/**
 * 可观察改变集合
 */
export class ObservableSet<T> extends ObservableVariable<Set<T>> {

    //#region 静态方法

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
    static observe(value: any, path?: any): any {
        if (path === undefined) {
            return new ObservableSet(value);
        } else if ('string' === typeof path) {
            path = path.split('.');
        }

        for (let index = 0, end = path.length - 1; index < end; index++) {
            value = value[path[index]];
        }

        value[path[path.length - 1]] = new ObservableSet(value[path[path.length - 1]]);
    }

    //#endregion

    //#region 属性

    protected _onAdd: Set<OnAddOrRemoveSetElementCallback<T>> = new Set();
    protected _onRemove: Set<OnAddOrRemoveSetElementCallback<T>> = new Set();

    constructor(value: ObservableSet<T> | Set<T> | T[]) {
        super(value as any);

        if (this !== value)
            if (Array.isArray(value))
                this._value = new Set(value);
    }

    //#endregion
    
    //#region toJSON

    protected toJSON(): any {
        return this.serializable ? [...this._value] : undefined;
    }

    //#endregion
    
    //#region 事件绑定方法

    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: OnSetCallback<Set<T>>): void;
    /**
     * 当向集合中添加元素时触发
     */
    on(event: 'add', callback: OnAddOrRemoveSetElementCallback<T>): void;
    /**
     * 当删除集合中元素时触发
     */
    on(event: 'remove', callback: OnAddOrRemoveSetElementCallback<T>): void;
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

    once(event: 'set', callback: OnSetCallback<Set<T>>): void;
    once(event: 'add', callback: OnAddOrRemoveSetElementCallback<T>): void;
    once(event: 'remove', callback: OnAddOrRemoveSetElementCallback<T>): void;
    once(event: any, callback: any): any {
        super.once(event, callback);
    }

    off(event: 'set', callback?: OnSetCallback<Set<T>>): void;
    off(event: 'add', callback?: OnAddOrRemoveSetElementCallback<T>): void;
    off(event: 'remove', callback?: OnAddOrRemoveSetElementCallback<T>): void;
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

    //#region 集合修改操作方法

    /**
     * 用来清空一个 Set 对象中的所有元素。
     */
    clear(): void {
        if (this._onRemove.size > 0) {
            this._value.forEach(value => {
                this._value.delete(value);
                this._onRemove.forEach(callback => callback(value));
            });
        } else
            this._value.clear();
    }

    /**
     * 从一个 Set 对象中删除指定的元素。
     */
    delete(value: T): boolean {
        if (this._onRemove.size > 0) {
            const result = this._value.delete(value);
            if (result) this._onRemove.forEach(callback => callback(value));
            return result;
        } else
            return this._value.delete(value);
    }

    /**
     * 用来向一个 Set 对象的末尾添加一个指定的值。
     */
    add(value: T): this {
        if (this._onAdd.size > 0) {
            if (!this._value.has(value)) {
                this._value.add(value);
                this._onAdd.forEach(callback => callback(value));
            }
        } else
            this._value.add(value);

        return this;
    }

    //#endregion

    //#region 集合读取操作方法

    /**
     * 返回一个新的包含 [value, value] 对的 Iterator 对象，返回的迭代器的迭代顺序与 Set 对象的插入顺序相同。
     */
    entries() {
        return this._value.entries();
    }

    /**
     * 根据集合中元素的顺序，对每个元素都执行提供的 callback 函数一次。
     */
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
        this._value.forEach(callbackfn, thisArg);
    }

    /**
     * 返回一个布尔值来指示对应的值value是否存在Set对象中
     */
    has(value: T): boolean {
        return this._value.has(value);
    }

    /**
     * 行为与 value 方法完全一致，返回 Set 对象的元素。
     */
    keys() {
        return this._value.keys();
    }

    /**
     * 返回一个 Iterator  对象，这个对象以插入Set 对象的顺序包含了原 Set 对象里的每个元素。
     */
    values() {
        return this._value.values();
    }

    //#endregion
}

export interface OnAddOrRemoveSetElementCallback<T> { (value: T): void };