import expect = require('expect.js');
import * as _ from 'lodash';

import { ObservableVariable, ObservableArray, ObservableMap, ObservableSet } from '../src';

describe('测试创建可观察变量', function () {

    it('测试ObservableVariable', function () {
        const o1 = { test: 'test' };
        const o2 = { test2: 'test2' };
        const o3 = { test3: 'test3' };
        const o4 = { test4: 'test4', test5: 'test5' };
        const o5 = { test6: 'test6', test7: 'test7' };

        const i1 = new ObservableVariable(o1);
        const i2 = new ObservableVariable(i1);
        expect(i1).to.be(i2);
        expect(i1.value).to.be(o1);

        const i3 = new ObservableVariable(o2, { readonly: true, ensureChange: false });
        const i4 = new ObservableVariable(i3, { readonly: false, ensureChange: true });
        expect(i3).to.be(i4);
        expect(i3.value).to.be(o2);
        expect(i3.readonly).to.be(true);
        expect(i3.ensureChange).to.be(false);
        expect(i4.readonly).to.be(true);
        expect(i4.ensureChange).to.be(false);

        const i5 = ObservableVariable.observe(o3);
        const i6 = ObservableVariable.observe(i5);
        expect(i5).to.be(i6);
        expect(i5.value).to.be(o3);

        ObservableVariable.observe(o4, 'test4');
        ObservableVariable.observe(o4, ['test5']);

        expect(o4.test4).to.be.a(ObservableVariable);
        expect(o4.test5).to.be.a(ObservableVariable);

        ObservableVariable.observe(o5, 'test6', { readonly: true, ensureChange: false });
        ObservableVariable.observe(o5, ['test7'], { readonly: true, ensureChange: false });

        expect(o5.test6).to.be.a(ObservableVariable);
        expect(o5.test7).to.be.a(ObservableVariable);
        expect((o5.test6 as any).readonly).to.be(true);
        expect((o5.test6 as any).ensureChange).to.be(false);
        expect((o5.test7 as any).readonly).to.be(true);
        expect((o5.test7 as any).ensureChange).to.be(false);
    });

    it('测试ObservableArray', function () {
        const o1 = [{ test: 'test' }];
        const o2 = [{ test2: 'test2' }];
        const o3 = [{ test3: 'test3' }];
        const o4 = { test4: ['test4'], test5: ['test5'] };
        const o5 = { test6: ['test6'], test7: ['test7'] };

        const i1 = new ObservableArray(o1);
        const i2 = new ObservableArray(i1);
        expect(i1).to.be(i2);
        expect(i1.value).to.be(o1);

        const i3 = new ObservableArray(o2, { readonly: true, ensureChange: false });
        const i4 = new ObservableArray(i3, { readonly: false, ensureChange: true });
        expect(i3).to.be(i4);
        expect(i3.value).to.be(o2);
        expect(i3.readonly).to.be(true);
        expect(i3.ensureChange).to.be(false);
        expect(i4.readonly).to.be(true);
        expect(i4.ensureChange).to.be(false);

        const i5 = ObservableArray.observe(o3);
        const i6 = ObservableArray.observe(i5);
        expect(i5).to.be(i6);
        expect(i5.value).to.be(o3);

        ObservableArray.observe(o4, 'test4');
        ObservableArray.observe(o4, ['test5']);

        expect(o4.test4).to.be.a(ObservableArray);
        expect(o4.test5).to.be.a(ObservableArray);

        ObservableArray.observe(o5, 'test6', { readonly: true, ensureChange: false });
        ObservableArray.observe(o5, ['test7'], { readonly: true, ensureChange: false });

        expect(o5.test6).to.be.a(ObservableArray);
        expect(o5.test7).to.be.a(ObservableArray);
        expect((o5.test6 as any).readonly).to.be(true);
        expect((o5.test6 as any).ensureChange).to.be(false);
        expect((o5.test7 as any).readonly).to.be(true);
        expect((o5.test7 as any).ensureChange).to.be(false);
    });

    it('测试ObservableMap', function () {
        const o1 = [['test', 'test']] as [string, string][];
        const o2 = new Map<number, string>();
        const o3 = [['test3', 'test3']] as [string, string][];
        const o4 = { test4: new Map<string, number>(), test5: [['test5', 'test5']] };
        const o5 = { test6: new Map<string, number>(), test7: [['test7', 'test7']] };

        const i1 = new ObservableMap(o1);
        const i2 = new ObservableMap(i1);
        expect(i1).to.be(i2);
        expect([...i1.value.entries()]).to.eql(o1);

        const i3 = new ObservableMap(o2, { readonly: true, ensureChange: false });
        const i4 = new ObservableMap(i3, { readonly: false, ensureChange: true });
        expect(i3).to.be(i4);
        expect([...i3.value.entries()]).to.eql(o2);
        expect(i3.readonly).to.be(true);
        expect(i3.ensureChange).to.be(false);
        expect(i4.readonly).to.be(true);
        expect(i4.ensureChange).to.be(false);

        const i5 = ObservableMap.observe(o3);
        const i6 = ObservableMap.observe(i5);
        expect(i5).to.be(i6);
        expect([...i5.value.entries()]).to.eql(o3);

        ObservableMap.observe(o4, 'test4');
        ObservableMap.observe(o4, ['test5']);

        expect(o4.test4).to.be.a(ObservableMap);
        expect(o4.test5).to.be.a(ObservableMap);

        ObservableMap.observe(o5, 'test6', { readonly: true, ensureChange: false });
        ObservableMap.observe(o5, ['test7'], { readonly: true, ensureChange: false });

        expect(o5.test6).to.be.a(ObservableMap);
        expect(o5.test7).to.be.a(ObservableMap);
        expect((o5.test6 as any).readonly).to.be(true);
        expect((o5.test6 as any).ensureChange).to.be(false);
        expect((o5.test7 as any).readonly).to.be(true);
        expect((o5.test7 as any).ensureChange).to.be(false);
    });

    it('测试ObservableSet', function () {
        const o1 = [['test', 'test']];
        const o2 = new Set<string>();
        const o3 = [['test3', 'test3']];
        const o4 = { test4: new Set<number>(), test5: [['test5', 'test5']] };
        const o5 = { test6: new Set<number>(), test7: [['test7', 'test7']] };

        const i1 = new ObservableSet(o1);
        const i2 = new ObservableSet(i1);
        expect(i1).to.be(i2);
        expect([...i1.value.values()]).to.eql(o1);

        const i3 = new ObservableSet(o2, { readonly: true, ensureChange: false });
        const i4 = new ObservableSet(i3, { readonly: false, ensureChange: true });
        expect(i3).to.be(i4);
        expect([...i3.value.values()]).to.eql(o2);
        expect(i3.readonly).to.be(true);
        expect(i3.ensureChange).to.be(false);
        expect(i4.readonly).to.be(true);
        expect(i4.ensureChange).to.be(false);

        const i5 = ObservableSet.observe(o3);
        const i6 = ObservableSet.observe(i5);
        expect(i5).to.be(i6);
        expect([...i5.value.values()]).to.eql(o3);

        ObservableSet.observe(o4, 'test4');
        ObservableSet.observe(o4, ['test5']);

        expect(o4.test4).to.be.a(ObservableSet);
        expect(o4.test5).to.be.a(ObservableSet);

        ObservableSet.observe(o5, 'test6', { readonly: true, ensureChange: false });
        ObservableSet.observe(o5, ['test7'], { readonly: true, ensureChange: false });

        expect(o5.test6).to.be.a(ObservableSet);
        expect(o5.test7).to.be.a(ObservableSet);
        expect((o5.test6 as any).readonly).to.be(true);
        expect((o5.test6 as any).ensureChange).to.be(false);
        expect((o5.test7 as any).readonly).to.be(true);
        expect((o5.test7 as any).ensureChange).to.be(false);
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

it('测试 _changeStealthily', function () {
    const result: any[] = [];
    const obj = new ObservableVariable(1);

    obj.on('set', (newValue, oldValue) => result.push('set', newValue, oldValue));

    obj.once('beforeSet', (newValue, oldValue) => { result.push('beforeSet', newValue, oldValue); });
    obj._changeStealthily(2);
    expect(obj.value).to.be(2);

    obj.once('beforeSet', (newValue, oldValue) => { result.push('beforeSet', newValue, oldValue); return false; });
    obj._changeStealthily(3);
    expect(obj.value).to.be(2);

    obj.once('beforeSet', (newValue, oldValue, changeTo) => { result.push('beforeSet', newValue, oldValue); changeTo(123); });
    obj._changeStealthily(4);
    expect(obj.value).to.be(123);

    obj.once('beforeSet', (newValue, oldValue, changeTo) => { result.push('beforeSet', newValue, oldValue); changeTo(456); return false; });
    obj._changeStealthily(5);
    expect(obj.value).to.be(123);

    obj.readonly = true;
    expect(obj._changeStealthily.bind(obj, 6)).to.throwError(/尝试修改一个只读的 ObservableVariable/);

    expect(result).to.eql([
        'beforeSet', 2, 1,
        'beforeSet', 3, 2,
        'beforeSet', 4, 2,
        'beforeSet', 5, 123,
    ]);
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

    afterEach(function () {
        testResult.length = 0;
    });

    describe('测试ObservableVariable', function () {

        it('测试 set', function () {
            const obj = new ObservableVariable('a');

            function callback_on(newValue: string, oldValue: string) { testResult.push('on', newValue, oldValue) }
            function callback_once(newValue: string, oldValue: string) { testResult.push('once', newValue, oldValue) }

            obj.on('set', callback_on);
            obj.once('set', callback_once);

            obj.value = 'a';
            obj.value = 'b';
            obj.value = 'c';

            obj.ensureChange = false;
            obj.value = 'c';

            obj.off('set', callback_on);
            obj.off('set', callback_once);

            obj.value = 'd';

            expect(testResult).to.eql([
                'on', 'b', 'a', 'once', 'b', 'a',
                'on', 'c', 'b',
                'on', 'c', 'c',
            ]);
        });

        it('测试 beforeSet', function () {
            const obj = new ObservableVariable('a');

            obj.on('set', (newValue, oldValue) => { testResult.push('set', newValue, oldValue) });
            obj.on('beforeSet', (newValue, oldValue) => { testResult.push('on', newValue, oldValue) });
            obj.value = 'a';
            obj.value = 'b';

            obj.off('beforeSet');
            obj.value = 'c';

            obj.once('beforeSet', (newValue, oldValue) => { testResult.push('once1', newValue, oldValue) });
            obj.value = 'd';
            obj.value = 'e';

            obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => { testResult.push('once2', newValue, oldValue, oVar); return false; });
            obj.value = 'e';
            obj.value = 'f';
            expect(obj.value).to.be('e');

            obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => { testResult.push('once3', newValue, oldValue, oVar); changeTo('h'); });
            obj.value = 'g';
            expect(obj.value).to.be('h');

            obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => { testResult.push('once4', newValue, oldValue, oVar); changeTo('h'); });
            obj.value = 'i';
            expect(obj.value).to.be('h');

            obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => { testResult.push('once5', newValue, oldValue, oVar); changeTo('k'); return false; });
            obj.value = 'j';
            expect(obj.value).to.be('h');

            obj.ensureChange = false;

            obj.once('beforeSet', (newValue, oldValue) => { testResult.push('once6', newValue, oldValue) });
            obj.value = 'h';

            obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => { testResult.push('once7', newValue, oldValue, oVar); changeTo('h'); });
            obj.value = 'l';
            expect(obj.value).to.be('h');

            expect(testResult).to.eql([
                'on', 'b', 'a', 'set', 'b', 'a',
                'set', 'c', 'b',
                'once1', 'd', 'c', 'set', 'd', 'c',
                'set', 'e', 'd',
                'once2', 'f', 'e', obj,
                'once3', 'g', 'e', obj, 'set', 'h', 'e',
                'once4', 'i', 'h', obj,
                'once5', 'j', 'h', obj,
                'once6', 'h', 'h', 'set', 'h', 'h',
                'once7', 'l', 'h', obj, 'set', 'h', 'h',
            ]);
        });
    });

    describe('测试ObservableArray', function () {

        function callback(...args: any[]) { testResult.push(...args) }
        function callback2(...args: any[]) { testResult.push(...args) }

        it('测试 add', function () {
            const obj = new ObservableArray([1]);

            obj.on('add', callback);
            obj.on('add', callback2);
            obj.once('add', callback);

            obj.push(1);
            obj.push(2);

            obj.off('add', callback2);

            obj.push(3);

            obj.off('add');

            obj.push(4);

            expect(testResult).to.eql([
                1, 1, 1,
                2, 2,
                3,
            ]);
        });

        it('测试 remove', function () {
            const obj = new ObservableArray([1, 2, 3, 4, 5, 6, 7]);

            obj.on('remove', callback);
            obj.on('remove', callback2);
            obj.once('remove', callback);

            obj.pop();
            obj.pop();

            obj.off('remove', callback2);

            obj.pop();

            obj.off('remove');

            obj.pop();

            expect(testResult).to.eql([
                7, 7, 7,
                6, 6,
                5,
            ]);
        });
    });

    describe('测试ObservableSet', function () {

        function callback(...args: any[]) { testResult.push(...args) }
        function callback2(...args: any[]) { testResult.push(...args) }

        it('测试 add', function () {
            const obj = new ObservableSet([1]);

            obj.on('add', callback);
            obj.on('add', callback2);
            obj.once('add', callback);

            obj.add(1);
            obj.add(2);
            obj.add(3);

            obj.off('add', callback2);

            obj.add(4);

            obj.off('add');

            obj.add(5);

            expect(testResult).to.eql([
                2, 2, 2,
                3, 3,
                4,
            ]);
        });

        it('测试 remove', function () {
            const obj = new ObservableSet([2, 3, 4, 5]);

            obj.on('remove', callback);
            obj.on('remove', callback2);
            obj.once('remove', callback);

            obj.delete(1);
            obj.delete(2);
            obj.delete(3);

            obj.off('remove', callback2);

            obj.delete(4);

            obj.off('remove');

            obj.delete(5);

            expect(testResult).to.eql([
                2, 2, 2,
                3, 3,
                4,
            ]);
        });
    });

    describe('测试ObservableMap', function () {

        function callback(...args: any[]) { testResult.push(...args) }
        function callback2(...args: any[]) { testResult.push(...args) }

        it('测试 add', function () {
            const obj = new ObservableMap([['1', 1]]);

            obj.on('add', callback);
            obj.on('add', callback2);
            obj.once('add', callback);

            obj.set('1', 1);
            obj.set('2', 2);
            obj.set('3', 3);

            obj.off('add', callback2);

            obj.set('4', 4);

            obj.off('add');

            obj.set('5', 5);

            expect(testResult).to.eql([
                2, '2', 2, '2', 2, '2',
                3, '3', 3, '3',
                4, '4',
            ]);
        });

        it('测试 remove', function () {
            const obj = new ObservableMap([['2', 2], ['3', 3], ['4', 4], ['5', 5]]);

            obj.on('remove', callback);
            obj.on('remove', callback2);
            obj.once('remove', callback);

            obj.delete('1');
            obj.delete('2');
            obj.delete('3');

            obj.off('remove', callback2);

            obj.delete('4');

            obj.off('remove');

            obj.delete('5');

            expect(testResult).to.eql([
                2, '2', 2, '2', 2, '2',
                3, '3', 3, '3',
                4, '4',
            ]);
        });

        it('测试 update', function () {
            const obj = new ObservableMap([['1', 1]]);

            obj.on('update', callback);
            obj.on('update', callback2);
            obj.once('update', callback);

            obj.set('1', 1);
            obj.set('1', 2);

            obj.set('2', 2);

            obj.ensureChange = false;

            obj.set('2', 2);

            obj.off('update', callback2);

            obj.set('3', 3);
            obj.set('3', 4);

            obj.off('update');

            obj.set('4', 4);
            obj.set('4', 5);

            expect(testResult).to.eql([
                2, 1, '1', 2, 1, '1', 2, 1, '1',
                2, 2, '2', 2, 2, '2',
                4, 3, '3',
            ]);
        });

        it('测试 beforeUpdate', function () {
            const obj = new ObservableMap([['1', 1]]);

            obj.on('update', (newValue, oldValue, key) => { testResult.push('update', newValue, oldValue, key) });
            obj.on('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('on', newValue, oldValue, key, oMap) });
            obj.set('1', 1);
            obj.set('1', 2);

            obj.off('beforeUpdate');
            obj.set('1', 3);

            obj.once('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('once1', newValue, oldValue) });
            obj.set('1', 4);
            obj.set('1', 5);

            obj.once('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('once2', newValue, oldValue); return false; });
            obj.set('1', 5);
            obj.set('1', 6);
            expect(obj.value.get('1')).to.be(5);

            obj.once('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('once3', newValue, oldValue); changeTo(8); });
            obj.set('1', 7);
            expect(obj.value.get('1')).to.be(8);

            obj.once('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('once4', newValue, oldValue); changeTo(8); });
            obj.set('1', 9);
            expect(obj.value.get('1')).to.be(8);

            obj.once('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('once5', newValue, oldValue); changeTo(11); return false; });
            obj.set('1', 10);
            expect(obj.value.get('1')).to.be(8);

            obj.ensureChange = false;

            obj.once('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('once6', newValue, oldValue) });
            obj.set('1', 8);

            obj.once('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('once7', newValue, oldValue); changeTo(8); });
            obj.set('1', 11);
            expect(obj.value.get('1')).to.be(8);

            expect(testResult).to.eql([
                'on', 2, 1, '1', obj, 'update', 2, 1, '1',
                'update', 3, 2, '1',
                'once1', 4, 3, 'update', 4, 3, '1',
                'update', 5, 4, '1',
                'once2', 6, 5,
                'once3', 7, 5, 'update', 8, 5, '1',
                'once4', 9, 8,
                'once5', 10, 8,
                'once6', 8, 8, 'update', 8, 8, '1',
                'once7', 11, 8, 'update', 8, 8, '1',
            ]);
        });
    });
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