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
    protected _onSet: Set<OnSetCallback<T>>;
    constructor(value: ObservableVariable<T> | T);
    value: T;
    /**
     * 该变量是否允许toJSON，默认true
     */
    serializable: boolean;
    protected toJSON(): any;
    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: OnSetCallback<T>): void;
    once(event: 'set', callback: OnSetCallback<T>): void;
    off(event: 'set', callback?: OnSetCallback<T>): void;
}
export interface OnSetCallback<T> {
    (newValue: T, oldValue: T): void;
}
//# sourceMappingURL=ObservableVariable.d.ts.map