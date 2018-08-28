import expect = require('expect.js');
import * as _ from 'lodash';

import { ObservableVariable, ObservableArray, ObservableMap, ObservableSet } from '../src';

describe('测试创建可观察变量', function () {

    it('测试ObservableVariable', function () {
        const o1 = { test: 'test' };
        const o2 = { test2: 'test2' };
        const o3 = { test3: 'test3', test4: 'test4' };

        const i1 = new ObservableVariable(o1);
        const i2 = new ObservableVariable(i1);
        expect(i1).to.be(i2);
        expect(i1.value).to.be(o1);

        const i3 = ObservableVariable.observe(o2);
        const i4 = ObservableVariable.observe(i3);
        expect(i3).to.be(i4);
        expect(i3.value).to.be(o2);

        ObservableVariable.observe(o3, 'test3');
        ObservableVariable.observe(o3, ['test4']);

        expect(o3.test3).to.be.a(ObservableVariable);
        expect(o3.test4).to.be.a(ObservableVariable);
    });

    it('测试ObservableArray', function () {
        const o1 = [{ test: 'test' }];
        const o2 = [{ test2: 'test2' }];
        const o3 = { test3: ['test3'], test4: ['test4'] };

        const i1 = new ObservableArray(o1);
        const i2 = new ObservableArray(i1);
        expect(i1).to.be(i2);
        expect(i1.value).to.be(o1);

        const i3 = ObservableArray.observe(o2);
        const i4 = ObservableArray.observe(i3);
        expect(i3).to.be(i4);
        expect(i3.value).to.be(o2);

        ObservableArray.observe(o3, 'test3');
        ObservableArray.observe(o3, ['test4']);

        expect(o3.test3).to.be.a(ObservableVariable);
        expect(o3.test4).to.be.a(ObservableVariable);
    });

    it('测试ObservableMap', function () {
        const o1 = [['test', 'test']] as [string, string][];
        const o2 = new Map<number, string>();
        const o3 = [['test2', 'test2']] as [string, string][];
        const o4 = new Map<string, number>();
        const o5 = { test3: [[1, 2]], test4: new Map<string, number>() };

        const i1 = new ObservableMap(o1);
        const i2 = new ObservableMap(i1);
        expect(i1).to.be(i2);
        expect([...i1.value.entries()]).to.eql(o1);

        const i3 = new ObservableMap(o2);
        expect(i3.value).to.be(o2);

        const i4 = ObservableMap.observe(o3);
        const i5 = ObservableMap.observe(i4);
        expect(i4).to.be(i5);
        expect([...i4.value.entries()]).to.eql(o3);

        const i6 = ObservableMap.observe(o4);
        expect(i6.value).to.be(o4);

        ObservableMap.observe(o5, 'test3');
        ObservableMap.observe(o5, ['test4']);

        expect(o5.test3).to.be.a(ObservableMap);
        expect(o5.test4).to.be.a(ObservableMap);
    });

    it('测试ObservableSet', function () {
        const o1 = [{ test: 'test' }];
        const o2 = new Set<number>();
        const o3 = [{ test2: 'test2' }];
        const o4 = new Set<number>();
        const o5 = { test3: ['test3'], test4: new Set<number>() };

        const i1 = new ObservableSet(o1);
        const i2 = new ObservableSet(i1);
        expect(i1).to.be(i2);
        expect([...i1.value.values()]).to.eql(o1);

        const i3 = new ObservableSet(o2);
        expect(i3.value).to.be(o2);

        const i4 = ObservableSet.observe(o3);
        const i5 = ObservableSet.observe(i4);
        expect(i4).to.be(i5);
        expect([...i4.value.values()]).to.eql(o3);

        const i6 = ObservableSet.observe(o4);
        expect(i6.value).to.be(o4);

        ObservableSet.observe(o5, 'test3');
        ObservableSet.observe(o5, ['test4']);

        expect(o5.test3).to.be.a(ObservableSet);
        expect(o5.test4).to.be.a(ObservableSet);
    });
});

describe('测试 toJSON', function () {
    const testData = {
        ov: new ObservableVariable('ov'),
        oa: new ObservableArray(['oa']),
        om: new ObservableMap([['om', 123], ['om', 456]]),
        os: new ObservableSet(['os', 'os'])
    };

    it('测试 可序列化', function () {
        expect(JSON.stringify(testData)).to.be('{"ov":"ov","oa":["oa"],"om":[["om",456]],"os":["os"]}');
    });

    it('测试 不可序列化', function () {
        testData.ov.serializable = false;
        testData.oa.serializable = false;
        testData.om.serializable = false;
        testData.os.serializable = false;

        expect(JSON.stringify(testData)).to.be('{}');
    });
});

