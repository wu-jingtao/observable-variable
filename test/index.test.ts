/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable max-lines-per-function */

import _ from 'lodash';
import expect from 'expect.js';
import { oVar, oArr, oMap, oSet, watch, type ObservableArray } from '../src';

describe('测试 ObservableVariable', function () {
    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    it('测试创建 ObservableVariable', function () {
        const testData = ['test'];
        const variable = oVar(testData);

        expect(variable.value).to.be(testData);

        // @ts-expect-error
        expect(variable._serializable).to.be(true);
        // @ts-expect-error
        expect(variable._ensureChange).to.be(true);
        // @ts-expect-error
        expect(variable._deepCompare).to.be(false);
    });

    it('测试重复创建 ObservableVariable', function () {
        const testData = ['test'];
        const variable1 = oVar(testData, { serializable: false, ensureChange: false, deepCompare: true });
        const variable2 = oVar(variable1, { serializable: true, ensureChange: true, deepCompare: false });

        expect(variable1).to.be(variable2);
        expect(variable2.value).to.be(testData);

        // @ts-expect-error
        expect(variable1._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable1._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable1._deepCompare).to.be(true);
        // @ts-expect-error
        expect(variable2._serializable).to.be(false);
        // @ts-expect-error
        expect(variable2._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable2._deepCompare).to.be(true);
    });

    describe('测试 事件绑定', function () {
        it('测试 set', function () {
            const o1 = oVar('a');
            const o2 = oVar(['a']);
            const o3 = oVar('a', { ensureChange: false });
            const o4 = oVar(['a'], { deepCompare: true });

            function callback_on(...args: any[]): void { testResult.push('on', ...args) }
            function callback_once(...args: any[]): void { testResult.push('once', ...args) }

            o1.on('set', callback_on);
            o1.once('set', callback_once);
            o2.on('set', callback_on);
            o2.once('set', callback_once);
            o3.on('set', callback_on);
            o3.once('set', callback_once);
            o4.on('set', callback_on);
            o4.once('set', callback_once);

            o1.value = 'a';
            o1.value = 'b';
            o1.value = 'c';

            o2.value = ['a'];
            o2.value = ['b'];
            o2.value = ['c'];

            o3.value = 'a';
            o3.value = 'b';
            o3.value = 'c';

            o4.value = ['a'];
            o4.value = ['b'];
            o4.value = ['c'];

            expect(testResult).to.eql([
                'on', 'b', 'a', o1, 'once', 'b', 'a', o1,
                'on', 'c', 'b', o1,

                'on', ['a'], ['a'], o2, 'once', ['a'], ['a'], o2,
                'on', ['b'], ['a'], o2,
                'on', ['c'], ['b'], o2,

                'on', 'a', 'a', o3, 'once', 'a', 'a', o3,
                'on', 'b', 'a', o3,
                'on', 'c', 'b', o3,

                'on', ['b'], ['a'], o4, 'once', ['b'], ['a'], o4,
                'on', ['c'], ['b'], o4
            ]);
        });

        it('测试 beforeSet', function () {
            const o1 = oVar('a');

            o1.on('set', (...args: any[]) => testResult.push('set', ...args));
            o1.on('beforeSet', (...args: any[]) => { testResult.push('beforeSet', ...args); return args[0] });

            o1.value = 'a';
            o1.value = 'b';

            o1.on('beforeSet', (...args: any[]) => { testResult.push('beforeSet2', ...args); return args[1] });
            o1.value = 'c';

            expect(testResult).to.eql([
                'beforeSet', 'a', 'a', o1,
                'beforeSet', 'b', 'a', o1, 'set', 'b', 'a', o1,
                'beforeSet2', 'c', 'b', o1
            ]);
        });
    });

    it('测试 toJSON', function () {
        const testData1 = { ov: oVar('ov') };
        const testData2 = { ov: oVar('ov', { serializable: false }) };

        expect(JSON.stringify(testData1)).to.be('{"ov":"ov"}');
        expect(JSON.stringify(testData2)).to.be('{}');
    });
});

