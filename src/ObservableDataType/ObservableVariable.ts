/**
 * 可观察改变变量
 */
export class ObservableVariable<T>{

    //#region 静态方法

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
    protected _onSet: Set<(newValue: T, oldValue: T) => void> = new Set();
    protected _onBeforeSet: (newValue: T, oldValue: T, oVar: ObservableVariable<T>) => boolean | void;

    constructor(value: ObservableVariable<T> | T) {
        //确保不重复包裹变量
        if (value instanceof ObservableVariable) {
            /**
             * 如果造中使用了return，那么不管是父类还是子类的原型都将不会附加到该对象上
             * 构造函数也就退化成了普通方法
             * 子类构造中的this等于return的返回值
             */
            return value;
        }

        /**
         * 注意：如果要继承ObservableVariable，那么在子类的构造中
         * 在执行super(value)之后一定要判断一下 if(this === value)
         * 如果相等则说明是重复包裹，后面的代码则不应当执行
         */
        this._value = value;
    }

    /**
     * 该变量是否是只读的，默认false
     */
    public readonly = false;

    public get value(): T {
        return this._value;
    }

    public set value(v: T) {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);

        if (this._onBeforeSet !== undefined)
            if (this._onBeforeSet(v, this._value, this) === false)
                return;

        if (this._onSet.size > 0) {
            const oldValue = this._value;
            this._value = v;
            this._onSet.forEach(callback => callback(v, oldValue));
        } else
            this._value = v;
    }

    //#endregion

    //#region toJSON

    /**
     * 该变量是否允许toJSON，默认true
     */
    public serializable: boolean = true;

    protected toJSON(): any {
        return this.serializable ? this._value : undefined;
    }

    //#endregion

    //#region 事件绑定方法

    /**
     * 当设置值的时候触发
     */
    on(event: 'set', callback: (newValue: T, oldValue: T) => void): void;
    /**
     * 在值发生改变之前触发，返回void或true表示同意更改，返回false表示阻止更改。注意：该回调只允许设置一个，重复设置将覆盖之前的回调，同时设置的回调是以同步方式执行的
     */
    on(event: 'beforeSet', callback: (newValue: T, oldValue: T, oVar: this) => boolean | void): void;
    on(event: any, callback: any): any {
        switch (event) {
            case 'set':
                this._onSet.add(callback);
                break;

            case 'beforeSet':
                this._onBeforeSet = callback;
                break;
        }
    }

    once(event: 'set', callback: (newValue: T, oldValue: T) => void): void;
    once(event: 'beforeSet', callback: (newValue: T, oldValue: T, oVar: this) => boolean | void): void;
    once(event: any, callback: any): any {
        const tempCallback = (...args: any[]) => { this.off(event, tempCallback); return callback(...args); };
        this.on(event, tempCallback);
    }

    off(event: 'set', callback?: (newValue: T, oldValue: T) => void): void;
    off(event: 'beforeSet', callback?: (newValue: T, oldValue: T, oVar: this) => boolean | void): void;
    off(event: any, callback: any): any {
        switch (event) {
            case 'set':
                callback ? this._onSet.delete(callback) : this._onSet.clear();
                break;

            case 'beforeSet':
                this._onBeforeSet = undefined as any;
                break;
        }
    }

    //#endregion
}