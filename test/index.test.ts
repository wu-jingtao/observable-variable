import * as _ from 'lodash';
import expect = require('expect.js');

import { ObservableVariable, ObservableArray, ObservableMap, ObservableSet, watch, setStorageEngine, permanent_oVar } from '../src';

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

        const i3 = new ObservableVariable(o2, { readonly: true, ensureChange: false, deepCompare: true });
        const i4 = new ObservableVariable(i3, { readonly: false, ensureChange: true, deepCompare: false });
        expect(i3).to.be(i4);
        expect(i3.value).to.be(o2);
        expect(i3.readonly).to.be(true);
        expect(i3.ensureChange).to.be(false);
        expect(i3.deepCompare).to.be(true);
        expect(i4.readonly).to.be(true);
        expect(i4.ensureChange).to.be(false);
        expect(i4.deepCompare).to.be(true);

        const i5 = ObservableVariable.observe(o3);
        const i6 = ObservableVariable.observe(i5);
        expect(i5).to.be(i6);
        expect(i5.value).to.be(o3);

        ObservableVariable.observe(o4, 'test4');
        ObservableVariable.observe(o4, ['test5']);

        expect(o4.test4).to.be.a(ObservableVariable);
        expect(o4.test5).to.be.a(ObservableVariable);

        ObservableVariable.observe(o5, 'test6', { readonly: true, ensureChange: false, deepCompare: true });
        ObservableVariable.observe(o5, ['test7'], { readonly: true, ensureChange: false, deepCompare: true });

        expect(o5.test6).to.be.a(ObservableVariable);
        expect(o5.test7).to.be.a(ObservableVariable);
        expect((o5.test6 as any).readonly).to.be(true);
        expect((o5.test6 as any).ensureChange).to.be(false);
        expect((o5.test6 as any).deepCompare).to.be(true);
        expect((o5.test7 as any).readonly).to.be(true);
        expect((o5.test7 as any).ensureChange).to.be(false);
        expect((o5.test7 as any).deepCompare).to.be(true);
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

        const i3 = new ObservableArray(o2, { readonly: true, ensureChange: false, deepCompare: true, provideOnSetOldValue: true });
        const i4 = new ObservableArray(i3, { readonly: false, ensureChange: true, deepCompare: false, provideOnSetOldValue: false });
        expect(i3).to.be(i4);
        expect(i3.value).to.be(o2);
        expect(i3.readonly).to.be(true);
        expect(i3.ensureChange).to.be(false);
        expect(i3.deepCompare).to.be(true);
        expect(i3.provideOnSetOldValue).to.be(true);
        expect(i4.readonly).to.be(true);
        expect(i4.ensureChange).to.be(false);
        expect(i4.deepCompare).to.be(true);
        expect(i4.provideOnSetOldValue).to.be(true);

        const i5 = ObservableArray.observe(o3);
        const i6 = ObservableArray.observe(i5);
        expect(i5).to.be(i6);
        expect(i5.value).to.be(o3);

        ObservableArray.observe(o4, 'test4');
        ObservableArray.observe(o4, ['test5']);

        expect(o4.test4).to.be.a(ObservableArray);
        expect(o4.test5).to.be.a(ObservableArray);

        ObservableArray.observe(o5, 'test6', { readonly: true, ensureChange: false, deepCompare: true, provideOnSetOldValue: true });
        ObservableArray.observe(o5, ['test7'], { readonly: true, ensureChange: false, deepCompare: true, provideOnSetOldValue: true });

        expect(o5.test6).to.be.a(ObservableArray);
        expect(o5.test7).to.be.a(ObservableArray);
        expect((o5.test6 as any).readonly).to.be(true);
        expect((o5.test6 as any).ensureChange).to.be(false);
        expect((o5.test6 as any).deepCompare).to.be(true);
        expect((o5.test6 as any).provideOnSetOldValue).to.be(true);
        expect((o5.test7 as any).readonly).to.be(true);
        expect((o5.test7 as any).ensureChange).to.be(false);
        expect((o5.test7 as any).deepCompare).to.be(true);
        expect((o5.test7 as any).provideOnSetOldValue).to.be(true);
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

        const i3 = new ObservableMap(o2, { readonly: true, ensureChange: false, deepCompare: true });
        const i4 = new ObservableMap(i3, { readonly: false, ensureChange: true, deepCompare: false });
        expect(i3).to.be(i4);
        expect([...i3.value.entries()]).to.eql(o2);
        expect(i3.readonly).to.be(true);
        expect(i3.ensureChange).to.be(false);
        expect(i3.deepCompare).to.be(true);
        expect(i4.readonly).to.be(true);
        expect(i4.ensureChange).to.be(false);
        expect(i4.deepCompare).to.be(true);

        const i5 = ObservableMap.observe(o3);
        const i6 = ObservableMap.observe(i5);
        expect(i5).to.be(i6);
        expect([...i5.value.entries()]).to.eql(o3);

        ObservableMap.observe(o4, 'test4');
        ObservableMap.observe(o4, ['test5']);

        expect(o4.test4).to.be.a(ObservableMap);
        expect(o4.test5).to.be.a(ObservableMap);

        ObservableMap.observe(o5, 'test6', { readonly: true, ensureChange: false, deepCompare: true });
        ObservableMap.observe(o5, ['test7'], { readonly: true, ensureChange: false, deepCompare: true });

        expect(o5.test6).to.be.a(ObservableMap);
        expect(o5.test7).to.be.a(ObservableMap);
        expect((o5.test6 as any).readonly).to.be(true);
        expect((o5.test6 as any).ensureChange).to.be(false);
        expect((o5.test6 as any).deepCompare).to.be(true);
        expect((o5.test7 as any).readonly).to.be(true);
        expect((o5.test7 as any).ensureChange).to.be(false);
        expect((o5.test7 as any).deepCompare).to.be(true);
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

        const i3 = new ObservableSet(o2, { readonly: true, ensureChange: false, deepCompare: true });
        const i4 = new ObservableSet(i3, { readonly: false, ensureChange: true, deepCompare: false });
        expect(i3).to.be(i4);
        expect([...i3.value.values()]).to.eql(o2);
        expect(i3.readonly).to.be(true);
        expect(i3.ensureChange).to.be(false);
        expect(i3.deepCompare).to.be(true);
        expect(i4.readonly).to.be(true);
        expect(i4.ensureChange).to.be(false);
        expect(i4.deepCompare).to.be(true);

        const i5 = ObservableSet.observe(o3);
        const i6 = ObservableSet.observe(i5);
        expect(i5).to.be(i6);
        expect([...i5.value.values()]).to.eql(o3);

        ObservableSet.observe(o4, 'test4');
        ObservableSet.observe(o4, ['test5']);

        expect(o4.test4).to.be.a(ObservableSet);
        expect(o4.test5).to.be.a(ObservableSet);

        ObservableSet.observe(o5, 'test6', { readonly: true, ensureChange: false, deepCompare: true });
        ObservableSet.observe(o5, ['test7'], { readonly: true, ensureChange: false, deepCompare: true });

        expect(o5.test6).to.be.a(ObservableSet);
        expect(o5.test7).to.be.a(ObservableSet);
        expect((o5.test6 as any).readonly).to.be(true);
        expect((o5.test6 as any).ensureChange).to.be(false);
        expect((o5.test6 as any).deepCompare).to.be(true);
        expect((o5.test7 as any).readonly).to.be(true);
        expect((o5.test7 as any).ensureChange).to.be(false);
        expect((o5.test7 as any).deepCompare).to.be(true);
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
        expect(() => obj.length = 0).to.throwError(/尝试修改一个只读的 ObservableArray/);

        expect(obj.set.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.delete.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.deleteAll.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.pop.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.push.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.shift.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.unshift.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
        expect(obj.splice.bind(obj)).to.throwError(/尝试修改一个只读的 ObservableArray/);
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
});