describe('测试 ObservableSet', function () {
    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    it('测试创建 ObservableSet', function () {
        const testData = ['test1', 'test2'];
        const variable = oSet(testData);

        expect(variable.value).to.be.a(Set);
        expect([...variable.value]).to.eql(testData);

        // @ts-expect-error
        expect(variable._serializable).to.be(true);
        // @ts-expect-error
        expect(variable._ensureChange).to.be(true);
        // @ts-expect-error
        expect(variable._deepCompare).to.be(false);
    });

    it('测试重复创建 ObservableSet', function () {
        const testData = ['test1', 'test2'];
        const variable1 = oSet(testData, { serializable: false, ensureChange: false, deepCompare: true });
        const variable2 = oSet(variable1, { serializable: true, ensureChange: true, deepCompare: false });

        expect(variable1).to.be(variable2);
        expect([...variable2.value]).to.eql(testData);

        // @ts-expect-error
        expect(variable1._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable1._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable1._deepCompare).to.be(true);
        // @ts-expect-error
        expect(variable2._serializable).to.be(false);
        // @ts-expect-error
        expect(variable2._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable2._deepCompare).to.be(true);
    });

    describe('测试 事件绑定', function () {
        it('测试 add', function () {
            const o1 = oSet([1]);

            o1.on('add', (...args: any[]) => testResult.push(...args));
            o1.once('add', (...args: any[]) => testResult.push(...args));

            o1.add(2);
            o1.add(3);

            expect(testResult).to.eql([2, o1, 2, o1, 3, o1]);
        });

        it('测试 delete', function () {
            const o1 = oSet([1, 2, 3]);

            o1.on('delete', (...args: any[]) => testResult.push(...args));
            o1.once('delete', (...args: any[]) => testResult.push(...args));

            o1.delete(3);
            o1.delete(2);

            expect(testResult).to.eql([3, o1, 3, o1, 2, o1]);
        });
    });

    it('测试 size 属性', function () {
        const os = oSet(['os', 'os']);

        expect(os.size).to.be(1);
    });

    it('测试 toJSON', function () {
        const testData1 = { os: oSet(['os', 'os']) };
        const testData2 = { os: oSet(['os', 'os'], { serializable: false }) };

        expect(JSON.stringify(testData1)).to.be('{"os":["os"]}');
        expect(JSON.stringify(testData2)).to.be('{}');
    });

    describe('测试 修改操作方法', function () {
        it('测试 clear', function () {
            const obj = oSet([1, 2]);
            obj.on('delete', value => testResult.push(value));

            obj.clear();

            expect(obj.value.size).to.be(0);
            expect(testResult).to.eql([1, 2]);
        });

        it('测试 delete', function () {
            const obj = oSet([1]);
            obj.on('delete', value => testResult.push(value));

            expect(obj.delete(1)).to.be(true);
            expect(obj.delete(1)).to.be(false);
            expect(obj.delete(2)).to.be(false);

            expect(obj.value.size).to.be(0);
            expect(testResult).to.eql([1]);
        });

        it('测试 add', function () {
            const obj = oSet([1]);
            obj.on('add', value => testResult.push(value));

            expect(obj.add(1)).to.be(obj);
            expect(obj.add(2)).to.be(obj);

            expect(obj.value.size).to.be(2);
            expect(testResult).to.eql([2]);
        });
    });

    describe('测试 读取操作方法', function () {
        const testData = ['test1', 'test2'];
        const variable = oSet(testData);

        it('测试 entries', function () {
            expect(variable.entries()).to.eql(variable.value.entries());
        });

        it('测试 forEach', function () {
            const testResult: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            variable.forEach(function (value, value2, set) { testResult.push(value, value2, set, this) }, _this);
            variable.value.forEach(function (this: object, value, value2, set) { testResult2.push(value, value2, set, this) }, _this);

            expect(testResult).to.eql(testResult2);
        });

        it('测试 has', function () {
            expect(variable.has('test1')).to.be(variable.value.has('test1'));
            expect(variable.has('test2')).to.be(variable.value.has('test2'));
            expect(variable.has('test3')).to.be(variable.value.has('test3'));
        });

        it('测试 keys', function () {
            expect(variable.keys()).to.eql(variable.value.keys());
        });

        it('测试 values', function () {
            expect(variable.values()).to.eql(variable.value.values());
        });

        it('测试 [Symbol.iterator]', function () {
            expect([...variable]).to.eql([...variable.value]);
        });
    });

    describe('测试 集合运算方法', function () {
        const testData_1 = ['test1', 'test2', 'test3'];
        const testData_2 = ['test1', 'test2', 'test4'];
        const variable_1 = oSet(testData_1);
        const variable_2 = oSet(testData_2);

        it('测试 difference', function () {
            expect(variable_1.difference(variable_2)).to.eql(variable_1.value.difference(variable_2.value));
        });

        it('测试 intersection', function () {
            expect(variable_1.intersection(variable_2)).to.eql(variable_1.value.intersection(variable_2.value));
        });

        it('测试 union', function () {
            expect(variable_1.union(variable_2)).to.eql(variable_1.value.union(variable_2.value));
        });

        it('测试 symmetricDifference', function () {
            expect(variable_1.symmetricDifference(variable_2)).to.eql(variable_1.value.symmetricDifference(variable_2.value));
        });

        it('测试 isDisjointFrom', function () {
            expect(variable_1.isDisjointFrom(variable_2)).to.be(false);
            expect(variable_1.value.isDisjointFrom(variable_2.value)).to.be(false);
        });

        it('测试 isSubsetOf', function () {
            expect(variable_1.isSubsetOf(variable_2)).to.be(false);
            expect(variable_1.value.isSubsetOf(variable_2.value)).to.be(false);
        });

        it('测试 isSupersetOf', function () {
            expect(variable_1.isSupersetOf(variable_2)).to.be(false);
            expect(variable_1.value.isSupersetOf(variable_2.value)).to.be(false);
        });
    });
});

