/**
 * 可观察改变变量
 */
export declare class ObservableVariable<T> {
    /**
     * 将一个变量转换成可观察变量，相当于 new ObservableVariable(value)
     */
    static observe<T>(value: ObservableVariable<T> | T): ObservableVariable<T>;
    /**
     * 将对象中指定位置的一个变量转换成可观察变量，路径通过`.`分割
     */
    static observe(object: object, path: string): void;
    /**
     * 将对象中指定位置的一个变量转换成可观察变量
     */
    static observe(object: object, path: string[]): void;
    protected _value: T;
    protected _onSet: Set<(newValue: T, oldValue: T) => void>;
    protected _onBeforeSet: (newValue: T, oldValue: T, changeTo: (value: T) => void, oVar: ObservableVariable<T>) => boolean | void;
    constructor(value: ObservableVariable<T> | T);
    /**
     * 该变量是否是只读的，默认false
     */
    readonly: boolean;
    value: T;
    /**
     * 该变量是否允许toJSON，默认true
     */
    serializable: boolean;
    protected toJSON(): any;
    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: (newValue: T, oldValue: T) => void): void;
    /**
     * 在值发生改变之前触发，返回false表示阻止更改，如果要更改newValue可以调用changeTo。
     * 注意：该回调只允许设置一个，重复设置将覆盖之前的回调，同时设置的回调是以同步方式执行的。
     * 注意：如果要执行changeTo，则就不应再返回false了，否则将使得changeTo无效。
     */
    on(event: 'beforeSet', callback: (newValue: T, oldValue: T, changeTo: (value: T) => void, oVar: this) => boolean | void): void;
    once(event: 'set', callback: (newValue: T, oldValue: T) => void): void;
    once(event: 'beforeSet', callback: (newValue: T, oldValue: T, changeTo: (value: T) => void, oVar: this) => boolean | void): void;
    off(event: 'set', callback?: (newValue: T, oldValue: T) => void): void;
    off(event: 'beforeSet', callback?: (newValue: T, oldValue: T, changeTo: (value: T) => void, oVar: this) => boolean | void): void;
}
//# sourceMappingURL=ObservableVariable.d.ts.map