describe('测试事件', function () {
    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    describe('测试ObservableVariable', function () {

        it('测试 set', function () {
            const obj = new ObservableVariable<any>('a');

            function callback_on(newValue: any, oldValue: any) { testResult.push('on', newValue, oldValue) }
            function callback_once(newValue: any, oldValue: any) { testResult.push('once', newValue, oldValue) }

            obj.on('set', callback_on);
            obj.once('set', callback_once);

            obj.value = 'a';
            obj.value = 'b';
            obj.value = 'c';

            obj.ensureChange = false;
            obj.value = 'c';

            obj.ensureChange = true;
            obj.deepCompare = true;
            obj._changeStealthily(['1']);
            obj.value = ['1'];
            obj.value = ['2'];

            obj.off('set', callback_on);
            obj.off('set', callback_once);

            obj.value = 'd';

            expect(testResult).to.eql([
                'on', 'b', 'a', 'once', 'b', 'a',
                'on', 'c', 'b',
                'on', 'c', 'c',
                'on', ['2'], ['1'],
            ]);
        });

        it('测试 beforeSet', function () {
            const obj = new ObservableVariable<any>('a');

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

            obj.ensureChange = true;
            obj.deepCompare = true;
            obj._changeStealthily(['1']);

            obj.once('beforeSet', (newValue, oldValue) => { testResult.push('once8', newValue, oldValue) });
            obj.value = ['1'];
            obj.value = ['2'];

            obj.once('beforeSet', (newValue, oldValue, changeTo, oVar) => { testResult.push('once9', newValue, oldValue, oVar); changeTo(['2']); });
            obj.value = ['3'];

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
                'once8', ['2'], ['1'], 'set', ['2'], ['1'],
                'once9', ['3'], ['2'], obj,
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

        it('测试 update', function () {
            const obj = new ObservableArray<any>([1]);

            obj.on('update', callback);
            obj.on('update', callback2);
            obj.once('update', callback);

            expect(obj.set(0, 1)).to.be(1);
            expect(obj.set(0, 2)).to.be(2);

            obj.ensureChange = false;

            expect(obj.set(1, 2)).to.be(2);
            expect(obj.set(1, 2)).to.be(2);

            obj.off('update', callback2);

            expect(obj.set(2, 3)).to.be(3);
            expect(obj.set(2, 4)).to.be(4);

            obj.ensureChange = true;
            obj.deepCompare = true;

            expect(obj.set(3, ['1'])).to.eql(['1']);
            expect(obj.set(3, ['1'])).to.eql(['1']);
            expect(obj.set(3, ['2'])).to.eql(['2']);

            obj.off('update');

            expect(obj.set(4, 4)).to.be(4);
            expect(obj.set(4, 5)).to.be(5);

            expect(testResult).to.eql([
                2, 1, 0, 2, 1, 0, 2, 1, 0,
                2, 2, 1, 2, 2, 1,
                4, 3, 2,
                ['2'], ['1'], 3,
            ]);
        });

        it('测试 beforeUpdate', function () {
            const obj = new ObservableArray<any>([1]);

            obj.on('update', (newValue, oldValue, index) => { testResult.push('update', newValue, oldValue, index) });
            obj.on('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('on', newValue, oldValue, index, oArr) });
            expect(obj.set(0, 1)).to.be(1);
            expect(obj.set(0, 2)).to.be(2);

            obj.off('beforeUpdate');
            expect(obj.set(0, 3)).to.be(3);

            obj.once('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('once1', newValue, oldValue) });
            expect(obj.set(0, 4)).to.be(4);
            expect(obj.set(0, 5)).to.be(5);

            obj.once('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('once2', newValue, oldValue); return false; });
            expect(obj.set(0, 5)).to.be(5);
            expect(obj.set(0, 6)).to.be(6);
            expect(obj.value[0]).to.be(5);

            obj.once('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('once3', newValue, oldValue); changeTo(8); });
            expect(obj.set(0, 7)).to.be(7);
            expect(obj.value[0]).to.be(8);

            obj.once('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('once4', newValue, oldValue); changeTo(8); });
            expect(obj.set(0, 9)).to.be(9);
            expect(obj.value[0]).to.be(8);

            obj.once('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('once5', newValue, oldValue); changeTo(11); return false; });
            expect(obj.set(0, 10)).to.be(10);
            expect(obj.value[0]).to.be(8);

            obj.ensureChange = false;

            obj.once('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('once6', newValue, oldValue) });
            expect(obj.set(0, 8)).to.be(8);

            obj.once('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('once7', newValue, oldValue); changeTo(8); });
            expect(obj.set(0, 11)).to.be(11);
            expect(obj.value[0]).to.be(8);

            obj.ensureChange = true;
            obj.deepCompare = true;
            obj.value[0] = ['1'];

            obj.once('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('once8', newValue, oldValue) });
            expect(obj.set(0, ['1'])).to.eql(['1']);
            expect(obj.set(0, ['2'])).to.eql(['2']);

            obj.once('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('once9', newValue, oldValue); changeTo(['2']); });
            expect(obj.set(0, ['3'])).to.eql(['3']);

            expect(testResult).to.eql([
                'on', 2, 1, 0, obj, 'update', 2, 1, 0,
                'update', 3, 2, 0,
                'once1', 4, 3, 'update', 4, 3, 0,
                'update', 5, 4, 0,
                'once2', 6, 5,
                'once3', 7, 5, 'update', 8, 5, 0,
                'once4', 9, 8,
                'once5', 10, 8,
                'once6', 8, 8, 'update', 8, 8, 0,
                'once7', 11, 8, 'update', 8, 8, 0,
                'once8', ['2'], ['1'], 'update', ['2'], ['1'], 0,
                'once9', ['3'], ['2'],
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
            const obj = new ObservableMap<string, any>([['1', 1]]);

            obj.on('update', callback);
            obj.on('update', callback2);
            obj.once('update', callback);

            obj.set('1', 1);
            obj.set('1', 2);

            obj.ensureChange = false;

            obj.set('2', 2);
            obj.set('2', 2);

            obj.off('update', callback2);

            obj.set('3', 3);
            obj.set('3', 4);

            obj.ensureChange = true;
            obj.deepCompare = true;

            obj.set('4', ['1']);
            obj.set('4', ['1']);
            obj.set('4', ['2']);

            obj.off('update');

            obj.set('5', 5);
            obj.set('5', 6);

            expect(testResult).to.eql([
                2, 1, '1', 2, 1, '1', 2, 1, '1',
                2, 2, '2', 2, 2, '2',
                4, 3, '3',
                ['2'], ['1'], '4',
            ]);
        });

        it('测试 beforeUpdate', function () {
            const obj = new ObservableMap<string, any>([['1', 1]]);

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

            obj.ensureChange = true;
            obj.deepCompare = true;
            obj.value.set('1', ['1']);

            obj.once('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('once8', newValue, oldValue) });
            obj.set('1', ['1']);
            obj.set('1', ['2']);

            obj.once('beforeUpdate', (key, newValue, oldValue, changeTo, oMap) => { testResult.push('once9', newValue, oldValue); changeTo(['2']); });
            obj.set('1', ['3']);

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
                'once8', ['2'], ['1'], 'update', ['2'], ['1'], '1',
                'once9', ['3'], ['2'],
            ]);
        });
    });
});

describe('测试ObservableArray 修改操作方法', function () {

    it('测试 属性length', function () {
        const testResult: any[] = [];

        const obj = new ObservableArray([1, 2, 3]);
        obj.on('add', (value) => testResult.push('add', value));
        obj.on('remove', (value) => testResult.push('remove', value));

        obj.length = -1;
        obj.length = 2 ** 32;

        obj.length = 3;
        expect(obj.value).to.eql([1, 2, 3]);

        obj.length = 1;
        expect(obj.value).to.eql([1]);

        obj.length = 5;
        expect(obj.value).to.eql([1, undefined, undefined, undefined, undefined]);

        expect(testResult).to.eql([
            'remove', 3, 'remove', 2,
            'add', undefined, 'add', undefined, 'add', undefined, 'add', undefined,
        ]);
    });

    it('测试 set', function () {
        const testResult: any[] = [];

        const obj = new ObservableArray([1]);
        obj.on('add', (value) => testResult.push('add', value));
        obj.on('update', (newValue, oldValue, index) => testResult.push('update', newValue, oldValue, index));
        obj.on('beforeUpdate', (index, newValue, oldValue, changeTo, oArr) => { testResult.push('beforeUpdate', newValue, oldValue, index, oArr) });

        expect(obj.set(0, 1)).to.be(1);
        expect(obj.set(0, 2)).to.be(2);

        expect(obj.set(1, 3)).to.be(3);

        expect(obj.value).to.eql([2, 3]);
        expect(testResult).to.eql([
            'beforeUpdate', 2, 1, 0, obj, 'update', 2, 1, 0,
            'add', 3,
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
            ...actual().splice(0).reverse(),
            ...actual().splice(0.9).reverse(),
            ...actual().splice(5).reverse(),
            ...actual().splice(999).reverse(),
            ...actual().splice(-0.9).reverse(),
            ...actual().splice(-5).reverse(),
            ...actual().splice(-999).reverse(),

            ...actual().splice(1, 0).reverse(),
            ...actual().splice(1, 0.9).reverse(),
            ...actual().splice(1, 1).reverse(),
            ...actual().splice(1, 100).reverse(),
            ...actual().splice(1, -0.9).reverse(),
            ...actual().splice(1, -1).reverse(),
            ...actual().splice(1, -100).reverse(),

            ...actual().splice(1, 0, 1).reverse(), 1,
            ...actual().splice(1, 0, 2, 3, 4).reverse(), 2, 3, 4,
            ...actual().splice(-1, 0, 1).reverse(), 1,
            ...actual().splice(-1, 0, 2, 3, 4).reverse(), 2, 3, 4,
        ]);
    });

    it('测试 sort', function () {
        const testResult: any[] = [];
        const obj = new ObservableArray([1, 4, 3, 2]);

        obj.on('set', (newValue, oldValue) => testResult.push(newValue, oldValue));

        expect(obj.sort()).to.be(obj);

        obj.provideOnSetOldValue = true;
        obj._changeStealthily([1, 4, 3, 2]);

        expect(obj.sort()).to.be(obj);

        expect(testResult).to.eql([
            [1, 2, 3, 4], [1, 2, 3, 4],
            [1, 2, 3, 4], [1, 4, 3, 2]
        ]);
    });

    it('测试 reverse', function () {
        const testResult: any[] = [];
        const obj = new ObservableArray([1, 2, 3, 4]);

        obj.on('set', (newValue, oldValue) => testResult.push(newValue, oldValue));

        expect(obj.reverse()).to.be(obj);

        obj.provideOnSetOldValue = true;
        obj._changeStealthily([1, 2, 3, 4]);

        expect(obj.reverse()).to.be(obj);

        expect(testResult).to.eql([
            [4, 3, 2, 1], [4, 3, 2, 1],
            [4, 3, 2, 1], [1, 2, 3, 4]
        ]);
    });

    it('测试 fill', function () {
        const testResult: any[] = [];
        const obj = new ObservableArray([1, 2, 3, 4]);

        obj.on('set', (newValue, oldValue) => testResult.push(newValue, oldValue));

        expect(obj.fill(9, 1, 3)).to.be(obj);

        obj.provideOnSetOldValue = true;
        obj._changeStealthily([1, 2, 3, 4]);

        expect(obj.fill(9, 1, 3)).to.be(obj);

        expect(testResult).to.eql([
            [1, 9, 9, 4], [1, 9, 9, 4],
            [1, 9, 9, 4], [1, 2, 3, 4]
        ]);
    });

    it('测试 copyWithin', function () {
        const testResult: any[] = [];
        const obj = new ObservableArray([1, 2, 3, 4]);

        obj.on('set', (newValue, oldValue) => testResult.push(newValue, oldValue));

        expect(obj.copyWithin(1, 2, 3)).to.be(obj);

        obj.provideOnSetOldValue = true;
        obj._changeStealthily([1, 2, 3, 4]);

        expect(obj.copyWithin(1, 2, 3)).to.be(obj);

        expect(testResult).to.eql([
            [1, 3, 3, 4], [1, 3, 3, 4],
            [1, 3, 3, 4], [1, 2, 3, 4]
        ]);
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

it('测试 watch', function () {
    const oVar = new ObservableVariable<any>(undefined);
    const oArr = new ObservableArray<any>([0]);
    const oSet = new ObservableSet<any>([]);
    const oMap = new ObservableMap<string, any>([]);

    let testResult = 0;

    const cancel = watch([oVar, oArr, oSet, oMap], () => { testResult++ });

    function test() {
        oVar.value = 1;         //set

        oArr.push(1);           //add
        oArr.pop();             //remove
        oArr.set(0, 1);         //update
        oArr.value = [];        //set

        oSet.add(1);            //add
        oSet.delete(1);         //remove
        oSet.value = new Set(); //set

        oMap.set('a', 1);       //add
        oMap.delete('a');       //remove
        oMap.set('1', 2);       //update
        oMap.value = new Map(); //set
    }

    test();

    cancel();

    test();

    expect(testResult).to.be(12);
});

describe('测试 PermanentVariable', function () {

    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    it('测试 创建', function () {
        setStorageEngine({
            set(key, value, expire) {
                testResult.push('set', key, value.value, expire);
            },
            get(key) {
                testResult.push('get', key);
                return undefined;
            },
            delete(key) {
                testResult.push('delete', key);
            },
            has(key) {
                testResult.push('has', key);
                return true;
            }
        });

        const oVar = permanent_oVar('test', { deepCompare: true, ensureChange: false, readonly: true });

        expect(oVar.deepCompare).to.be(true);
        expect(oVar.ensureChange).to.be(false);
        expect(oVar.readonly).to.be(true);
        expect(testResult).to.eql([
            'has', 'test', 'get', 'test'
        ]);
    });

    it('测试 defaultValue', function () {
        setStorageEngine({
            set(key, value, expire) {
                testResult.push('set', key, value.value, expire);
            },
            get(key) {
                testResult.push('get', key);
                return undefined;
            },
            delete(key) {
                testResult.push('delete', key);
            },
            has(key) {
                testResult.push('has', key);
                return false;
            }
        });

        const oVar: ObservableVariable<number> = permanent_oVar('test', { defaultValue: 123 });

        expect(oVar.value).to.be(123);
        expect(testResult).to.eql([
            'has', 'test'
        ]);
    });

    it('测试 throttle', function (done) {
        setStorageEngine({
            set(key, value, expire) {
                testResult.push('set', key, value.value, expire);

                if (value.value !== 2) {    //lodash的throttle第一次会立即执行
                    expect(Date.now() - start).to.above(499);
                    expect(testResult).to.eql([
                        'has', 'test', 'get', 'test',
                        'set', 'test', 2, undefined,
                        'set', 'test', 7, undefined,
                    ]);

                    done();
                }
            },
            get(key) {
                testResult.push('get', key);
                return 1;
            },
            delete(key) {
                testResult.push('delete', key);
            },
            has(key) {
                testResult.push('has', key);
                return true;
            }
        });

        const oVar = permanent_oVar('test', { throttle: 500 });
        expect(oVar.value).to.be(1);
        const start = Date.now();
        oVar.value = 2;
        oVar.value = 3;
        setTimeout(() => oVar.value = 4, 100);
        setTimeout(() => oVar.value = 5, 200);
        setTimeout(() => oVar.value = 6, 300);
        setTimeout(() => oVar.value = 7, 400);
    });

    it('测试 expire', function () {
        setStorageEngine({
            set(key, value, expire) {
                testResult.push('set', key, value.value, expire);
            },
            get(key) {
                testResult.push('get', key);
                return 123;
            },
            delete(key) {
                testResult.push('delete', key);
            },
            has(key) {
                testResult.push('has', key);
                return true;
            }
        });

        const oVar = permanent_oVar('test', { expire: 1000, throttle: 0 });
        expect(oVar.value).to.be(123);
        oVar.value = 456;
        expect(oVar.value).to.be(456);
        expect(testResult).to.eql([
            'has', 'test', 'get', 'test',
            'set', 'test', 456, 1000
        ]);
    });

    it('测试 init', function () {
        setStorageEngine({
            set(key, value, expire) {
                testResult.push('set', key, value.value, expire);
            },
            get(key) {
                testResult.push('get', key);
                return 123;
            },
            delete(key) {
                testResult.push('delete', key);
            },
            has(key) {
                testResult.push('has', key);
                return true;
            }
        });

        const oVar = permanent_oVar('test', { init: v => { testResult.push('init', v); return 456; } });
        expect(oVar.value).to.be(456);
        expect(testResult).to.eql([
            'has', 'test', 'get', 'test',
            'init', 123
        ]);
    });
});