describe('测试 ObservableMap', function () {
    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    it('测试创建 ObservableMap', function () {
        const testData = [['key', 123]] as [string, number][];
        const variable = oMap(testData);

        expect(variable.value).to.be.a(Map);
        expect([...variable.value]).to.eql(testData);

        // @ts-expect-error
        expect(variable._serializable).to.be(true);
        // @ts-expect-error
        expect(variable._ensureChange).to.be(true);
        // @ts-expect-error
        expect(variable._deepCompare).to.be(false);
    });

    it('测试重复创建 ObservableMap', function () {
        const testData = [['key', 123]] as [string, number][];
        const variable1 = oMap(testData, { serializable: false, ensureChange: false, deepCompare: true });
        const variable2 = oMap(variable1, { serializable: true, ensureChange: true, deepCompare: false });

        expect(variable1).to.be(variable2);
        expect([...variable2.value]).to.eql(testData);

        // @ts-expect-error
        expect(variable1._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable1._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable1._deepCompare).to.be(true);
        // @ts-expect-error
        expect(variable2._serializable).to.be(false);
        // @ts-expect-error
        expect(variable2._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable2._deepCompare).to.be(true);
    });

    describe('测试 事件绑定', function () {
        it('测试 add', function () {
            const o1 = oMap([]);

            o1.on('add', (...args: any[]) => testResult.push(...args));
            o1.once('add', (...args: any[]) => testResult.push(...args));

            o1.set('k1', 'v1');
            o1.set('k2', 'v2');

            expect(testResult).to.eql(['v1', 'k1', o1, 'v1', 'k1', o1, 'v2', 'k2', o1]);
        });

        it('测试 delete', function () {
            const o1 = oMap([['k1', 'v1'], ['k2', 'v2']]);

            o1.on('delete', (...args: any[]) => testResult.push(...args));
            o1.once('delete', (...args: any[]) => testResult.push(...args));

            o1.delete('k1');
            o1.delete('k2');

            expect(testResult).to.eql(['v1', 'k1', o1, 'v1', 'k1', o1, 'v2', 'k2', o1]);
        });

        it('测试 update', function () {
            const o1 = oMap([['k1', 'v1'], ['k2', 'v2'], ['k3', 'v3']]);
            const o2 = oMap([['k1', 'v1'], ['k2', 'v2'], ['k3', 'v3']], { ensureChange: false });
            const o3 = oMap([['k1', ['v1']], ['k2', ['v2']], ['k3', ['v3']]], { deepCompare: true });

            function callback(...args: any[]): void { testResult.push(...args) }

            o1.on('update', callback);
            o1.once('update', callback);
            o2.on('update', callback);
            o2.once('update', callback);
            o3.on('update', callback);
            o3.once('update', callback);

            o1.set('k1', 'v1');
            o1.set('k2', 'v1');
            o1.set('k3', 'v2');
            o2.set('k1', 'v1');
            o2.set('k2', 'v1');
            o2.set('k3', 'v2');
            o3.set('k1', ['v1']);
            o3.set('k2', ['v1']);
            o3.set('k3', ['v2']);

            expect(testResult).to.eql([
                'v1', 'v2', 'k2', o1, 'v1', 'v2', 'k2', o1,
                'v2', 'v3', 'k3', o1,
                'v1', 'v1', 'k1', o2, 'v1', 'v1', 'k1', o2,
                'v1', 'v2', 'k2', o2,
                'v2', 'v3', 'k3', o2,
                ['v1'], ['v2'], 'k2', o3, ['v1'], ['v2'], 'k2', o3,
                ['v2'], ['v3'], 'k3', o3
            ]);
        });

        it('测试 beforeUpdate', function () {
            const o1 = oMap([['k1', 'v1'], ['k2', 'v2'], ['k3', 'v3']]);

            o1.on('update', (...args: any[]) => testResult.push('update', ...args));
            o1.on('beforeUpdate', (...args: any[]) => { testResult.push('beforeUpdate', ...args); return args[0] });

            o1.set('k1', 'v1');
            o1.set('k2', 'v1');

            o1.on('beforeUpdate', (...args: any[]) => { testResult.push('beforeUpdate2', ...args); return args[1] });

            o1.set('k3', 'v2');

            expect(testResult).to.eql([
                'beforeUpdate', 'v1', 'v1', 'k1', o1,
                'beforeUpdate', 'v1', 'v2', 'k2', o1, 'update', 'v1', 'v2', 'k2', o1,
                'beforeUpdate2', 'v2', 'v3', 'k3', o1
            ]);
        });
    });

    it('测试 toJSON', function () {
        const testData1 = { om: oMap([['om', 123], ['om', 456]]) };
        const testData2 = { om: oMap([['om', 123], ['om', 456]], { serializable: false }) };

        expect(JSON.stringify(testData1)).to.be('{"om":[["om",456]]}');
        expect(JSON.stringify(testData2)).to.be('{}');
    });

    it('测试 size属性', function () {
        const om = oMap([['om', 123], ['om', 456]]);

        expect(om.size).to.be(1);
    });

    describe('测试 修改操作方法', function () {
        it('测试 clear', function () {
            const obj = oMap([['a', 1], ['b', 2]]);
            obj.on('delete', (value, key) => testResult.push(key, value));

            obj.clear();

            expect(obj.value.size).to.be(0);
            expect(testResult).to.eql(['a', 1, 'b', 2]);
        });

        it('测试 delete', function () {
            const obj = oMap([['a', 1]]);
            obj.on('delete', (value, key) => testResult.push(key, value));

            expect(obj.delete('a')).to.be(true);
            expect(obj.delete('a')).to.be(false);
            expect(obj.delete('b')).to.be(false);

            expect(obj.value.size).to.be(0);
            expect(testResult).to.eql(['a', 1]);
        });

        it('测试 set', function () {
            const obj = oMap([['a', 1]]);
            obj.on('add', (value, key) => testResult.push('add', key, value));
            obj.on('update', (newValue, oldValue, key) => testResult.push('update', key, newValue, oldValue));
            obj.on('beforeUpdate', (newValue, oldValue, key) => { testResult.push('beforeUpdate', key, newValue, oldValue); return newValue });

            expect(obj.set('a', 2)).to.be(obj);
            expect(obj.set('b', 3)).to.be(obj);

            expect(obj.value.size).to.be(2);
            expect(obj.value.get('a')).to.be(2);
            expect(testResult).to.eql([
                'beforeUpdate', 'a', 2, 1, 'update', 'a', 2, 1,
                'add', 'b', 3
            ]);
        });
    });

    describe('测试 读取操作方法', function () {
        const testData = [['key', 123]] as [string, number][];
        const variable = oMap(testData);

        it('测试 entries', function () {
            expect(variable.entries()).to.eql(variable.value.entries());
        });

        it('测试 forEach', function () {
            const testResult: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            variable.forEach(function (value, key, map) { testResult.push(value, key, map, this) }, _this);
            variable.value.forEach(function (this: object, value, key, map) { testResult2.push(value, key, map, this) }, _this);

            expect(testResult).to.eql(testResult2);
        });

        it('测试 get', function () {
            expect(variable.get('key')).to.be(variable.value.get('key'));
            expect(variable.get('key2')).to.be(variable.value.get('key2'));
        });

        it('测试 has', function () {
            expect(variable.has('key')).to.be(variable.value.has('key'));
            expect(variable.has('key2')).to.be(variable.value.has('key2'));
        });

        it('测试 keys', function () {
            expect(variable.keys()).to.eql(variable.value.keys());
        });

        it('测试 values', function () {
            expect(variable.values()).to.eql(variable.value.values());
        });

        it('测试 [Symbol.iterator]', function () {
            expect([...variable]).to.eql([...variable.value]);
        });
    });
});

