import { ObservableVariable } from "../ObservableDataType/ObservableVariable";
/**
 * 观察一个或多个变量的改变。对于数组、Map、Set，添加或删除元素操作也会触发。
 * 返回一个off方法用于取消监听变化
 */
export declare function watch<T>(items: ObservableVariable<T>[], callback: (variables: ReadonlyArray<ObservableVariable<T>>) => void): () => void;
//# sourceMappingURL=Watch.d.ts.map