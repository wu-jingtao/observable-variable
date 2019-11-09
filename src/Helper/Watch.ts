import { ObservableVariable } from '../ObservableDataType/ObservableVariable';

/**
 * 观察一个或多个变量的变化，监听set、add、delete、update事件   
 * 返回一个off方法用于取消监听
 */
export function watch(items: ObservableVariable<any>[], callback: () => void): () => void {
    items.forEach((item: any) => {
        item.on('set', callback);
        item.on('add', callback);
        item.on('delete', callback);
        item.on('update', callback);
    });

    return function off() {
        items.forEach((item: any) => {
            item.off('set', callback);
            item.off('add', callback);
            item.off('delete', callback);
            item.off('update', callback);
        });
    };
}