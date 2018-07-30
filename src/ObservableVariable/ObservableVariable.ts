/**
 * 可观察改变变量
 */
export class ObservableVariable<T>{

    //#region 静态方法

    /**
     * 将一个变量转换成可观察变量，相当于 new ObservableVariable(value)
     */
    static observe<T>(value: T): ObservableVariable<T>;
    /**
     * 将对象中指定位置的一个变量转换成可观察变量，路径通过`.`分割
     */
    static observe(object: object, path: string): void;
    /**
     * 将对象中指定位置的一个变量转换成可观察变量
     */
    static observe(object: object, path: string[]): void;
    static observe(value: any, path?: any): any {
        if (path === undefined) {
            return new ObservableVariable(value);
        } else if ('string' === typeof path) {
            path = path.split('.');
        }

        for (let index = 0, end = path.length - 1; index < end; index++) {
            value = value[path[index]];
        }

        value[path[path.length - 1]] = new ObservableVariable(value[path[path.length - 1]]);
    }

    //#endregion

    //#region 属性

    protected _value: T;  //保存的变量值
    protected _onSet: Set<OnSetCallback<T>> = new Set();

    constructor(value: T) {
        //确保不重复包裹变量
        if (value instanceof ObservableVariable)
            return value;

        this._value = value;
    }

    public get value(): T {
        return this._value;
    }

    public set value(v: T) {
        this._value = v;

        if (this._onSet.size > 0)
            this._onSet.forEach(callback => callback(v, this._value));
    }

    //#endregion

    //#region toJSON

    /**
     * 该变量是否允许toJSON，默认true
     */
    public serializable: boolean = true;

    private toJSON() {
        return this.serializable ? this._value : undefined;
    }

    //#endregion

    //#region 事件绑定方法

    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: OnSetCallback<T>): void;
    on(event: any, callback: any): any {
        switch (event) {
            case 'set':
                this._onSet.add(callback);
                break;
        }
    }

    once(event: 'set', callback: OnSetCallback<T>): void;
    once(event: any, callback: any): any {
        const tempCallback = (...args: any[]) => { this.off(event, tempCallback); callback(...args); };
        this.on(event, tempCallback);
    }

    off(event: 'set', callback?: OnSetCallback<T>): void;
    off(event: any, callback: any): any {
        switch (event) {
            case 'set':
                callback ? this._onSet.delete(callback) : this._onSet.clear();
                break;
        }
    }

    //#endregion
}

export interface OnSetCallback<T> { (newValue: T, oldValue: T): void; }