describe('测试 readonly', function () {

    it('测试ObservableVariable', function () {
        const obj = new ObservableVariable('1');
        obj.readonly = true;

        expect(() => obj.value = '2').to.throwError(/尝试修改一个只读的 ObservableVariable/);
    });

    it('测试ObservableArray', function () {
        const obj = new ObservableArray([1]);
        obj.readonly = true;

        expect(() => obj.value = [2]).to.throwError(/尝试修改一个只读的 ObservableArray/);

        expect(obj.pop.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.push.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.shift.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.unshift.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.splice.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.delete.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.deleteAll.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.sort.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.reverse.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.fill.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.copyWithin.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);

        expect(obj.value).to.eql([1]);
    });

    it('测试ObservableMap', function () {
        const obj = new ObservableMap([['a', 1]]);
        obj.readonly = true;

        expect(() => obj.value = new Map([['b', 2]])).to.throwError(/尝试修改一个只读的 ObservableMap/);

        expect(obj.clear.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableMap/);
        expect(obj.delete.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableMap/);
        expect(obj.set.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableMap/);

        expect([...obj.value.entries()]).to.eql([['a', 1]]);
    });

    it('测试ObservableSet', function () {
        const obj = new ObservableSet([1]);
        obj.readonly = true;

        expect(() => obj.value = new Set([2])).to.throwError(/尝试修改一个只读的 ObservableSet/);

        expect(obj.clear.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableSet/);
        expect(obj.delete.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableSet/);
        expect(obj.add.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableSet/);

        expect([...obj.value.values()]).to.eql([1]);
    });
});

it('测试 元素个数属性', function () {
    const oa = new ObservableArray(['oa']);
    const om = new ObservableMap([['om', 123], ['om', 456]]);
    const os = new ObservableSet(['os', 'os']);

    expect(oa.length).to.be(1);
    expect(om.size).to.be(1);
    expect(os.size).to.be(1);

    oa.length = 0;

    expect(oa.length).to.be(0);
});

