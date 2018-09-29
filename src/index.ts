import { ObservableVariable } from "./ObservableDataType/ObservableVariable";
import { ObservableArray } from "./ObservableDataType/ObservableArray";
import { ObservableMap } from "./ObservableDataType/ObservableMap";
import { ObservableSet } from "./ObservableDataType/ObservableSet";

export { ObservableVariable } from "./ObservableDataType/ObservableVariable";
export { ObservableArray } from "./ObservableDataType/ObservableArray";
export { ObservableMap } from "./ObservableDataType/ObservableMap";
export { ObservableSet } from "./ObservableDataType/ObservableSet";
export { watch } from "./Helper/Watch";
export * from "./Helper/PermanentVariable";

//简写
export const oVar = ObservableVariable.observe;
export const oArr = ObservableArray.observe;
export const oMap = ObservableMap.observe;
export const oSet = ObservableSet.observe; 