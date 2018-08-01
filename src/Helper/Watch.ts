import { ObservableVariable } from "../ObservableDataType/ObservableVariable";

/**
 * 观察一个或多个变量的改变。对于数组等类型的变量，添加或删除元素操作也会触发。   
 * 返回一个off方法用于取消监听变化
 */
export function watch<T extends ObservableVariable<V>, V>(items: T[], callback: (variables: T[]) => void) {
    function listener() { callback(items); }

    items.forEach((item: any) => {
        item.on('set', listener);
        item.on('add', listener);
        item.on('remove', listener);
    });

    return function off() {
        items.forEach((item: any) => {
            item.off('set', listener);
            item.off('add', listener);
            item.off('remove', listener);
        });
    }
}