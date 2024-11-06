import isDeepEqual from 'lodash.isequal';

/**
 * 可观察变量配置参数
 */
export interface ObservableVariableOptions {
    /**
     * 是否可以被序列化(toJSON)。默认：true
     */
    serializable?: boolean;
    /**
     * 在触发 set、update 事件之前，确保新值不等于旧值。默认：true
     */
    ensureChange?: boolean;
    /**
     * 在判断新值是否等于旧值时，是否进行深度对比。默认：false
     */
    deepCompare?: boolean;
}

/**
 * 可观察变量
 */
export class ObservableVariable<T> {
    protected readonly _serializable!: boolean;
    protected readonly _ensureChange!: boolean;
    protected readonly _deepCompare!: boolean;
    protected readonly _onSet: Set<(newValue: T, oldValue: T, oVar: this) => void> = new Set();
    protected _onBeforeSet?: ((newValue: T, oldValue: T, oVar: this) => T) | undefined;
    protected _value!: T;

    /**
     * 获取变量值，设置值将触发 beforeSet 和 set 事件
     */
    get value(): T {
        return this._value;
    }

    set value(v: T) {
        if (this._onBeforeSet) { v = this._onBeforeSet(v, this._value, this) }
        if (this._ensureChange && (this._deepCompare ? isDeepEqual(v, this._value) : v === this._value)) { return }

        const oldValue = this._value;
        this._value = v;
        for (const callback of this._onSet) { callback(v, oldValue, this) }
    }

    /**
     * 注意：如果要继承 ObservableVariable，那么一定要添加下面一段代码
     * ```
     * if(value instanceof ObservableVariable) { return value }   // 确保变量不会被重复包装
     * super(value, options);
     * ```
     * @param value 要被观察的变量
     * @param options 配置参数
     */
    constructor(value: ObservableVariable<T> | T, options: ObservableVariableOptions = {}) {
        // 确保变量不会被重复包装
        if (value instanceof ObservableVariable) {
            /**
             * 如果造中使用了 return，那么不管是父类还是子类的原型都将不会附加到该对象上
             * 构造函数也就退化成了普通方法，子类构造中的 this 等于 return 的返回值
             */
            return value;   // eslint-disable-line no-constructor-return
        }

        const { serializable = true, ensureChange = true, deepCompare = false } = options;
        this._serializable = serializable;
        this._ensureChange = ensureChange;
        this._deepCompare = deepCompare;
        this._value = value;
    }

    toJSON(): T | undefined {
        return this._serializable ? this._value : undefined;
    }

    /**
     * 当变量值发生改变时触发
     */
    on(event: 'set', callback: (newValue: T, oldValue: T, oVar: this) => void): void;
    /**
     * 在变量值发生改变之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受 ensureChange 的影响，只要用户设置值就会被触发
     */
    on(event: 'beforeSet', callback: (newValue: T, oldValue: T, oVar: this) => T): void;
    on(event: any, callback: any): void {
        switch (event) {
            case 'set':
                this._onSet.add(callback);
                break;
            case 'beforeSet':
                this._onBeforeSet = callback;
                break;
        }
    }

    once(event: 'set', callback: (newValue: T, oldValue: T, oVar: this) => void): void;
    once(event: 'beforeSet', callback: (newValue: T, oldValue: T, oVar: this) => T): void;
    once(event: any, callback: any): void {
        const tempCallback = (...args: any[]): any => { this.off(event, tempCallback); return callback(...args) };
        this.on(event, tempCallback);
    }

    off(event: 'set', callback?: (newValue: T, oldValue: T, oVar: this) => void): void;
    off(event: 'beforeSet', callback?: (newValue: T, oldValue: T, oVar: this) => T): void;
    off(event: any, callback: any): void {
        switch (event) {
            case 'set': {
                callback ? this._onSet.delete(callback) : this._onSet.clear();
                break;
            }
            case 'beforeSet': {
                this._onBeforeSet = undefined;
                break;
            }
        }
    }
}

export function oVar<T>(value: ObservableVariable<T> | T, options?: ObservableVariableOptions): ObservableVariable<T> {
    return new ObservableVariable(value, options);
}
