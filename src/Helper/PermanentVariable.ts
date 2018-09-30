import _throttle = require('lodash.throttle');

import { watch } from './Watch';
import { ObservableMap } from '../ObservableDataType/ObservableMap';
import { ObservableVariable, ObservableVariableOptions } from '../ObservableDataType/ObservableVariable';
import { ObservableArray, ObservableArrayOptions } from '../ObservableDataType/ObservableArray';
import { ObservableSet } from '../ObservableDataType/ObservableSet';

//#region 存储引擎

export interface StorageEngine {
    /**
     * 保存数据
     * @param expire 该条数据多久之后过期（毫秒）。为0或空则表示不过期。
     */
    set: (key: string, value: ObservableVariable<any>, expire?: number) => void;

    /**
     * 读取数据
     */
    get: (key: string) => any;

    /**
     * 删除数据
     */
    delete: (key: string) => void;

    /**
     * 判断数据是否存在
     */
    has: (key: string) => boolean;
}

let storageEngine: StorageEngine;

/**
 * 配置存储引擎。默认的存储引擎是浏览器上的localStorage
 */
export function setStorageEngine(engine: StorageEngine): void {
    storageEngine = engine;
}

//判断localStorage是否存在
let hasLocalStorage = false;
try { hasLocalStorage = localStorage ? true : false } catch { }

//配置默认的localStorage引擎
if (hasLocalStorage) {
    //到期的时间列表
    const expireList = new ObservableMap<string, number>(JSON.parse(localStorage.getItem('__observable-variable.PermanentVariable.expireList__') || '[]'));

    //检查过期的计时器
    let timer: any;

    //删除过期的键
    function deleteExpiredKey(): void {
        const expired = [], now = Date.now();

        for (const [key, value] of expireList.entries())
            if (value < now) expired.push(key);

        for (const item of expired) {
            localStorage.removeItem(item);
            expireList.delete(item);
        }
    }

    watch([expireList], _throttle(() => {
        localStorage.setItem('__observable-variable.PermanentVariable.expireList__', JSON.stringify(expireList));

        if (timer === undefined && expireList.size > 0)
            timer = setInterval(deleteExpiredKey, 1000 * 60);    //每分钟检查一次
        else if (timer !== undefined && expireList.size === 0) {
            clearInterval(timer);
            timer = undefined;
        }
    }, 2000));

    if (expireList.size > 0) {
        deleteExpiredKey();
        if (timer === undefined && expireList.size > 0)
            timer = setInterval(deleteExpiredKey, 1000 * 60);
    }

    setStorageEngine({
        set(key, value, expire) {
            localStorage.setItem(key, JSON.stringify(value));

            if (expire)
                expireList.set(key, expire + Date.now());
            else
                expireList.delete(key);
        },
        get(key) {
            return JSON.parse(localStorage.getItem(key) as string);
        },
        delete(key) {
            localStorage.removeItem(key);
        },
        has(key) {
            return localStorage.getItem(key) !== null;
        }
    });
}

//#endregion

//#region PermanentVariable

interface PermanentVariableOptions<D, T, O> {
    /**
     * 默认值
     */
    defaultValue?: D;

    /**
     * 多少秒后过期（毫秒）。为0或空则表示不过期。过期后数据将从存储引擎中被删除
     */
    expire?: number;

    /**
     * 规定多长时间内最多保存一次，默认2秒
     */
    throttle?: number;

    /**
     * 数据从存储引擎读取出来之后触发，可用于对值进行修改
     * @param save 触发保存数据
     */
    init?: (value: T, save: () => void, oVar: O) => T;
}

/**
 * 自动读取和保存数据的oVar
 */
export function permanent_oVar<T>(key: string, options: PermanentVariableOptions<T, T, ObservableVariable<T>> & ObservableVariableOptions = {}): ObservableVariable<T> {
    const { defaultValue, expire, throttle = 2000, init } = options;
    const _value = new ObservableVariable<T>(storageEngine.has(key) ? storageEngine.get(key) : defaultValue, options);
    let save = () => storageEngine.set(key, _value, expire);
    watch([_value], save = throttle ? _throttle(save, throttle) : save);
    if (init) _value._changeStealthily(init(_value.value, save, _value));
    return _value;
}

/**
 * 自动读取和保存数据的oArr
 */
export function permanent_oArr<T>(key: string, options: PermanentVariableOptions<T[], T[], ObservableArray<T>> & ObservableArrayOptions = {}): ObservableArray<T> {
    const { defaultValue = [], expire, throttle = 2000, init } = options;
    const _value = new ObservableArray<T>(storageEngine.has(key) ? storageEngine.get(key) : defaultValue, options);
    let save = () => storageEngine.set(key, _value, expire);
    watch([_value], save = throttle ? _throttle(save, throttle) : save);
    if (init) _value._changeStealthily(init(_value.value, save, _value));
    return _value;
}

/**
 * 自动读取和保存数据的oSet
 */
export function permanent_oSet<T>(key: string, options: PermanentVariableOptions<Set<T> | ReadonlyArray<T>, Set<T>, ObservableSet<T>> & ObservableVariableOptions = {}): ObservableSet<T> {
    const { defaultValue = [], expire, throttle = 2000, init } = options;
    const _value = new ObservableSet<T>(storageEngine.has(key) ? storageEngine.get(key) : defaultValue, options);
    let save = () => storageEngine.set(key, _value, expire);
    watch([_value], save = throttle ? _throttle(save, throttle) : save);
    if (init) _value._changeStealthily(init(_value.value, save, _value));
    return _value;
}

/**
 * 自动读取和保存数据的oMap
 */
export function permanent_oMap<K, V>(key: string, options: PermanentVariableOptions<Map<K, V> | ReadonlyArray<[K, V]>, Map<K, V>, ObservableMap<K, V>> & ObservableVariableOptions = {}): ObservableMap<K, V> {
    const { defaultValue = [], expire, throttle = 2000, init } = options;
    const _value = new ObservableMap<K, V>(storageEngine.has(key) ? storageEngine.get(key) : defaultValue, options);
    let save = () => storageEngine.set(key, _value, expire);
    watch([_value], save = throttle ? _throttle(save, throttle) : save);
    if (init) _value._changeStealthily(init(_value.value, save, _value));
    return _value;
}

//#endregion