describe('测试事件', function () {
    const testResult: any[] = [];
    function callback_void(...args: any[]) { testResult.push(...args); }
    function callback_void2(...args: any[]) { testResult.push(...args); }

    afterEach(function () {
        testResult.length = 0;
    })

    it('测试ObservableVariable', function () {
        const obj = new ObservableVariable('a');

        obj.on('set', callback_void);
        obj.on('set', callback_void2);
        obj.once('set', callback_void);
        obj.once('set', callback_void2);

        obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => {
            testResult.push(newValue, oldValue, oVar);
            changeTo('1');
            return false;
        });

        obj.value = 'b';

        obj.value = 'b';

        obj.off('set', callback_void);

        obj.value = 'c';

        obj.off('set');

        obj.value = 'd';

        obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => changeTo('f'));

        obj.value = 'e';

        expect(testResult).to.eql([
            'b', 'a', obj,
            'b', 'a', 'b', 'a', 'b', 'a', 'b', 'a',
            'c', 'b',
        ]);

        expect(obj.value).to.be('f');
    });

    it('测试ObservableArray', function () {
        const obj = new ObservableArray<number | string>([1]);

        obj.on('set', callback_void);
        obj.on('set', callback_void2);
        obj.once('set', callback_void);

        obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => {
            testResult.push(newValue, oldValue, oVar);
            changeTo([666]);
            return false;
        });

        obj.on('add', callback_void);
        obj.on('add', callback_void2);
        obj.once('add', callback_void);

        obj.on('remove', callback_void);
        obj.on('remove', callback_void2);
        obj.once('remove', callback_void);

        obj.push('a');
        obj.pop();

        obj.off('add', callback_void);
        obj.off('remove', callback_void);

        obj.push('b');
        obj.pop();

        obj.off('add');
        obj.off('remove');

        obj.push('c');
        obj.pop();

        obj.value = [2];

        obj.value = [3];

        obj.off('set', callback_void);

        obj.value = [4];

        obj.off('set');

        obj.value = [5];

        obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => changeTo([777]));

        obj.value = [6];

        expect(testResult).to.eql([
            'a', 'a', 'a', 'a', 'a', 'a',
            'b', 'b',
            [2], [1], obj,
            [3], [1], [3], [1], [3], [1],
            [4], [3]
        ]);

        expect(obj.value).to.eql([777]);
    });

    it('测试ObservableMap', function () {
        const m1 = new Map([['1', 1]]);
        const m2 = new Map([['2', 2]]);
        const m3 = new Map([['3', 3]]);
        const m4 = new Map([['4', 4]]);
        const m5 = new Map([['5', 5]]);
        const m6 = new Map([['6', 6]]);
        const m7 = new Map([['7', 7]]);

        const obj = new ObservableMap(m1)

        obj.on('set', callback_void);
        obj.on('set', callback_void2);
        obj.once('set', callback_void);

        obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => {
            testResult.push(newValue, oldValue, oVar);
            changeTo(m5);
            return false;
        });

        obj.on('update', callback_void);
        obj.on('update', callback_void2);
        obj.once('update', callback_void);

        obj.on('add', callback_void);
        obj.on('add', callback_void2);
        obj.once('add', callback_void);

        obj.on('remove', callback_void);
        obj.on('remove', callback_void2);
        obj.once('remove', callback_void);

        obj.set('a', 1);
        obj.delete('a');

        obj.off('add', callback_void);
        obj.off('remove', callback_void);

        obj.set('b', 2);
        obj.delete('b');

        obj.off('add');
        obj.off('remove');

        obj.set('c', 3);
        obj.delete('c');

        obj.set('d', 1);
        obj.set('d', 2);

        obj.off('update', callback_void);

        obj.set('d', 3);

        obj.off('update');

        obj.set('d', 4);

        obj.value = m2;

        obj.value = m2;

        obj.off('set', callback_void);

        obj.value = m3;

        obj.off('set');

        obj.value = m4;

        obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => changeTo(m7));

        obj.value = m6;

        expect(testResult).to.eql([
            1, 'a', 1, 'a', 1, 'a', 1, 'a', 1, 'a', 1, 'a',
            2, 'b', 2, 'b',
            2, 1, 'd', 2, 1, 'd', 2, 1, 'd',
            3, 2, 'd',
            m2, m1, obj,
            m2, m1, m2, m1, m2, m1,
            m3, m2
        ]);

        expect(obj.value).to.be(m7);
    });

    it('测试ObservableSet', function () {
        const s1 = new Set<string | number>([1]);
        const s2 = new Set<string | number>([2]);
        const s3 = new Set<string | number>([3]);
        const s4 = new Set<string | number>([4]);
        const s5 = new Set<string | number>([5]);
        const s6 = new Set<string | number>([6]);
        const s7 = new Set<string | number>([7]);

        const obj = new ObservableSet(s1)

        obj.on('set', callback_void);
        obj.on('set', callback_void2);
        obj.once('set', callback_void);

        obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => {
            testResult.push(newValue, oldValue, oVar);
            changeTo(s5);
            return false;
        });

        obj.on('add', callback_void);
        obj.on('add', callback_void2);
        obj.once('add', callback_void);

        obj.on('remove', callback_void);
        obj.on('remove', callback_void2);
        obj.once('remove', callback_void);

        obj.add('a');
        obj.delete('a');

        obj.off('add', callback_void);
        obj.off('remove', callback_void);

        obj.add('b');
        obj.delete('b');

        obj.off('add');
        obj.off('remove');

        obj.add('c');
        obj.delete('c');

        obj.value = s2;

        obj.value = s2;

        obj.off('set', callback_void);

        obj.value = s3;

        obj.off('set');

        obj.value = s4;

        obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => changeTo(s7));

        obj.value = s6;

        expect(testResult).to.eql([
            'a', 'a', 'a', 'a', 'a', 'a',
            'b', 'b',
            s2, s1, obj,
            s2, s1, s2, s1, s2, s1,
            s3, s2
        ]);

        expect(obj.value).to.be(s7);
    });
});

it('测试 ObservableVariable 的 _changeStealthily', function () {
    const result: number[] = [];
    const obj = new ObservableVariable(1);

    obj.on('set', (newValue, oldValue) => result.push(newValue, oldValue));

    obj.once('beforeSet', (newValue, oldValue) => { result.push(newValue, oldValue); });
    obj._changeStealthily(2);
    expect(obj.value).to.be(2);

    obj.once('beforeSet', (newValue, oldValue) => { result.push(newValue, oldValue); return false; });
    obj._changeStealthily(3);
    expect(obj.value).to.be(2);

    obj.once('beforeSet', (newValue, oldValue, changeTo) => { result.push(newValue, oldValue); changeTo(123); });
    obj._changeStealthily(4);
    expect(obj.value).to.be(123);

    obj.once('beforeSet', (newValue, oldValue, changeTo) => { result.push(newValue, oldValue); changeTo(456); return false; });
    obj._changeStealthily(5);
    expect(obj.value).to.be(123);

    obj.readonly = true;
    expect(obj._changeStealthily.bind(obj, 6)).to.throwError(/尝试修改一个只读的 ObservableVariable/);

    expect(result).to.eql([
        2, 1,
        3, 2,
        4, 2,
        5, 123,
    ]);
});

