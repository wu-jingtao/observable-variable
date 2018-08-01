import { ObservableVariable } from "./ObservableVariable";

export abstract class DynamicVariable<T> extends ObservableVariable<T>{

    /**
     * 该变量是否允许toJSON，默认false
     */
    serializable = false;

    /**
     * 当子类需要更新值时必须使用该方法，该方法会触发onSet事件
     */
    protected _update(value: T) {
        if (this._onSet.size > 0) {
            const oldValue = this._value;
            this._value = value;
            this._onSet.forEach(callback => callback(value, oldValue));
        } else
            this._value = value;
    }

    /**
     * 当执行destroy后触发，用于执行一些资源清理工作
     */
    protected abstract _onDestroy(): void;

    /**
     * 清除该变量
     */
    public destroy() {
        this._onDestroy();
    }
}