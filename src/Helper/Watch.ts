import { ObservableVariable } from "../ObservableDataType/ObservableVariable";

/**
 * 观察一个或多个变量的改变。对于数组、Map、Set，添加或删除或更新元素操作也会触发。   
 * 返回一个off方法用于取消监听变化
 */
export function watch(items: ObservableVariable<any>[], callback: () => void) {
    function listener() { callback() }

    items.forEach((item: any) => {
        item.on('set', listener);
        item.on('add', listener);
        item.on('remove', listener);
        item.on('update', listener);
    });

    return function off() {
        items.forEach((item: any) => {
            item.off('set', listener);
            item.off('add', listener);
            item.off('remove', listener);
            item.off('update', listener);
        });
    }
}