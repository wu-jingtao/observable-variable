"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ObservableVariable_1 = require("./ObservableVariable");
/**
 * 可观察改变集合
 */
class ObservableSet extends ObservableVariable_1.ObservableVariable {
    constructor(value) {
        super(value);
        //#endregion
        //#region 属性
        this._onAdd = new Set();
        this._onRemove = new Set();
        if (this !== value)
            if (Array.isArray(value))
                this._value = new Set(value);
    }
    static observe(value, path) {
        if (path === undefined) {
            return new ObservableSet(value);
        }
        else if ('string' === typeof path) {
            path = path.split('.');
        }
        for (let index = 0, end = path.length - 1; index < end; index++) {
            value = value[path[index]];
        }
        value[path[path.length - 1]] = new ObservableSet(value[path[path.length - 1]]);
    }
    /**
     * 集合元素个数
     */
    get size() {
        return this._value.size;
    }
    //#endregion
    //#region toJSON
    toJSON() {
        return this.serializable ? [...this._value] : undefined;
    }
    on(event, callback) {
        switch (event) {
            case 'add':
                this._onAdd.add(callback);
                break;
            case 'remove':
                this._onRemove.add(callback);
                break;
            default:
                super.on(event, callback);
                break;
        }
    }
    once(event, callback) {
        super.once(event, callback);
    }
    off(event, callback) {
        switch (event) {
            case 'add':
                callback ? this._onAdd.delete(callback) : this._onAdd.clear();
                break;
            case 'remove':
                callback ? this._onRemove.delete(callback) : this._onRemove.clear();
                break;
            default:
                super.off(event, callback);
                break;
        }
    }
    //#endregion
    //#region 集合修改操作方法
    /**
     * 用来清空一个 Set 对象中的所有元素。
     */
    clear() {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);
        if (this._onRemove.size > 0) {
            this._value.forEach(value => {
                this._value.delete(value);
                this._onRemove.forEach(callback => callback(value));
            });
        }
        else
            this._value.clear();
    }
    /**
     * 从一个 Set 对象中删除指定的元素。
     */
    delete(value) {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);
        if (this._onRemove.size > 0) {
            const result = this._value.delete(value);
            if (result)
                this._onRemove.forEach(callback => callback(value));
            return result;
        }
        else
            return this._value.delete(value);
    }
    /**
     * 用来向一个 Set 对象的末尾添加一个指定的值。
     */
    add(value) {
        if (this.readonly)
            throw new Error(`尝试修改一个只读的 ${this.constructor.name}`);
        if (this._onAdd.size > 0) {
            if (!this._value.has(value)) {
                this._value.add(value);
                this._onAdd.forEach(callback => callback(value));
            }
        }
        else
            this._value.add(value);
        return this;
    }
    //#endregion
    //#region 集合读取操作方法
    /**
     * 返回一个新的包含 [value, value] 对的 Iterator 对象，返回的迭代器的迭代顺序与 Set 对象的插入顺序相同。
     */
    entries() {
        return this._value.entries();
    }
    /**
     * 根据集合中元素的顺序，对每个元素都执行提供的 callback 函数一次。
     */
    forEach(callbackfn, thisArg) {
        this._value.forEach(callbackfn, thisArg);
    }
    /**
     * 返回一个布尔值来指示对应的值value是否存在Set对象中
     */
    has(value) {
        return this._value.has(value);
    }
    /**
     * 行为与 value 方法完全一致，返回 Set 对象的元素。
     */
    keys() {
        return this._value.keys();
    }
    /**
     * 返回一个 Iterator  对象，这个对象以插入Set 对象的顺序包含了原 Set 对象里的每个元素。
     */
    values() {
        return this._value.values();
    }
}
exports.ObservableSet = ObservableSet;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9ic2VydmFibGVEYXRhVHlwZS9PYnNlcnZhYmxlU2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkRBQTBEO0FBRTFEOztHQUVHO0FBQ0gsbUJBQThCLFNBQVEsdUNBQTBCO0lBcUM1RCxZQUFZLEtBQXNDO1FBQzlDLEtBQUssQ0FBQyxLQUFZLENBQUMsQ0FBQztRQVJ4QixZQUFZO1FBRVosWUFBWTtRQUVGLFdBQU0sR0FBNEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM1QyxjQUFTLEdBQTRCLElBQUksR0FBRyxFQUFFLENBQUM7UUFLckQsSUFBSSxJQUFJLEtBQUssS0FBSztZQUNkLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQTNCRCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQVUsRUFBRSxJQUFVO1FBQ2pDLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNwQixPQUFPLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ25DO2FBQU0sSUFBSSxRQUFRLEtBQUssT0FBTyxJQUFJLEVBQUU7WUFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDMUI7UUFFRCxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUM3RCxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQzlCO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJ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QUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNBLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNO1FBQ0YsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2hDLENBQUM7Q0FHSjtBQXhORCxzQ0F3TkMiLCJmaWxlIjoiT2JzZXJ2YWJsZURhdGFUeXBlL09ic2VydmFibGVTZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPYnNlcnZhYmxlVmFyaWFibGUgfSBmcm9tIFwiLi9PYnNlcnZhYmxlVmFyaWFibGVcIjtcclxuXHJcbi8qKlxyXG4gKiDlj6/op4Llr5/mlLnlj5jpm4blkIhcclxuICovXHJcbmV4cG9ydCBjbGFzcyBPYnNlcnZhYmxlU2V0PFQ+IGV4dGVuZHMgT2JzZXJ2YWJsZVZhcmlhYmxlPFNldDxUPj4ge1xyXG5cclxuICAgIC8vI3JlZ2lvbiDpnZnmgIHmlrnms5VcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWwhuS4gOS4quaVsOe7hOi9rOaNouaIkOWPr+inguWvn+mbhuWQiO+8jOebuOW9k+S6jiBuZXcgT2JzZXJ2YWJsZVNldCh2YWx1ZSlcclxuICAgICAqL1xyXG4gICAgc3RhdGljIG9ic2VydmU8VD4odmFsdWU6IE9ic2VydmFibGVTZXQ8VD4gfCBTZXQ8VD4gfCBUW10pOiBPYnNlcnZhYmxlU2V0PFQ+O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlsIblr7nosaHkuK3mjIflrprkvY3nva7nmoTkuIDkuKrmlbDnu4TovazmjaLmiJDlj6/op4Llr5/pm4blkIjvvIzot6/lvoTpgJrov4dgLmDliIblibJcclxuICAgICAqL1xyXG4gICAgc3RhdGljIG9ic2VydmUob2JqZWN0OiBvYmplY3QsIHBhdGg6IHN0cmluZyk6IHZvaWQ7XHJcbiAgICAvKipcclxuICAgICAqIOWwhuWvueixoeS4reaMh+WumuS9jee9rueahOS4gOS4quaVsOe7hOi9rOaNouaIkOWPr+inguWvn+mbhuWQiFxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgb2JzZXJ2ZShvYmplY3Q6IG9iamVjdCwgcGF0aDogc3RyaW5nW10pOiB2b2lkO1xyXG4gICAgc3RhdGljIG9ic2VydmUodmFsdWU6IGFueSwgcGF0aD86IGFueSk6IGFueSB7XHJcbiAgICAgICAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGVTZXQodmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBwYXRoKSB7XHJcbiAgICAgICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDAsIGVuZCA9IHBhdGgubGVuZ3RoIC0gMTsgaW5kZXggPCBlbmQ7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZVtwYXRoW2luZGV4XV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YWx1ZVtwYXRoW3BhdGgubGVuZ3RoIC0gMV1dID0gbmV3IE9ic2VydmFibGVTZXQodmFsdWVbcGF0aFtwYXRoLmxlbmd0aCAtIDFdXSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIOWxnuaAp1xyXG5cclxuICAgIHByb3RlY3RlZCBfb25BZGQ6IFNldDwodmFsdWU6IFQpID0+IHZvaWQ+ID0gbmV3IFNldCgpO1xyXG4gICAgcHJvdGVjdGVkIF9vblJlbW92ZTogU2V0PCh2YWx1ZTogVCkgPT4gdm9pZD4gPSBuZXcgU2V0KCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IodmFsdWU6IE9ic2VydmFibGVTZXQ8VD4gfCBTZXQ8VD4gfCBUW10pIHtcclxuICAgICAgICBzdXBlcih2YWx1ZSBhcyBhbnkpO1xyXG5cclxuICAgICAgICBpZiAodGhpcyAhPT0gdmFsdWUpXHJcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gbmV3IFNldCh2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpm4blkIjlhYPntKDkuKrmlbBcclxuICAgICAqL1xyXG4gICAgZ2V0IHNpemUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlLnNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIHRvSlNPTlxyXG5cclxuICAgIHByb3RlY3RlZCB0b0pTT04oKTogYW55IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXJpYWxpemFibGUgPyBbLi4udGhpcy5fdmFsdWVdIDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiDkuovku7bnu5Hlrprmlrnms5VcclxuXHJcbiAgICAvKipcclxuICAgICAqIOW9k+iuvue9ruWAvOeahOaXtuWAmeinpuWPkVxyXG4gICAgICovXHJcbiAgICBvbihldmVudDogJ3NldCcsIGNhbGxiYWNrOiAobmV3VmFsdWU6IFNldDxUPiwgb2xkVmFsdWU6IFNldDxUPikgPT4gdm9pZCk6IHZvaWQ7XHJcbiAgICAvKipcclxuICAgICAqIOWcqOWAvOWPkeeUn+aUueWPmOS5i+WJjeinpuWPke+8jOi/lOWbnnZvaWTmiJZ0cnVl6KGo56S65ZCM5oSP5pu05pS577yM6L+U5ZueZmFsc2XooajnpLrpmLvmraLmm7TmlLnjgILms6jmhI/vvJror6Xlm57osIPlj6rlhYHorrjorr7nva7kuIDkuKrvvIzph43lpI3orr7nva7lsIbopobnm5bkuYvliY3nmoTlm57osINcclxuICAgICAqL1xyXG4gICAgb24oZXZlbnQ6ICdiZWZvcmVTZXQnLCBjYWxsYmFjazogKG5ld1ZhbHVlOiBTZXQ8VD4sIG9sZFZhbHVlOiBTZXQ8VD4sIG9TZXQ6IHRoaXMpID0+IGJvb2xlYW4pOiB2b2lkO1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvZPlkJHpm4blkIjkuK3mt7vliqDlhYPntKDml7bop6blj5FcclxuICAgICAqL1xyXG4gICAgb24oZXZlbnQ6ICdhZGQnLCBjYWxsYmFjazogKHZhbHVlOiBUKSA9PiB2b2lkKTogdm9pZDtcclxuICAgIC8qKlxyXG4gICAgICog5b2T5Yig6Zmk6ZuG5ZCI5Lit5YWD57Sg5pe26Kem5Y+RXHJcbiAgICAgKi9cclxuICAgIG9uKGV2ZW50OiAncmVtb3ZlJywgY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gdm9pZCk6IHZvaWQ7XHJcbiAgICBvbihldmVudDogYW55LCBjYWxsYmFjazogYW55KTogYW55IHtcclxuICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2FkZCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkFkZC5hZGQoY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdyZW1vdmUnOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25SZW1vdmUuYWRkKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHN1cGVyLm9uKGV2ZW50LCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvbmNlKGV2ZW50OiAnc2V0JywgY2FsbGJhY2s6IChuZXdWYWx1ZTogU2V0PFQ+LCBvbGRWYWx1ZTogU2V0PFQ+KSA9PiB2b2lkKTogdm9pZDtcclxuICAgIG9uY2UoZXZlbnQ6ICdiZWZvcmVTZXQnLCBjYWxsYmFjazogKG5ld1ZhbHVlOiBTZXQ8VD4sIG9sZFZhbHVlOiBTZXQ8VD4sIG9TZXQ6IHRoaXMpID0+IGJvb2xlYW4pOiB2b2lkO1xyXG4gICAgb25jZShldmVudDogJ2FkZCcsIGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IHZvaWQpOiB2b2lkO1xyXG4gICAgb25jZShldmVudDogJ3JlbW92ZScsIGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IHZvaWQpOiB2b2lkO1xyXG4gICAgb25jZShldmVudDogYW55LCBjYWxsYmFjazogYW55KTogYW55IHtcclxuICAgICAgICBzdXBlci5vbmNlKGV2ZW50LCBjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgb2ZmKGV2ZW50OiAnc2V0JywgY2FsbGJhY2s/OiAobmV3VmFsdWU6IFNldDxUPiwgb2xkVmFsdWU6IFNldDxUPikgPT4gdm9pZCk6IHZvaWQ7XHJcbiAgICBvZmYoZXZlbnQ6ICdiZWZvcmVTZXQnLCBjYWxsYmFjaz86IChuZXdWYWx1ZTogU2V0PFQ+LCBvbGRWYWx1ZTogU2V0PFQ+LCBvU2V0OiB0aGlzKSA9PiBib29sZWFuKTogdm9pZDtcclxuICAgIG9mZihldmVudDogJ2FkZCcsIGNhbGxiYWNrPzogKHZhbHVlOiBUKSA9PiB2b2lkKTogdm9pZDtcclxuICAgIG9mZihldmVudDogJ3JlbW92ZScsIGNhbGxiYWNrPzogKHZhbHVlOiBUKSA9PiB2b2lkKTogdm9pZDtcclxuICAgIG9mZihldmVudDogYW55LCBjYWxsYmFjazogYW55KTogYW55IHtcclxuICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2FkZCc6XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA/IHRoaXMuX29uQWRkLmRlbGV0ZShjYWxsYmFjaykgOiB0aGlzLl9vbkFkZC5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdyZW1vdmUnOlxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPyB0aGlzLl9vblJlbW92ZS5kZWxldGUoY2FsbGJhY2spIDogdGhpcy5fb25SZW1vdmUuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHN1cGVyLm9mZihldmVudCwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiDpm4blkIjkv67mlLnmk43kvZzmlrnms5VcclxuXHJcbiAgICAvKipcclxuICAgICAqIOeUqOadpea4heepuuS4gOS4qiBTZXQg5a+56LGh5Lit55qE5omA5pyJ5YWD57Sg44CCXHJcbiAgICAgKi9cclxuICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnJlYWRvbmx5KVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOWwneivleS/ruaUueS4gOS4quWPquivu+eahCAke3RoaXMuY29uc3RydWN0b3IubmFtZX1gKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuX29uUmVtb3ZlLnNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWUuZGVsZXRlKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29uUmVtb3ZlLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2sodmFsdWUpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDku47kuIDkuKogU2V0IOWvueixoeS4reWIoOmZpOaMh+WumueahOWFg+e0oOOAglxyXG4gICAgICovXHJcbiAgICBkZWxldGUodmFsdWU6IFQpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5yZWFkb25seSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDlsJ3or5Xkv67mlLnkuIDkuKrlj6ror7vnmoQgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9YCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9vblJlbW92ZS5zaXplID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl92YWx1ZS5kZWxldGUodmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0KSB0aGlzLl9vblJlbW92ZS5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKHZhbHVlKSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZS5kZWxldGUodmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog55So5p2l5ZCR5LiA5LiqIFNldCDlr7nosaHnmoTmnKvlsL7mt7vliqDkuIDkuKrmjIflrprnmoTlgLzjgIJcclxuICAgICAqL1xyXG4gICAgYWRkKHZhbHVlOiBUKTogdGhpcyB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVhZG9ubHkpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihg5bCd6K+V5L+u5pS55LiA5Liq5Y+q6K+755qEICR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfWApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fb25BZGQuc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl92YWx1ZS5oYXModmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZS5hZGQodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25BZGQuZm9yRWFjaChjYWxsYmFjayA9PiBjYWxsYmFjayh2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlLmFkZCh2YWx1ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiDpm4blkIjor7vlj5bmk43kvZzmlrnms5VcclxuXHJcbiAgICAvKipcclxuICAgICAqIOi/lOWbnuS4gOS4quaWsOeahOWMheWQqyBbdmFsdWUsIHZhbHVlXSDlr7nnmoQgSXRlcmF0b3Ig5a+56LGh77yM6L+U5Zue55qE6L+t5Luj5Zmo55qE6L+t5Luj6aG65bqP5LiOIFNldCDlr7nosaHnmoTmj5LlhaXpobrluo/nm7jlkIzjgIJcclxuICAgICAqL1xyXG4gICAgZW50cmllcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWUuZW50cmllcygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u6ZuG5ZCI5Lit5YWD57Sg55qE6aG65bqP77yM5a+55q+P5Liq5YWD57Sg6YO95omn6KGM5o+Q5L6b55qEIGNhbGxiYWNrIOWHveaVsOS4gOasoeOAglxyXG4gICAgICovXHJcbiAgICBmb3JFYWNoKGNhbGxiYWNrZm46ICh2YWx1ZTogVCwgdmFsdWUyOiBULCBzZXQ6IFNldDxUPikgPT4gdm9pZCwgdGhpc0FyZz86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDov5Tlm57kuIDkuKrluIPlsJTlgLzmnaXmjIfnpLrlr7nlupTnmoTlgLx2YWx1ZeaYr+WQpuWtmOWcqFNldOWvueixoeS4rVxyXG4gICAgICovXHJcbiAgICBoYXModmFsdWU6IFQpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWUuaGFzKHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOihjOS4uuS4jiB2YWx1ZSDmlrnms5XlrozlhajkuIDoh7TvvIzov5Tlm54gU2V0IOWvueixoeeahOWFg+e0oOOAglxyXG4gICAgICovXHJcbiAgICBrZXlzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZS5rZXlzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDov5Tlm57kuIDkuKogSXRlcmF0b3IgIOWvueixoe+8jOi/meS4quWvueixoeS7peaPkuWFpVNldCDlr7nosaHnmoTpobrluo/ljIXlkKvkuobljp8gU2V0IOWvueixoemHjOeahOavj+S4quWFg+e0oOOAglxyXG4gICAgICovXHJcbiAgICB2YWx1ZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlLnZhbHVlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI2VuZHJlZ2lvblxyXG59Il19
