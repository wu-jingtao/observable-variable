import { ObservableVariable, type ObservableVariableOptions } from './ObservableVariable';

/**
 * 可观察 Set
 */
export class ObservableSet<T> extends ObservableVariable<ReadonlySet<T>> {
    protected readonly _onAdd: Set<(value: T, oSet: this) => void> = new Set();
    protected readonly _onDelete: Set<(value: T, oSet: this) => void> = new Set();

    /**
     * Set 中元素个数
     */
    get size(): number {
        return this._value.size;
    }

    constructor(value: Iterable<T> = new Set(), options?: ObservableVariableOptions) {
        if (value instanceof ObservableVariable) { return value as any } // eslint-disable-line no-constructor-return -- 确保变量不会被重复包装
        super(value as ReadonlySet<T>, options);
        if (!(this._value instanceof Set)) { this._value = new Set(value) }
    }

    // @ts-expect-error: 由于 Set 的 toJSON 方法只会返回一个空对象，为了让结果有意义，这里将 Set 转换为数组，所以需要强行覆盖父类返回值类型
    override toJSON(): T[] | undefined {
        return this._serializable ? [...this._value] : undefined;
    }

    // #region 事件绑定

    /**
     * 当变量值发生改变时触发
     */
    override on(event: 'set', callback: (newValue: ReadonlySet<T>, oldValue: ReadonlySet<T>, oSet: this) => void): void;
    /**
     * 在变量值发生改变之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受 ensureChange 的影响，只要用户设置值就会被触发
     */
    override on(event: 'beforeSet', callback: (newValue: ReadonlySet<T>, oldValue: ReadonlySet<T>, oSet: this) => ReadonlySet<T>): void;
    /**
     * 当向 Set 中添加元素时触发
     */
    override on(event: 'add', callback: (value: T, oSet: this) => void): void;
    /**
     * 当删除 Set 中元素时触发
     */
    override on(event: 'delete', callback: (value: T, oSet: this) => void): void;
    override on(event: any, callback: any): void {
        switch (event) {
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

    override once(event: 'set', callback: (newValue: ReadonlySet<T>, oldValue: ReadonlySet<T>, oSet: this) => void): void;
    override once(event: 'beforeSet', callback: (newValue: ReadonlySet<T>, oldValue: ReadonlySet<T>, oSet: this) => ReadonlySet<T>): void;
    override once(event: 'add', callback: (value: T, oSet: this) => void): void;
    override once(event: 'delete', callback: (value: T, oSet: this) => void): void;
    override once(event: any, callback: any): void {
        super.once(event, callback);
    }

    override off(event: 'set', callback?: (newValue: ReadonlySet<T>, oldValue: ReadonlySet<T>, oSet: this) => void): void;
    override off(event: 'beforeSet', callback?: (newValue: ReadonlySet<T>, oldValue: ReadonlySet<T>, oSet: this) => ReadonlySet<T>): void;
    override off(event: 'add', callback?: (value: T, oSet: this) => void): void;
    override off(event: 'delete', callback?: (value: T, oSet: this) => void): void;
    override off(event: any, callback: any): void {
        switch (event) {
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

    // #region Set 修改操作方法

    /**
     * 清除 Set 中所有元素，清除成功将触发 delete 事件
     */
    clear(): void {
        if (this._onDelete.size > 0) {
            for (const item of this._value) {
                (this._value as Set<T>).delete(item);
                for (const callback of this._onDelete) { callback(item, this) }
            }
        } else {
            (this._value as Set<T>).clear();
        }
    }

    /**
     * 从 Set 中删除元素，删除成功将触发 delete 事件
     * @param value 要被删除的值
     * @returns 删除成功返回 true，删除失败返回 false
     */
    delete(value: T): boolean {
        if (this._onDelete.size > 0) {
            const result = (this._value as Set<T>).delete(value);
            if (result) { for (const callback of this._onDelete) { callback(value, this) } }
            return result;
        } else {
            return (this._value as Set<T>).delete(value);
        }
    }

    /**
     * 向 Set 的末尾添加一个元素，添加成功将触发 add 事件
     * @param value 要被添加的值
     */
    add(value: T): this {
        if (this._onAdd.size > 0) {
            if (!this._value.has(value)) {
                (this._value as Set<T>).add(value);
                for (const callback of this._onAdd) { callback(value, this) }
            }
        } else {
            (this._value as Set<T>).add(value);
        }
        return this;
    }

    // #endregion

    // #region Set 读取操作方法

    /**
     * 返回一个包含 [value, value] 键值对的 Iterator 对象，返回的迭代器的迭代顺序与 Set 对象的插入顺序相同
     */
    entries(): IterableIterator<[T, T]> {
        return this._value.entries();
    }

    /**
     * 根据 Set 中元素的顺序，对每个元素都执行提供的回调函数一次
     * @param callback 回调函数
     * @param thisArg 回调函数中的 this
     */
    forEach<H>(callback: (this: H, value: T, value2: T, set: ReadonlySet<T>) => void, thisArg?: H): void {
        this._value.forEach(callback, thisArg);
    }

    /**
     * 返回一个布尔值来指示对应的值 value 是否存于 Set 中
     * @param value 要查询的值
     */
    has(value: T): boolean {
        return this._value.has(value);
    }

    /**
     * 行为与 values 方法完全一致，返回 Set 的元素迭代器
     */
    keys(): IterableIterator<T> {
        return this._value.keys();
    }

    /**
     * 返回一个元素迭代器，迭代顺序与 Set 对象的插入顺序相同
     */
    values(): IterableIterator<T> {
        return this._value.values();
    }

    /**
     * 返回一个元素迭代器，迭代顺序与 Set 对象的插入顺序相同
     */
    [Symbol.iterator](): IterableIterator<T> {
        return this._value[Symbol.iterator]();
    }

    // #endregion

    // #region Set 集合运算方法

    /**
     * 计算两个集合的差集
     * @param other 参与运算的集合
     * @returns 返回一个新的集合，其中包含当前集合中存在但 other 集合中不存在的元素
     */
    difference(other: this | ReadonlySet<T>): Set<T> {
        if (other instanceof ObservableSet) {
            return this._value.difference(other._value);
        } else {
            return this._value.difference(other);
        }
    }

    /**
     * 计算两个集合的交集
     * @param other 参与运算的集合
     * @returns 返回一个新的集合，其中包含两个集合中共同的元素
     */
    intersection(other: this | ReadonlySet<T>): Set<T> {
        if (other instanceof ObservableSet) {
            return this._value.intersection(other._value);
        } else {
            return this._value.intersection(other);
        }
    }

    /**
     * 计算两个集合的并集
     * @param other 参与运算的集合
     * @returns 返回一个新的集合，其中包含两个集合中所有的元素
     */
    union(other: this | ReadonlySet<T>): Set<T> {
        if (other instanceof ObservableSet) {
            return this._value.union(other._value);
        } else {
            return this._value.union(other);
        }
    }

    /**
     * 并集减去交集
     * @param other 参与运算的集合
     */
    symmetricDifference(other: this | ReadonlySet<T>): Set<T> {
        if (other instanceof ObservableSet) {
            return this._value.symmetricDifference(other._value);
        } else {
            return this._value.symmetricDifference(other);
        }
    }

    /**
     * 判断两个集合的交集是不是空集（没有共同元素）
     * @param other 参与运算的集合
     * @returns 返回 true 表示没有共同元素，返回 false 表示有共同元素
     */
    isDisjointFrom(other: this | ReadonlySet<T>): boolean {
        if (other instanceof ObservableSet) {
            return this._value.isDisjointFrom(other._value);
        } else {
            return this._value.isDisjointFrom(other);
        }
    }

    /**
     * 判断当前集合是不是 other 集合的子集
     * @param other 参与运算的集合
     * @returns 返回 true 表示是，返回 false 表示不是
     */
    isSubsetOf(other: this | ReadonlySet<T>): boolean {
        if (other instanceof ObservableSet) {
            return this._value.isSubsetOf(other._value);
        } else {
            return this._value.isSubsetOf(other);
        }
    }

    /**
     * 判断当前集合是不是 other 集合的父集
     * @param other 参与运算的集合
     * @returns 返回 true 表示是，返回 false 表示不是
     */
    isSupersetOf(other: this | ReadonlySet<T>): boolean {
        if (other instanceof ObservableSet) {
            return this._value.isSupersetOf(other._value);
        } else {
            return this._value.isSupersetOf(other);
        }
    }

    // #endregion
}

export function oSet<T>(value?: Iterable<T>, options?: ObservableVariableOptions): ObservableSet<T> {
    return new ObservableSet(value, options);
}
