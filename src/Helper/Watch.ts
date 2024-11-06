import type { ObservableVariable } from '../ObservableDataType/ObservableVariable';
import type { ObservableSet } from '../ObservableDataType/ObservableSet';
import type { ObservableMap } from '../ObservableDataType/ObservableMap';
import type { ObservableArray } from '../ObservableDataType/ObservableArray';

/**
 * 观察一个或多个变量的变化
 * @param items 要被监听的变量列表
 * @param callback 回调函数
 * @param eventType 要监听的事件类型
 * @returns 返回一个 off 方法用于取消监听
 */
export function watch(
    items: (ObservableVariable<any> | ObservableSet<any> | ObservableMap<any, any> | ObservableArray<any>)[],
    callback: (eventType: 'set' | 'add' | 'delete' | 'update', eventData: any[]) => void,
    eventType: ('set' | 'add' | 'delete' | 'update')[] = ['set', 'add', 'delete', 'update']
): () => void {
    const wrappers = eventType.map(type => [type, function (...args: any[]): void { callback(type, args) }]);

    for (const item of items) {
        for (const wrapper of wrappers) {
            (item as any).on(...wrapper);
        }
    }

    return function off() {
        for (const item of items) {
            for (const wrapper of wrappers) {
                (item as any).off(...wrapper);
            }
        }
    };
}