describe('测试 ObservableArray', function () {
    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    it('测试创建 ObservableArray', function () {
        const testData = ['test1', 'test2'];
        const variable = oArr(testData);

        expect(variable.value).to.be.a(Array);
        expect([...variable.value]).to.eql(testData);

        // @ts-expect-error
        expect(variable._serializable).to.be(true);
        // @ts-expect-error
        expect(variable._ensureChange).to.be(true);
        // @ts-expect-error
        expect(variable._deepCompare).to.be(false);
    });

    it('测试重复创建 ObservableArray', function () {
        const testData = ['test1', 'test2'];
        const variable1 = oArr(testData, { serializable: false, ensureChange: false, deepCompare: true });
        const variable2 = oArr(variable1, { serializable: true, ensureChange: true, deepCompare: false });

        expect(variable1).to.be(variable2);
        expect([...variable2.value]).to.eql(testData);

        // @ts-expect-error
        expect(variable1._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable1._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable1._deepCompare).to.be(true);
        // @ts-expect-error
        expect(variable2._serializable).to.be(false);
        // @ts-expect-error
        expect(variable2._ensureChange).to.be(false);
        // @ts-expect-error
        expect(variable2._deepCompare).to.be(true);
    });

    describe('测试 事件绑定', function () {
        it('测试 add', function () {
            const o1 = oArr([1]);

            o1.on('add', (...args: any[]) => testResult.push(...args));
            o1.once('add', (...args: any[]) => testResult.push(...args));

            o1.push(2, 3);

            expect(testResult).to.eql([2, 1, o1, 2, 1, o1, 3, 2, o1]);
        });

        it('测试 delete', function () {
            const o1 = oArr([1, 2, 3]);

            o1.on('delete', (...args: any[]) => testResult.push(...args));
            o1.once('delete', (...args: any[]) => testResult.push(...args));

            o1.length = 1;

            expect(testResult).to.eql([2, 1, o1, 2, 1, o1, 3, 1, o1]);
        });

        it('测试 update', function () {
            const o1 = oArr([1, 2, 3]);
            const o2 = oArr([1, 2, 3], { ensureChange: false });
            const o3 = oArr([[1], [2], [3]], { deepCompare: true });

            function callback(...args: any[]): void { testResult.push(...args) }

            o1.on('update', callback);
            o1.once('update', callback);
            o2.on('update', callback);
            o2.once('update', callback);
            o3.on('update', callback);
            o3.once('update', callback);

            o1.set(0, 1);
            o1.set(1, 1);
            o1.set(2, 2);
            o2.set(0, 1);
            o2.set(1, 1);
            o2.set(2, 2);
            o3.set(0, [1]);
            o3.set(1, [1]);
            o3.set(2, [2]);

            expect(testResult).to.eql([
                1, 2, 1, o1, 1, 2, 1, o1,
                2, 3, 2, o1,
                1, 1, 0, o2, 1, 1, 0, o2,
                1, 2, 1, o2,
                2, 3, 2, o2,
                [1], [2], 1, o3, [1], [2], 1, o3,
                [2], [3], 2, o3
            ]);
        });

        it('测试 beforeUpdate', function () {
            const o1 = oArr([1, 2, 3]);

            o1.on('update', (...args: any[]) => testResult.push('update', ...args));
            o1.on('beforeUpdate', (...args: any[]) => { testResult.push('beforeUpdate', ...args); return args[0] });

            o1.set(0, 1);
            o1.set(1, 1);

            o1.on('beforeUpdate', (...args: any[]) => { testResult.push('beforeUpdate2', ...args); return args[1] });

            o1.set(2, 2);

            expect(testResult).to.eql([
                'beforeUpdate', 1, 1, 0, o1,
                'beforeUpdate', 1, 2, 1, o1, 'update', 1, 2, 1, o1,
                'beforeUpdate2', 2, 3, 2, o1
            ]);
        });
    });

    it('测试 toJSON', function () {
        const testData1 = { oa: oArr(['oa']) };
        const testData2 = { oa: oArr(['oa'], { serializable: false }) };

        expect(JSON.stringify(testData1)).to.be('{"oa":["oa"]}');
        expect(JSON.stringify(testData2)).to.be('{}');
    });

    it('测试 first 与 last 属性', function () {
        const oa = oArr([1, 2, 3]);

        expect(oa.first).to.be(1);
        expect(oa.last).to.be(3);
    });

    it('测试 length 属性', function () {
        const oa = oArr([1, 2]);
        oa.on('add', (...args: any[]) => testResult.push(...args, 'add'));
        oa.on('delete', (...args: any[]) => testResult.push(...args, 'delete'));

        expect(() => oa.length = -1).to.throwException(/Invalid array length/);
        expect(() => oa.length = 2 ** 32).to.throwException(/Invalid array length/);
        expect(() => oa.length = 1.1).to.throwException(/Invalid array length/);

        expect(oa.length).to.be(2);

        oa.length = 5;
        expect(oa.length).to.be(5);

        oa.length = 0;
        expect(oa.length).to.be(0);

        expect(testResult).to.eql([
            1, 0, oa, 'delete',
            2, 0, oa, 'delete',
        ]);
    });

    describe('测试 修改操作方法', function () {
        it('测试 set', function () {
            const obj = oArr([1]);
            obj.on('add', (value, index) => testResult.push('add', value, index));
            obj.on('update', (newValue, oldValue, index) => testResult.push('update', newValue, oldValue, index));
            obj.on('beforeUpdate', (newValue, oldValue, index) => { testResult.push('beforeUpdate', newValue, oldValue, index); return newValue });

            expect(obj.set(0, 1)).to.be(false);
            expect(obj.set(0, 2)).to.be(true);
            expect(obj.set(1, 3)).to.be(true);
            expect(obj.set(4, 5)).to.be(true);
            expect(obj.set(-1, 6)).to.be(true);
            expect(obj.set(-2, 4)).to.be(true);
            expect(obj.set(-10, 7)).to.be(false);

            expect(obj.value).to.eql([2, 3, , 4, 6]); // eslint-disable-line
            expect(testResult).to.eql([
                'beforeUpdate', 1, 1, 0,
                'beforeUpdate', 2, 1, 0, 'update', 2, 1, 0,
                'add', 3, 1,
                'add', 5, 4,
                'beforeUpdate', 6, 5, 4, 'update', 6, 5, 4,
                'add', 4, 3,
            ]);
        });

        it('测试 delete', function () {
            const obj = oArr([1, 1, 2, 2]);
            obj.on('delete', (value, index) => testResult.push(value, index));

            expect(obj.delete(1)).to.be(true);
            expect(obj.delete(2)).to.be(true);
            expect(obj.value).to.eql([1, 2]);

            expect(obj.delete(1)).to.be(true);
            expect(obj.delete(2)).to.be(true);
            expect(obj.value.length).to.be(0);

            expect(obj.delete(1)).to.be(false);
            expect(obj.delete(2)).to.be(false);

            expect(testResult).to.eql([
                1, 0,
                2, 1,
                1, 0,
                2, 0
            ]);
        });

        it('测试 deleteAll', function () {
            const obj = oArr([1, 1, 2, 2]);
            obj.on('delete', (value, index) => testResult.push(value, index));

            expect(obj.deleteAll(1)).to.be(2);
            expect(obj.deleteAll(2)).to.be(2);

            expect(obj.value.length).to.be(0);

            expect(obj.deleteAll(1)).to.be(0);
            expect(obj.deleteAll(2)).to.be(0);

            expect(testResult).to.eql([
                1, 0, 1, 0,
                2, 0, 2, 0
            ]);
        });

        it('测试 pop', function () {
            const obj = oArr([, null, undefined, 1, 2, ,]); // eslint-disable-line
            obj.on('delete', (value, index) => testResult.push(value, index));

            expect(obj.pop()).to.be(undefined);
            expect(obj.pop()).to.be(2);
            expect(obj.pop()).to.be(1);
            expect(obj.pop()).to.be(undefined);
            expect(obj.pop()).to.be(null);
            expect(obj.pop()).to.be(undefined);
            expect(obj.value.length).to.be(0);
            expect(testResult).to.eql([
                2, 4,
                1, 3,
                undefined, 2,
                null, 1
            ]);
        });

        it('测试 push', function () {
            const obj = oArr<number>([]);
            obj.on('add', (value, index) => testResult.push(value, index));

            expect(obj.push(1)).to.be(1);
            expect(obj.push(2)).to.be(2);
            expect(obj.push(3, 4)).to.be(4);
            expect(obj.value.length).to.be(4);
            expect(obj.value).to.eql([1, 2, 3, 4]);
            expect(testResult).to.eql([
                1, 0,
                2, 1,
                3, 2,
                4, 3
            ]);
        });

        it('测试 shift', function () {
            const obj = oArr([, null, undefined, 1, 2, ,]); // eslint-disable-line
            obj.on('delete', (value, index) => testResult.push(value, index));

            expect(obj.shift()).to.be(undefined);
            expect(obj.shift()).to.be(null);
            expect(obj.shift()).to.be(undefined);
            expect(obj.shift()).to.be(1);
            expect(obj.shift()).to.be(2);
            expect(obj.shift()).to.be(undefined);
            expect(obj.value.length).to.be(0);
            expect(testResult).to.eql([
                null, 0,
                undefined, 0,
                1, 0,
                2, 0
            ]);
        });

        it('测试 unshift', function () {
            const obj = oArr<number>([]);
            obj.on('add', (value, index) => testResult.push(value, index));

            expect(obj.unshift(1)).to.be(1);
            expect(obj.unshift(2)).to.be(2);
            expect(obj.unshift(3, 4)).to.be(4);
            expect(obj.value.length).to.be(4);
            expect(obj.value).to.eql([3, 4, 2, 1]);
            expect(testResult).to.eql([
                1, 0,
                2, 0,
                3, 0,
                4, 1
            ]);
        });

        describe('测试 splice', function () {
            it('测试 数组间不带空位', function () {
                function actual(): number[] {
                    return _.range(10);
                }

                const testArray = oArr(actual());
                testArray.on('add', (value, index) => testResult.push('add', value, index));
                testArray.on('delete', (value, index) => testResult.push('delete', value, index));
                testArray.on('update', (newValue, oldValue, index) => testResult.push('update', newValue, oldValue, index));
                testArray.on('beforeUpdate', (newValue, oldValue, index) => { testResult.push('beforeUpdate', newValue, oldValue, index); return newValue });

                function test(): ObservableArray<number> {
                    testArray.value = _.range(10);
                    return testArray;
                }

                expect(test().splice(0)).to.eql(actual().splice(0));
                expect(testArray.value).to.eql([]);

                expect(test().splice(0.9)).to.eql(actual().splice(0.9));
                expect(testArray.value).to.eql([]);

                expect(test().splice(5)).to.eql(actual().splice(5));
                expect(testArray.value).to.eql(_.range(5));

                expect(test().splice(999)).to.eql(actual().splice(999));
                expect(testArray.value).to.eql(actual());

                expect(test().splice(-0.9)).to.eql(actual().splice(-0.9));
                expect(testArray.value).to.eql([]);

                expect(test().splice(-5)).to.eql(actual().splice(-5));
                expect(testArray.value).to.eql(_.range(5));

                expect(test().splice(-999)).to.eql(actual().splice(-999));
                expect(testArray.value).to.eql([]);

                expect(test().splice(1, 0)).to.eql(actual().splice(1, 0));
                expect(testArray.value).to.eql(_.range(10));

                expect(test().splice(1, 0.9)).to.eql(actual().splice(1, 0.9));
                expect(testArray.value).to.eql(_.range(10));

                expect(test().splice(1, 1)).to.eql(actual().splice(1, 1));
                expect(testArray.value).to.eql([0, 2, 3, 4, 5, 6, 7, 8, 9]);

                expect(test().splice(1, 100)).to.eql(actual().splice(1, 100));
                expect(testArray.value).to.eql([0]);

                expect(test().splice(1, -0.9)).to.eql(actual().splice(1, -0.9));
                expect(testArray.value).to.eql(_.range(10));

                expect(test().splice(1, -1)).to.eql(actual().splice(1, -1));
                expect(testArray.value).to.eql(_.range(10));

                expect(test().splice(1, -100)).to.eql(actual().splice(1, -100));
                expect(testArray.value).to.eql(_.range(10));

                expect(test().splice(1, 0, 1)).to.eql(actual().splice(1, 0, 1));
                expect(testArray.value).to.eql([0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

                expect(test().splice(1, 0, 2, 3, 4)).to.eql(actual().splice(1, 0, 2, 3, 4));
                expect(testArray.value).to.eql([0, 2, 3, 4, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

                expect(test().splice(-1, 0, 1)).to.eql(actual().splice(-1, 0, 1));
                expect(testArray.value).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 1, 9]);

                expect(test().splice(-1, 0, 2, 3, 4)).to.eql(actual().splice(-1, 0, 2, 3, 4));
                expect(testArray.value).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 9]);

                expect(test().splice(1, 2, 2, 2, 4)).to.eql(actual().splice(1, 2, 2, 2, 4));
                expect(testArray.value).to.eql([0, 2, 2, 4, 3, 4, 5, 6, 7, 8, 9]);

                expect(test().splice(1, 2, 9)).to.eql(actual().splice(1, 2, 9));
                expect(testArray.value).to.eql([0, 9, 3, 4, 5, 6, 7, 8, 9]);

                expect(testResult).to.eql([
                    ...actual().splice(0).flatMap(item => ['delete', item, 0]),
                    ...actual().splice(0.9).flatMap(item => ['delete', item, 0]),
                    ...actual().splice(5).flatMap(item => ['delete', item, 5]),
                    ...actual().splice(999).flatMap(item => ['delete', item, 999]),
                    ...actual().splice(-0.9).flatMap(item => ['delete', item, 0]),
                    ...actual().splice(-5).flatMap(item => ['delete', item, 5]),
                    ...actual().splice(-999).flatMap(item => ['delete', item, 0]),

                    ...actual().splice(1, 0).flatMap(item => ['delete', item, 1]),
                    ...actual().splice(1, 0.9).flatMap(item => ['delete', item, 1]),
                    ...actual().splice(1, 1).flatMap(item => ['delete', item, 1]),
                    ...actual().splice(1, 100).flatMap(item => ['delete', item, 1]),
                    ...actual().splice(1, -0.9).flatMap(item => ['delete', item, 1]),
                    ...actual().splice(1, -1).flatMap(item => ['delete', item, 1]),
                    ...actual().splice(1, -100).flatMap(item => ['delete', item, 1]),

                    'add', 1, 1,
                    'add', 2, 1, 'add', 3, 2, 'add', 4, 3,
                    'add', 1, 9,
                    'add', 2, 9, 'add', 3, 10, 'add', 4, 11,

                    'beforeUpdate', 2, 1, 1, 'update', 2, 1, 1, 'beforeUpdate', 2, 2, 2, 'add', 4, 3,
                    'beforeUpdate', 9, 1, 1, 'update', 9, 1, 1, 'delete', 2, 2,
                ]);
            });

            it('测试 数组间带空位', function () {
                const testArray = oArr([0, 1, 2, 3, , , , , 8, 9]); // eslint-disable-line
                testArray.on('delete', (value, index) => testResult.push(value, index));

                const tempResult = testArray.splice(0);
                expect(4 in tempResult).to.be(false);
                expect(5 in tempResult).to.be(false);
                expect(6 in tempResult).to.be(false);
                expect(7 in tempResult).to.be(false);

                expect(testResult).to.eql([0, 0, 1, 0, 2, 0, 3, 0, 8, 0, 9, 0]);
            });
        });

        it('测试 sort', function () {
            const obj = oArr([1, 4, 3, 2]);
            obj.on('set', (newValue, oldValue) => testResult.push('set', newValue, oldValue));
            obj.on('beforeSet', (newValue, oldValue) => { testResult.push('beforeSet', newValue, oldValue); return newValue });

            expect(obj.sort()).to.be(obj);

            const obj2 = oArr([1, 4, 3, 2]);
            obj2.on('set', (newValue, oldValue) => testResult.push('set', newValue, oldValue));
            obj2.on('beforeSet', (newValue, oldValue) => { testResult.push('beforeSet', newValue, oldValue); return newValue });

            expect(obj2.sort((a, b) => b - a)).to.be(obj2);

            expect(testResult).to.eql([
                'beforeSet', [1, 2, 3, 4], [1, 4, 3, 2], 'set', [1, 2, 3, 4], [1, 4, 3, 2],
                'beforeSet', [4, 3, 2, 1], [1, 4, 3, 2], 'set', [4, 3, 2, 1], [1, 4, 3, 2],
            ]);
        });

        it('测试 reverse', function () {
            const obj = oArr([1, 2, 3, 4]);
            obj.on('set', (newValue, oldValue) => testResult.push('set', newValue, oldValue));
            obj.on('beforeSet', (newValue, oldValue) => { testResult.push('beforeSet', newValue, oldValue); return newValue });
            expect(obj.reverse()).to.be(obj);

            expect(testResult).to.eql([
                'beforeSet', [4, 3, 2, 1], [1, 2, 3, 4], 'set', [4, 3, 2, 1], [1, 2, 3, 4],
            ]);
        });

        describe('测试 fill', function () {
            it('测试 数组间不带空位', function () {
                const obj = oArr(_.range(5));
                obj.on('update', (newValue, oldValue, index) => testResult.push('update', newValue, oldValue, index));
                obj.on('beforeUpdate', (newValue, oldValue, index) => { testResult.push('beforeUpdate', newValue, oldValue, index); return newValue });

                function actual(value: number, start?: number, end?: number): number[] {
                    return _.range(5).fill(value, start, end);
                }

                function test(): ObservableArray<number> {
                    obj.value = _.range(5);
                    return obj;
                }

                expect(test().fill(4).value).to.eql(actual(4));
                expect(test().fill(9, 1).value).to.eql(actual(9, 1));
                expect(test().fill(9, 1.1).value).to.eql(actual(9, 1.1));
                expect(test().fill(9, 5).value).to.eql(actual(9, 5));
                expect(test().fill(9, -1).value).to.eql(actual(9, -1));
                expect(test().fill(9, -1.9).value).to.eql(actual(9, -1.9));
                expect(test().fill(9, -5).value).to.eql(actual(9, -5));
                expect(test().fill(9, 2, 1).value).to.eql(actual(9, 2, 1));
                expect(test().fill(9, 2, 3.1).value).to.eql(actual(9, 2, 3.1));
                expect(test().fill(9, 2, 5).value).to.eql(actual(9, 2, 5));
                expect(test().fill(9, 2, -1).value).to.eql(actual(9, 2, -1));
                expect(test().fill(9, 2, -3.9).value).to.eql(actual(9, 2, -3.9));
                expect(test().fill(9, 2, -5).value).to.eql(actual(9, 2, -5));

                expect(testResult).to.eql([
                    ..._.times(5, i => [['beforeUpdate', 4, i, i], ['update', 4, i, i]]).flat().slice(0, -1).flat(),
                    ..._.times(4, i => [['beforeUpdate', 9, i + 1, i + 1], ['update', 9, i + 1, i + 1]]).flat(2),
                    ..._.times(4, i => [['beforeUpdate', 9, i + 1, i + 1], ['update', 9, i + 1, i + 1]]).flat(2),
                    'beforeUpdate', 9, 4, 4, 'update', 9, 4, 4,
                    'beforeUpdate', 9, 4, 4, 'update', 9, 4, 4,
                    ..._.times(5, i => [['beforeUpdate', 9, i, i], ['update', 9, i, i]]).flat(2),
                    'beforeUpdate', 9, 2, 2, 'update', 9, 2, 2,
                    ..._.times(3, i => [['beforeUpdate', 9, i + 2, i + 2], ['update', 9, i + 2, i + 2]]).flat(2),
                    ..._.times(2, i => [['beforeUpdate', 9, i + 2, i + 2], ['update', 9, i + 2, i + 2]]).flat(2),
                ]);
            });

            it('测试 数组间带空位', function () {
                const obj = oArr([0, 1, , , 4]); // eslint-disable-line
                obj.on('add', (value, index) => testResult.push('add', value, index));
                obj.on('update', (newValue, oldValue, index) => testResult.push('update', newValue, oldValue, index));
                obj.on('beforeUpdate', (newValue, oldValue, index) => { testResult.push('beforeUpdate', newValue, oldValue, index); return newValue });

                obj.fill(4);
                expect(testResult).to.eql([
                    'beforeUpdate', 4, 0, 0, 'update', 4, 0, 0,
                    'beforeUpdate', 4, 1, 1, 'update', 4, 1, 1,
                    'add', 4, 2,
                    'add', 4, 3,
                    'beforeUpdate', 4, 4, 4
                ]);
            });
        });

        describe('测试 copyWithin', function () {
            it('测试 数组间不带空位', function () {
                const obj = oArr(_.range(5));
                obj.on('update', (newValue, oldValue, index) => testResult.push('update', newValue, oldValue, index));
                obj.on('beforeUpdate', (newValue, oldValue, index) => { testResult.push('beforeUpdate', newValue, oldValue, index); return newValue });

                function actual(value: number, start: number, end?: number): number[] {
                    return _.range(5).copyWithin(value, start, end);
                }

                function test(): ObservableArray<number> {
                    obj.value = _.range(5);
                    return obj;
                }

                expect(test().copyWithin(0, 2).value).to.eql(actual(0, 2));
                expect(test().copyWithin(2, 2).value).to.eql(actual(2, 2));
                expect(test().copyWithin(3, 2).value).to.eql(actual(3, 2));
                expect(test().copyWithin(5, 2).value).to.eql(actual(5, 2));
                expect(test().copyWithin(-1.1, 2).value).to.eql(actual(-1.1, 2));
                expect(test().copyWithin(-5, 2).value).to.eql(actual(-5, 2));
                expect(test().copyWithin(-10, 2).value).to.eql(actual(-10, 2));
                expect(test().copyWithin(2, 0).value).to.eql(actual(2, 0));
                expect(test().copyWithin(2, 5).value).to.eql(actual(2, 5));
                expect(test().copyWithin(2, -1.9).value).to.eql(actual(2, -1.9));
                expect(test().copyWithin(2, -5).value).to.eql(actual(2, -5));
                expect(test().copyWithin(2, -10).value).to.eql(actual(2, -10));
                expect(test().copyWithin(2, 0, 1).value).to.eql(actual(2, 0, 1));
                expect(test().copyWithin(2, 0, 5).value).to.eql(actual(2, 0, 5));
                expect(test().copyWithin(2, 0, -3.1).value).to.eql(actual(2, 0, -3.1));
                expect(test().copyWithin(2, 0, -5).value).to.eql(actual(2, 0, -5));
                expect(test().copyWithin(2, 0, -10).value).to.eql(actual(2, 0, -10));

                expect(testResult).to.eql([
                    ..._.times(3, i => [['beforeUpdate', i + 2, i, i], ['update', i + 2, i, i]]).flat(2),
                    ..._.times(3, i => ['beforeUpdate', i + 2, i + 2, i + 2]).flat(),
                    ..._.times(2, i => [['beforeUpdate', i + 2, i + 3, i + 3], ['update', i + 2, i + 3, i + 3]]).flat(2),
                    'beforeUpdate', 2, 4, 4, 'update', 2, 4, 4,
                    ..._.times(3, i => [['beforeUpdate', i + 2, i, i], ['update', i + 2, i, i]]).flat(2),
                    ..._.times(3, i => [['beforeUpdate', i + 2, i, i], ['update', i + 2, i, i]]).flat(2),
                    ..._.times(3, i => [['beforeUpdate', i, i + 2, i + 2], ['update', i, i + 2, i + 2]]).flat(2),
                    'beforeUpdate', 4, 2, 2, 'update', 4, 2, 2,
                    ..._.times(3, i => [['beforeUpdate', i, i + 2, i + 2], ['update', i, i + 2, i + 2]]).flat(2),
                    ..._.times(3, i => [['beforeUpdate', i, i + 2, i + 2], ['update', i, i + 2, i + 2]]).flat(2),
                    'beforeUpdate', 0, 2, 2, 'update', 0, 2, 2,
                    ..._.times(3, i => [['beforeUpdate', i, i + 2, i + 2], ['update', i, i + 2, i + 2]]).flat(2),
                    ..._.times(2, i => [['beforeUpdate', i, i + 2, i + 2], ['update', i, i + 2, i + 2]]).flat(2),
                ]);
            });

            it('测试 数组间带空位', function () {
                const obj = oArr([0, , 2, , 4, 5]); // eslint-disable-line
                obj.on('add', (value, index) => testResult.push('add', value, index));
                obj.on('delete', (value, index) => testResult.push('delete', value, index));
                obj.on('update', (newValue, oldValue, index) => testResult.push('update', newValue, oldValue, index));
                obj.on('beforeUpdate', (newValue, oldValue, index) => { testResult.push('beforeUpdate', newValue, oldValue, index); return newValue });

                obj.copyWithin(3, 0, 5);
                expect(testResult).to.eql([
                    'add', 0, 3,
                    'delete', 4, 4,
                    'beforeUpdate', 2, 5, 5, 'update', 2, 5, 5
                ]);
            });
        });
    });

    describe('测试 读取操作方法', function () {
        const testData = [1, [2], [[3]]];
        const variable = oArr(testData);

        it('测试 at', function () {
            expect(variable.at(0)).to.eql(variable.value[0]);
            expect(variable.at(100)).to.eql(variable.value[100]);
            expect(variable.at(-100)).to.eql(variable.value[-100]);
        });

        it('测试 get', function () {
            expect(variable.get(0)).to.eql(variable.value[0]);
            expect(variable.get(100)).to.eql(variable.value[100]);
            expect(variable.get(-100)).to.eql(variable.value[-100]);
        });

        it('测试 has', function () {
            expect(variable.has(1)).to.be(true);
            expect(variable.has(10)).to.be(false);
        });

        it('测试 concat', function () {
            expect(variable.concat([1, 2, 3])).to.eql(variable.value.concat([1, 2, 3]));
        });

        it('测试 entries', function () {
            expect([...variable.entries()]).to.eql([...variable.value.entries()]);
        });

        it('测试 every', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            expect(variable.every(function (this, value, index, arr) { testResult1.push(this, value, index, arr); return true }, _this))
                .to.be(variable.value.every(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr); return true }, _this)); // eslint-disable-line

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 filter', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            expect(variable.filter(function (this, value, index, arr) { testResult1.push(this, value, index, arr); return true }, _this))
                .to.eql(variable.value.filter(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr); return true }, _this)); // eslint-disable-line

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 find', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            expect(variable.find(function (this, value, index, arr) { testResult1.push(this, value, index, arr); return true }, _this))
                .to.be(variable.value.find(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr); return true }, _this)); // eslint-disable-line

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 findLast', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            expect(variable.findLast(function (this, value, index, arr) { testResult1.push(this, value, index, arr); return true }, _this))
                .to.be(variable.value.findLast(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr); return true }, _this)); // eslint-disable-line

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 findIndex', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            expect(variable.findIndex(function (this, value, index, arr) { testResult1.push(this, value, index, arr); return true }, _this))
                .to.be(variable.value.findIndex(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr); return true }, _this)); // eslint-disable-line

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 findLastIndex', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            expect(variable.findLastIndex(function (this, value, index, arr) { testResult1.push(this, value, index, arr); return true }, _this))
                .to.be(variable.value.findLastIndex(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr); return true }, _this)); // eslint-disable-line

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 flat', function () {
            expect(variable.flat()).to.eql(variable.value.flat());
            expect(variable.flat(1)).to.eql(variable.value.flat(1));
            expect(variable.flat(2)).to.eql(variable.value.flat(2));
            expect(variable.flat(3)).to.eql(variable.value.flat(3));
        });

        it('测试 flatMap', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            expect(variable.flatMap(function (this, value, index, arr) { testResult1.push(this, value, index, arr); return true }, _this))
                .to.eql(variable.value.flatMap(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr); return true }, _this));

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 forEach', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            variable.forEach(function (this, value, index, arr) { testResult1.push(this, value, index, arr) }, _this);
            variable.value.forEach(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr) }, _this);

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 includes', function () {
            expect(variable.includes(1)).to.eql(variable.value.includes(1));
            expect(variable.includes(1, 1)).to.eql(variable.value.includes(1, 1));
        });

        it('测试 indexOf', function () {
            expect(variable.indexOf(1)).to.eql(variable.value.indexOf(1));
            expect(variable.indexOf(1, 1)).to.eql(variable.value.indexOf(1, 1));
        });

        it('测试 lastIndexOf', function () {
            expect(variable.lastIndexOf(1)).to.eql(variable.value.lastIndexOf(1));
            expect(variable.lastIndexOf(1, 1)).to.eql(variable.value.lastIndexOf(1, 1));
        });

        it('测试 join', function () {
            expect(variable.join('1')).to.eql(variable.value.join('1'));
        });

        it('测试 keys', function () {
            expect([...variable.keys()]).to.eql([...variable.value.keys()]);
        });

        it('测试 map', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            expect(variable.map(function (this, value, index, arr) { testResult1.push(this, value, index, arr); return true }, _this))
                .to.eql(variable.value.map(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr); return true }, _this));

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 reduce', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];

            expect(variable.reduce(function (previousValue, currentValue, currentIndex, arr) { testResult1.push(previousValue, currentValue, currentIndex, arr); return 1 }, 0)) // eslint-disable-line
                .to.be(variable.value.reduce(function (previousValue, currentValue, currentIndex, arr) { testResult2.push(previousValue, currentValue, currentIndex, arr); return 1 }, 0)); // eslint-disable-line

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 reduceRight', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];

            expect(variable.reduceRight(function (previousValue, currentValue, currentIndex, arr) { testResult1.push(previousValue, currentValue, currentIndex, arr); return 1 }, 0)) // eslint-disable-line
                .to.be(variable.value.reduceRight(function (previousValue, currentValue, currentIndex, arr) { testResult2.push(previousValue, currentValue, currentIndex, arr); return 1 }, 0)); // eslint-disable-line

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 slice', function () {
            expect(variable.slice()).to.eql(variable.value.slice());
            expect(variable.slice(1)).to.eql(variable.value.slice(1));
            expect(variable.slice(1, 3)).to.eql(variable.value.slice(1, 3));
        });

        it('测试 some', function () {
            const testResult1: any[] = [];
            const testResult2: any[] = [];
            const _this = Symbol('this');

            expect(variable.some(function (this, value, index, arr) { testResult1.push(this, value, index, arr); return true }, _this))
                .to.be(variable.value.some(function (this: any, value, index, arr) { testResult2.push(this, value, index, arr); return true }, _this)); // eslint-disable-line

            expect(testResult1).to.eql(testResult2);
        });

        it('测试 with', function () {
            expect(variable.with(1, 1)).to.eql(variable.value.with(1, 1));
        });

        it('测试 toReversed', function () {
            expect(variable.toReversed()).to.eql(variable.value.toReversed());
        });

        it('测试 toSorted', function () {
            expect(variable.toSorted(() => -1)).to.eql(variable.value.toSorted(() => -1));
        });

        it('测试 toSpliced', function () {
            expect(variable.toSpliced(1, 1, 1, 2)).to.eql(variable.value.toSpliced(1, 1, 1, 2));
        });

        it('测试 toLocaleString', function () {
            expect(variable.toLocaleString()).to.eql(variable.value.toLocaleString());
        });

        it('测试 toString', function () {
            expect(variable.toString()).to.eql(variable.value.toString());
        });

        it('测试 values', function () {
            expect([...variable.values()]).to.eql([...variable.value.values()]);
        });

        it('测试 [Symbol.iterator]', function () {
            expect([...variable]).to.eql([...variable.value]);
        });
    });
});

it('测试 watch', function () {
    const testResult: any[] = [];

    const ov = oVar<any>(undefined);
    const oa = oArr<any>([0]);
    const os = oSet<any>([]);
    const om = oMap<string, any>([['1', 1]]);

    const cancel = watch([ov, oa, os, om], (...args) => testResult.push(...args));

    function test(): void {
        ov.value = 1;         // set

        oa.push(1);           // add
        oa.pop();             // delete
        oa.set(0, 1);         // update

        os.add(1);            // add
        os.delete(1);         // delete

        om.set('a', 1);       // add
        om.delete('a');       // delete
        om.set('1', 2);       // update
    }

    test();
    cancel();
    test();

    expect(testResult).to.eql([
        'set', [1, undefined, ov],

        'add', [1, 1, oa],
        'delete', [1, 1, oa],
        'update', [1, 0, 0, oa],

        'add', [1, os],
        'delete', [1, os],

        'add', [1, 'a', om],
        'delete', [1, 'a', om],
        'update', [2, 1, '1', om],
    ]);
});
