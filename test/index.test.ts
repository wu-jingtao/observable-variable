import expect = require('expect.js');

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

it('测试toJSON', function () {
    const ov = new ObservableVariable('ov');
    const oa = new ObservableArray(['oa']);
    const om = new ObservableMap([['om', 123], ['om', 456]]);
    const os = new ObservableSet(['os', 'os']);

    expect(JSON.stringify(ov)).to.be('"ov"');
    expect(JSON.stringify(oa)).to.be('["oa"]');
    expect(JSON.stringify(om)).to.be('[["om",456]]');
    expect(JSON.stringify(os)).to.be('["os"]');
});

describe('测试事件', function () {
    const testResult: any[] = [];
    function callback(...args: any[]) { testResult.push(...args); }
    function callback2(...args: any[]) { testResult.push(...args); }

    afterEach(function () {
        testResult.length = 0;
    })

    it('测试ObservableVariable', function () {
        const obj = new ObservableVariable('a');

        obj.on('set', callback);
        obj.on('set', callback2);
        obj.once('set', callback);
        obj.once('set', callback2);

        obj.value = 'b';

        obj.off('set', callback);

        obj.value = 'c';

        obj.off('set');

        obj.value = 'd';

        expect(testResult).to.eql([
            'b', 'a', 'b', 'a', 'b', 'a', 'b', 'a',
            'c', 'b'
        ]);
    });

    it('测试ObservableArray', function () {
        const obj = new ObservableArray<number | string>([1]);

        obj.on('set', callback);
        obj.on('set', callback2);
        obj.once('set', callback);

        obj.on('add', callback);
        obj.on('add', callback2);
        obj.once('add', callback);

        obj.on('remove', callback);
        obj.on('remove', callback2);
        obj.once('remove', callback);

        obj.push('a');
        obj.pop();

        obj.off('add', callback);
        obj.off('remove', callback);

        obj.push('b');
        obj.pop();

        obj.off('add');
        obj.off('remove');

        obj.push('c');
        obj.pop();

        obj.value = [2];

        obj.off('set', callback);

        obj.value = [3];

        obj.off('set');

        obj.value = [4];

        expect(testResult).to.eql([
            'a', 'a', 'a', 'a', 'a', 'a',
            'b', 'b',
            [2], [1], [2], [1], [2], [1],
            [3], [2]
        ]);
    });

    it('测试ObservableMap', function () {
        const m1 = new Map([['1', 1]]);
        const m2 = new Map([['2', 2]]);
        const m3 = new Map([['3', 3]]);
        const m4 = new Map([['4', 4]]);

        const obj = new ObservableMap(m1)

        obj.on('set', callback);
        obj.on('set', callback2);
        obj.once('set', callback);

        obj.on('add', callback);
        obj.on('add', callback2);
        obj.once('add', callback);

        obj.on('remove', callback);
        obj.on('remove', callback2);
        obj.once('remove', callback);

        obj.set('a', 1);
        obj.delete('a');

        obj.off('add', callback);
        obj.off('remove', callback);

        obj.set('b', 2);
        obj.delete('b');

        obj.off('add');
        obj.off('remove');

        obj.set('c', 3);
        obj.delete('c');

        obj.value = m2;

        obj.off('set', callback);

        obj.value = m3;

        obj.off('set');

        obj.value = m4;

        expect(testResult).to.eql([
            1, 'a', 1, 'a', 1, 'a', 1, 'a', 1, 'a', 1, 'a',
            2, 'b', 2, 'b',
            m2, m1, m2, m1, m2, m1,
            m3, m2
        ]);
    });

    it('测试ObservableSet', function () {
        const s1 = new Set<string | number>([1]);
        const s2 = new Set<string | number>([2]);
        const s3 = new Set<string | number>([3]);
        const s4 = new Set<string | number>([4]);

        const obj = new ObservableSet(s1)

        obj.on('set', callback);
        obj.on('set', callback2);
        obj.once('set', callback);

        obj.on('add', callback);
        obj.on('add', callback2);
        obj.once('add', callback);

        obj.on('remove', callback);
        obj.on('remove', callback2);
        obj.once('remove', callback);

        obj.add('a');
        obj.delete('a');

        obj.off('add', callback);
        obj.off('remove', callback);

        obj.add('b');
        obj.delete('b');

        obj.off('add');
        obj.off('remove');

        obj.add('c');
        obj.delete('c');

        obj.value = s2;

        obj.off('set', callback);

        obj.value = s3;

        obj.off('set');

        obj.value = s4;

        expect(testResult).to.eql([
            'a', 'a', 'a', 'a', 'a', 'a',
            'b', 'b',
            s2, s1, s2, s1, s2, s1,
            s3, s2
        ]);
    });
});