describe('测试ObservableArray 修改操作方法', function () {

    it('测试 pop', function () {
        const testResult: any[] = [];

        const obj = new ObservableArray([1, 2]);
        obj.on('remove', value => testResult.push(value));

        expect(obj.pop()).to.be(2);
        expect(obj.pop()).to.be(1);
        expect(obj.pop()).to.be(undefined);
        expect(obj.value.length).to.be(0);
        expect(testResult).to.eql([2, 1]);
    });

    it('测试 push', function () {
        const testResult: any[] = [];

        const obj = new ObservableArray<number>([]);
        obj.on('add', value => testResult.push(value));

        expect(obj.push(1)).to.be(1);
        expect(obj.push(2)).to.be(2);
        expect(obj.push(3, 4)).to.be(4);
        expect(obj.value.length).to.be(4);
        expect(obj.value).to.eql([1, 2, 3, 4]);
        expect(testResult).to.eql([1, 2, 3, 4]);
    });

    it('测试 shift', function () {
        const testResult: any[] = [];

        const obj = new ObservableArray([1, 2]);
        obj.on('remove', value => testResult.push(value));

        expect(obj.shift()).to.be(1);
        expect(obj.shift()).to.be(2);
        expect(obj.shift()).to.be(undefined);
        expect(obj.value.length).to.be(0);
        expect(testResult).to.eql([1, 2]);
    });

    it('测试 unshift', function () {
        const testResult: any[] = [];

        const obj = new ObservableArray<number>([]);
        obj.on('add', value => testResult.push(value));

        expect(obj.unshift(1)).to.be(1);
        expect(obj.unshift(2)).to.be(2);
        expect(obj.unshift(3, 4)).to.be(4);
        expect(obj.value.length).to.be(4);
        expect(obj.value).to.eql([3, 4, 2, 1]);
        expect(testResult).to.eql([1, 2, 3, 4]);
    });

    it('测试 splice', function () {
        const testResult: any[] = [];

        const testArray = new ObservableArray(actual());
        testArray.on('add', value => testResult.push(value));
        testArray.on('remove', value => testResult.push(value));

        function actual() {
            return _.range(10);
        }

        function test() {
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

        expect(test().splice(1, -0.9)).to.eql(actual().splice(1, - 0.9));
        expect(testArray.value).to.eql(_.range(10));

        expect(test().splice(1, -1)).to.eql(actual().splice(1, - 1));
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

        expect(testResult).to.eql([
            ...actual().splice(0),
            ...actual().splice(0.9),
            ...actual().splice(5),
            ...actual().splice(999),
            ...actual().splice(-0.9),
            ...actual().splice(-5),
            ...actual().splice(-999),

            ...actual().splice(1, 0),
            ...actual().splice(1, 0.9),
            ...actual().splice(1, 1),
            ...actual().splice(1, 100),
            ...actual().splice(1, -0.9),
            ...actual().splice(1, -1),
            ...actual().splice(1, -100),

            ...actual().splice(1, 0, 1), 1,
            ...actual().splice(1, 0, 2, 3, 4), 2, 3, 4,
            ...actual().splice(-1, 0, 1), 1,
            ...actual().splice(-1, 0, 2, 3, 4), 2, 3, 4,
        ]);
    });

    it('测试 delete', function () {
        const testResult: any[] = [];

        const obj = new ObservableArray([1, 1, 2, 2]);
        obj.on('remove', value => testResult.push(value));

        expect(obj.delete(1)).to.be.ok();
        expect(obj.delete(2)).to.be.ok();
        expect(obj.value).to.eql([1, 2]);

        expect(obj.delete(1)).to.be.ok();
        expect(obj.delete(2)).to.be.ok();
        expect(obj.value.length).to.be(0);

        expect(obj.delete(1)).to.not.be.ok();
        expect(obj.delete(2)).to.not.be.ok();

        expect(testResult).to.eql([
            1, 2, 1, 2
        ]);
    });

    it('测试 deleteAll', function () {
        const testResult: any[] = [];

        const obj = new ObservableArray([1, 1, 2, 2]);
        obj.on('remove', value => testResult.push(value));

        obj.deleteAll(1);
        obj.deleteAll(2);
        expect(obj.value.length).to.be(0);

        obj.deleteAll(1);
        obj.deleteAll(2);

        expect(testResult).to.eql([
            1, 1, 2, 2
        ]);
    });

    it('测试 sort', function (done) {
        const obj = new ObservableArray([1, 4, 3, 2]);

        obj.on('set', (newValue, oldValue) => {
            expect(newValue).to.be(oldValue);
            expect(obj.value).to.eql([1, 2, 3, 4]);
            done();
        });

        expect(obj.sort()).to.be(obj);
    });

    it('测试 reverse', function (done) {
        const obj = new ObservableArray([1, 2, 3, 4]);

        obj.on('set', (newValue, oldValue) => {
            expect(newValue).to.be(oldValue);
            expect(obj.value).to.eql([4, 3, 2, 1]);
            done();
        });

        expect(obj.reverse()).to.be(obj);
    });

    it('测试 fill', function (done) {
        const obj = new ObservableArray([1, 2, 3, 4]);

        obj.on('set', (newValue, oldValue) => {
            expect(newValue).to.be(oldValue);
            expect(obj.value).to.eql([1, 9, 9, 4]);
            done();
        });

        expect(obj.fill(9, 1, 3)).to.be(obj);
    });

    it('测试 copyWithin', function (done) {
        const obj = new ObservableArray([1, 2, 3, 4]);

        obj.on('set', (newValue, oldValue) => {
            expect(newValue).to.be(oldValue);
            expect(obj.value).to.eql([1, 3, 3, 4]);
            done();
        });

        expect(obj.copyWithin(1, 2, 3)).to.be(obj);
    });
});

describe('测试ObservableMap 修改操作方法', function () {

    it('测试 clear', function () {
        const testResult: any[] = [];

        const obj = new ObservableMap([['a', 1], ['b', 2]]);
        obj.on('remove', (value, key) => testResult.push(key, value));

        obj.clear();

        expect(obj.value.size).to.be(0);
        expect(testResult).to.eql([
            'a', 1, 'b', 2
        ]);
    });

    it('测试 delete', function () {
        const testResult: any[] = [];

        const obj = new ObservableMap([['a', 1]]);
        obj.on('remove', (value, key) => testResult.push(key, value));

        expect(obj.delete('a')).to.be.ok();
        expect(obj.delete('a')).to.not.be.ok();
        expect(obj.delete('b')).to.not.be.ok();

        expect(obj.value.size).to.be(0);
        expect(testResult).to.eql([
            'a', 1
        ]);
    });

    it('测试 set', function () {
        const testResult: any[] = [];

        const obj = new ObservableMap([['a', 1]]);
        obj.on('add', (value, key) => testResult.push(key, value));
        obj.on('update', (newValue, oldValue, key) => testResult.push(key, newValue, oldValue));

        expect(obj.set('a', 2)).to.be(obj);
        expect(obj.set('b', 3)).to.be(obj);

        expect(obj.value.size).to.be(2);
        expect(obj.value.get('a')).to.be(2);
        expect(testResult).to.eql([
            'a', 2, 1,
            'b', 3
        ]);
    });
});

describe('测试ObservableSet 修改操作方法', function () {

    it('测试 clear', function () {
        const testResult: any[] = [];

        const obj = new ObservableSet([1, 2]);
        obj.on('remove', value => testResult.push(value));

        obj.clear();

        expect(obj.value.size).to.be(0);
        expect(testResult).to.eql([
            1, 2
        ]);
    });

    it('测试 delete', function () {
        const testResult: any[] = [];

        const obj = new ObservableSet([1]);
        obj.on('remove', value => testResult.push(value));

        expect(obj.delete(1)).to.be.ok();
        expect(obj.delete(1)).to.not.be.ok();
        expect(obj.delete(2)).to.not.be.ok();

        expect(obj.value.size).to.be(0);
        expect(testResult).to.eql([
            1
        ]);
    });

    it('测试 add', function () {
        const testResult: any[] = [];

        const obj = new ObservableSet([1]);
        obj.on('add', value => testResult.push(value));

        expect(obj.add(1)).to.be(obj);
        expect(obj.add(2)).to.be(obj);

        expect(obj.value.size).to.be(2);
        expect(testResult).to.eql([
            2
        ]);
    });
});