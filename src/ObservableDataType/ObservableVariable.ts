import isDeepEqual from 'lodash.isequal';

/**
 * 可观察变量配置参数
 */
export interface ObservableVariableOptions {
    /**
     * 该变量是否可以被序列化(toJSON)，默认：true
     */
    serializable?: boolean;
    /**
     * 在触发 set、update 事件之前确保新值不等于旧值。默认：true
     */
    ensureChange?: boolean;
    /**
     * 在对比新值是否不等于旧值时，是否进行深度对比(对数组和对象非常有用)。默认：false
     */
    deepCompare?: boolean;
}

/**
 * 可观察变量
 */
export class ObservableVariable<T> {
    protected readonly _serializable: boolean;
    protected readonly _ensureChange: boolean;
    protected readonly _deepCompare: boolean;
    protected readonly _onSet: Set<(newValue: T, oldValue: T, oVar: ObservableVariable<T>) => void> = new Set();
    protected _onBeforeSet?: (newValue: T, oldValue: T, oVar: ObservableVariable<T>) => T;
    protected _value: T;

    /**
     * 变量值，设置值将触发 beforeSet 和 set 事件
     */
    get value(): T {
        return this._value;
    }

    set value(v: T) {
        if (this._onBeforeSet) v = this._onBeforeSet(v, this._value, this);
        if (this._ensureChange && (this._deepCompare ? isDeepEqual(v, this._value) : v === this._value)) return;

        if (this._onSet.size > 0) {
            const oldValue = this._value;
            this._value = v;
            for (const callback of this._onSet) callback(v, oldValue, this);
        } else
            this._value = v;
    }

    /**
     * 注意：如果要继承 ObservableVariable，那么在子类的构造中
     * 在执行 super() 之后一定要判断一下 if(this !== value)
     * 如果相等则说明是重复包裹，后面的代码则不应当执行
     * 
     * @param value 可观察变量初始值
     * @param options 可观察变量配置
     */
    constructor(value: ObservableVariable<T> | T, options: ObservableVariableOptions = {}) {
        if (value instanceof ObservableVariable) { // 确保不重复包裹变量
            /**
             * 如果造中使用了 return，那么不管是父类还是子类的原型都将不会附加到该对象上
             * 构造函数也就退化成了普通方法
             * 子类构造中的 this 等于 return 的返回值
             */
            return value;  // eslint-disable-line
        }

        const { serializable = true, ensureChange = true, deepCompare = false } = options;
        this._value = value;
        this._serializable = serializable;
        this._ensureChange = ensureChange;
        this._deepCompare = deepCompare;
    }

    toJSON(): T | undefined {
        return this._serializable ? this._value : undefined;
    }

    /**
     * 当改变变量值的时候触发
     */
    on(event: 'set', callback: (newValue: T, oldValue: T, oVar: this) => void): void;
    /**
     * 在变量值发生改变之前触发，返回一个新的值用于替换要设置的值
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调。该回调不会受 ensureChange 的影响，只要用户设置变量值就会被触发
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
            case 'set':
                callback ? this._onSet.delete(callback) : this._onSet.clear();
                break;

            case 'beforeSet':
                this._onBeforeSet = undefined;
                break;
        }
    }
}

export function oVar<T>(value: ObservableVariable<T> | T, options?: ObservableVariableOptions): ObservableVariable<T> {
    return new ObservableVariable(value, options);
}