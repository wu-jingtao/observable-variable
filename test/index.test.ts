import _ from 'lodash';
import expect from 'expect.js';
import { oVar, oArr, oMap, oSet, watch, ObservableArray } from '../src';

describe('测试 创建可观察变量', function () {
    it('测试 ObservableVariable', function () {
        const o1 = 'test1';
        const o2 = 'test2';

        const i1 = oVar(o1);
        expect(i1.value).to.be(o1);
        expect((i1 as any)._serializable).to.be(true);
        expect((i1 as any)._ensureChange).to.be(true);
        expect((i1 as any)._deepCompare).to.be(false);

        const i2 = oVar(o2, { serializable: false, ensureChange: false, deepCompare: true });
        const i3 = oVar(i2, { serializable: true, ensureChange: true, deepCompare: false });
        expect(i2).to.be(i3);
        expect(i3.value).to.be(o2);
        expect((i2 as any)._ensureChange).to.be(false);
        expect((i2 as any)._ensureChange).to.be(false);
        expect((i2 as any)._deepCompare).to.be(true);
        expect((i3 as any)._serializable).to.be(false);
        expect((i3 as any)._ensureChange).to.be(false);
        expect((i3 as any)._deepCompare).to.be(true);
    });

    it('测试 ObservableArray', function () {
        const o1 = ['test'];
        const o2 = ['test2'];

        const i1 = oArr(o1);
        expect(i1.value).to.be(o1);
        expect((i1 as any)._serializable).to.be(true);
        expect((i1 as any)._ensureChange).to.be(true);
        expect((i1 as any)._deepCompare).to.be(false);
        expect((i1 as any)._provideOnSetOldValue).to.be(false);

        const i2 = oArr(o2, { serializable: false, ensureChange: false, deepCompare: true, provideOnSetOldValue: true });
        expect(i2.value).to.be(o2);
        expect((i2 as any)._serializable).to.be(false);
        expect((i2 as any)._ensureChange).to.be(false);
        expect((i2 as any)._deepCompare).to.be(true);
        expect((i2 as any)._provideOnSetOldValue).to.be(true);
    });

    it('测试ObservableMap', function () {
        const o1 = [['key', 'value']] as [string, string][];
        const o2 = new Map<number, string>();

        const i1 = oMap(o1);
        const i2 = oMap(o2);
        expect(i1.value).to.be.a(Map);
        expect(i2.value).to.be.a(Map);
        expect([...i1.value.entries()]).to.be.eql([['key', 'value']]);
        expect(i2.value).to.be(o2);
    });

    it('测试ObservableSet', function () {
        const o1 = [['test1', 'test2']];
        const o2 = new Set<string>();

        const i1 = oSet(o1);
        const i2 = oSet(o2);
        expect(i1.value).to.be.a(Set);
        expect(i2.value).to.be.a(Set);
        expect([...i1.value]).to.be.eql([['test1', 'test2']]);
        expect(i2.value).to.be(o2);
    });
});

describe('测试 序列化', function () {
    it('测试 可序列化', function () {
        const testData = {
            ov: oVar('ov'),
            oa: oArr(['oa']),
            om: oMap([['om', 123], ['om', 456]]),
            os: oSet(['os', 'os'])
        };

        expect(JSON.stringify(testData)).to.be('{"ov":"ov","oa":["oa"],"om":[["om",456]],"os":["os"]}');
    });

    it('测试 不可序列化', function () {
        const testData = {
            ov: oVar('ov', { serializable: false }),
            oa: oArr(['oa'], { serializable: false }),
            om: oMap([['om', 123], ['om', 456]], { serializable: false }),
            os: oSet(['os', 'os'], { serializable: false })
        };

        expect(JSON.stringify(testData)).to.be('{}');
    });
});

it('测试 元素个数属性', function () {
    const oa = oArr(['oa', 'oa']);
    const om = oMap([['om', 123], ['om', 456]]);
    const os = oSet(['os', 'os']);

    expect(oa.length).to.be(2);
    expect(om.size).to.be(1);
    expect(os.size).to.be(1);
});

it('测试 ObservableArray first与last属性', function () {
    const oa = oArr([1, 2, 3]);
    expect(oa.first).to.be(1);
    expect(oa.last).to.be(3);
});

describe('测试 事件', function () {
    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    describe('测试 ObservableVariable', function () {
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

    describe('测试 ObservableArray', function () {
        it('测试 add', function () {
            const o1 = oArr([1]);

            o1.on('add', (...args: any[]) => testResult.push(...args));
            o1.once('add', (...args: any[]) => testResult.push(...args));

            o1.push(2, 3);

            expect(testResult).to.eql([2, o1, 2, o1, 3, o1]);
        });

        it('测试 delete', function () {
            const o1 = oArr([1, 2, 3]);

            o1.on('delete', (...args: any[]) => testResult.push(...args));
            o1.once('delete', (...args: any[]) => testResult.push(...args));

            o1.length = 1;

            expect(testResult).to.eql([3, o1, 3, o1, 2, o1]);
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

    describe('测试 ObservableSet', function () {
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

    describe('测试 ObservableMap', function () {
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
});

describe('测试 ObservableArray 修改操作方法', function () {
    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    it('测试 length属性', function () {
        const obj = oArr([1, 2, 3]);
        obj.on('add', value => testResult.push('add', value));
        obj.on('delete', value => testResult.push('delete', value));

        expect(() => obj.length = -1).to.throwException(/Invalid array length/);
        expect(() => obj.length = 2 ** 32).to.throwException(/Invalid array length/);
        expect(() => obj.length = 1.1).to.throwException(/Invalid array length/);

        obj.length = 3;
        expect(obj.value).to.eql([1, 2, 3]);

        obj.length = 1;
        expect(obj.value).to.eql([1]);

        obj.length = 5;
        expect(obj.value).to.eql([1, undefined, undefined, undefined, undefined]);

        expect(testResult).to.eql([
            'delete', 3, 'delete', 2,
            'add', undefined, 'add', undefined, 'add', undefined, 'add', undefined
        ]);
    });

    it('测试 set', function () {
        const obj = oArr([1]);
        obj.on('add', value => testResult.push('add', value));
        obj.on('update', (newValue, oldValue, index) => testResult.push('update', newValue, oldValue, index));
        obj.on('beforeUpdate', (newValue, oldValue, index) => { testResult.push('beforeUpdate', newValue, oldValue, index); return newValue });

        expect(obj.set(0, 1)).to.be(obj);
        expect(obj.set(0, 2)).to.be(obj);
        expect(obj.set(1, 3)).to.be(obj);
        expect(obj.set(3, 5)).to.be(obj);

        expect(obj.value).to.eql([2, 3, undefined, 5]);
        expect(testResult).to.eql([
            'beforeUpdate', 1, 1, 0,
            'beforeUpdate', 2, 1, 0, 'update', 2, 1, 0,
            'add', 3,
            'add', undefined, 'add', 5
        ]);
    });

    it('测试 delete', function () {
        const obj = oArr([1, 1, 2, 2]);
        obj.on('delete', value => testResult.push(value));

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
        const obj = oArr([1, 1, 2, 2]);
        obj.on('delete', value => testResult.push(value));

        expect(obj.deleteAll(1)).to.be(obj);
        expect(obj.deleteAll(2)).to.be(obj);

        expect(obj.value.length).to.be(0);

        expect(obj.deleteAll(1)).to.be(obj);
        expect(obj.deleteAll(2)).to.be(obj);

        expect(testResult).to.eql([
            1, 1, 2, 2
        ]);
    });

    it('测试 pop', function () {
        const obj = oArr([1, 2]);
        obj.on('delete', value => testResult.push(value));

        expect(obj.pop()).to.be(2);
        expect(obj.pop()).to.be(1);
        expect(obj.pop()).to.be(undefined);
        expect(obj.value.length).to.be(0);
        expect(testResult).to.eql([2, 1]);
    });

    it('测试 push', function () {
        const obj = oArr<number>([]);
        obj.on('add', value => testResult.push(value));

        expect(obj.push(1)).to.be(1);
        expect(obj.push(2)).to.be(2);
        expect(obj.push(3, 4)).to.be(4);
        expect(obj.value.length).to.be(4);
        expect(obj.value).to.eql([1, 2, 3, 4]);
        expect(testResult).to.eql([1, 2, 3, 4]);
    });

    it('测试 shift', function () {
        const obj = oArr([1, 2]);
        obj.on('delete', value => testResult.push(value));

        expect(obj.shift()).to.be(1);
        expect(obj.shift()).to.be(2);
        expect(obj.shift()).to.be(undefined);
        expect(obj.value.length).to.be(0);
        expect(testResult).to.eql([1, 2]);
    });

    it('测试 unshift', function () {
        const obj = oArr<number>([]);
        obj.on('add', value => testResult.push(value));

        expect(obj.unshift(1)).to.be(1);
        expect(obj.unshift(2)).to.be(2);
        expect(obj.unshift(3, 4)).to.be(4);
        expect(obj.value.length).to.be(4);
        expect(obj.value).to.eql([3, 4, 2, 1]);
        expect(testResult).to.eql([1, 2, 3, 4]);
    });

    it('测试 splice', function () {
        const testArray = oArr(actual());
        testArray.on('add', value => testResult.push(value));
        testArray.on('delete', value => testResult.push(value));

        function actual(): number[] {
            return _.range(10);
        }

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
            ...actual().splice(-1, 0, 2, 3, 4).reverse(), 2, 3, 4
        ]);
    });

    it('测试 sort', function () {
        const obj = oArr([1, 4, 3, 2]);
        obj.on('set', (newValue, oldValue) => testResult.push(newValue, oldValue));
        expect(obj.sort()).to.be(obj);

        const obj2 = oArr([1, 4, 3, 2]);
        obj2.on('set', (newValue, oldValue) => testResult.push(newValue, oldValue));
        expect(obj2.sort((a, b) => b - a)).to.be(obj2);

        const obj3 = oArr([1, 4, 3, 2], { provideOnSetOldValue: true });
        obj3.on('set', (newValue, oldValue) => testResult.push(newValue, oldValue));
        expect(obj3.sort()).to.be(obj3);

        expect(testResult).to.eql([
            [1, 2, 3, 4], [1, 2, 3, 4],
            [4, 3, 2, 1], [4, 3, 2, 1],
            [1, 2, 3, 4], [1, 4, 3, 2]
        ]);
    });

    it('测试 reverse', function () {
        const obj = oArr([1, 2, 3, 4]);
        obj.on('set', (newValue, oldValue) => testResult.push(newValue, oldValue));
        expect(obj.reverse()).to.be(obj);

        const obj2 = oArr([1, 2, 3, 4], { provideOnSetOldValue: true });
        obj2.on('set', (newValue, oldValue) => testResult.push(newValue, oldValue));
        expect(obj2.reverse()).to.be(obj2);

        expect(testResult).to.eql([
            [4, 3, 2, 1], [4, 3, 2, 1],
            [4, 3, 2, 1], [1, 2, 3, 4]
        ]);
    });

    it('测试 fill', function () {
        const obj = oArr(_.range(5));
        obj.on('update', (newValue, oldValue, index) => testResult.push(newValue, oldValue, index));
        obj.on('beforeUpdate', (newValue, oldValue, index) => testResult.push('beforeUpdate', newValue, oldValue, index));

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
            ..._.times(4, i => [4, i, i]).flat(),
            ..._.times(4, i => [9, i + 1, i + 1]).flat(),
            ..._.times(4, i => [9, i + 1, i + 1]).flat(),
            9, 4, 4,
            9, 4, 4,
            ..._.times(5, i => [9, i, i]).flat(),
            9, 2, 2,
            ..._.times(3, i => [9, i + 2, i + 2]).flat(),
            ..._.times(2, i => [9, i + 2, i + 2]).flat()
        ]);
    });

    it('测试 copyWithin', function () {
        const obj = oArr(_.range(5));
        obj.on('update', (newValue, oldValue, index) => testResult.push(newValue, oldValue, index));
        obj.on('beforeUpdate', (newValue, oldValue, index) => testResult.push('beforeUpdate', newValue, oldValue, index));

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
            ..._.times(3, i => [i + 2, i, i]).flat(),
            ..._.times(2, i => [i + 2, i + 3, i + 3]).flat(),
            2, 4, 4,
            ..._.times(3, i => [i + 2, i, i]).flat(),
            ..._.times(3, i => [i + 2, i, i]).flat(),
            ..._.times(3, i => [i, i + 2, i + 2]).flat(),
            4, 2, 2,
            ..._.times(3, i => [i, i + 2, i + 2]).flat(),
            ..._.times(3, i => [i, i + 2, i + 2]).flat(),
            0, 2, 2,
            ..._.times(3, i => [i, i + 2, i + 2]).flat(),
            ..._.times(2, i => [i, i + 2, i + 2]).flat()
        ]);
    });
});

describe('测试 ObservableMap 修改操作方法', function () {
    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    it('测试 clear', function () {
        const obj = oMap([['a', 1], ['b', 2]]);
        obj.on('delete', (value, key) => testResult.push(key, value));

        obj.clear();

        expect(obj.value.size).to.be(0);
        expect(testResult).to.eql([
            'a', 1, 'b', 2
        ]);
    });

    it('测试 delete', function () {
        const obj = oMap([['a', 1]]);
        obj.on('delete', (value, key) => testResult.push(key, value));

        expect(obj.delete('a')).to.be.ok();
        expect(obj.delete('a')).to.not.be.ok();
        expect(obj.delete('b')).to.not.be.ok();

        expect(obj.value.size).to.be(0);
        expect(testResult).to.eql([
            'a', 1
        ]);
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

describe('测试ObservableSet 修改操作方法', function () {
    const testResult: any[] = [];

    afterEach(function () {
        testResult.length = 0;
    });

    it('测试 clear', function () {
        const obj = oSet([1, 2]);
        obj.on('delete', value => testResult.push(value));

        obj.clear();

        expect(obj.value.size).to.be(0);
        expect(testResult).to.eql([
            1, 2
        ]);
    });

    it('测试 delete', function () {
        const obj = oSet([1]);
        obj.on('delete', value => testResult.push(value));

        expect(obj.delete(1)).to.be.ok();
        expect(obj.delete(1)).to.not.be.ok();
        expect(obj.delete(2)).to.not.be.ok();

        expect(obj.value.size).to.be(0);
        expect(testResult).to.eql([
            1
        ]);
    });

    it('测试 add', function () {
        const obj = oSet([1]);
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
    let testResult = 0;

    const ov = oVar<any>(undefined);
    const oa = oArr<any>([0]);
    const os = oSet<any>([]);
    const om = oMap<string, any>([]);

    const cancel = watch([ov, oa, os, om], () => testResult++);

    function test(): void {
        ov.value = 1;         // set

        oa.push(1);           // add
        oa.pop();             // delete
        oa.set(0, 1);         // update
        oa.value = [];        // set

        os.add(1);            // add
        os.delete(1);         // delete
        os.value = new Set(); // set

        om.set('a', 1);       // add
        om.delete('a');       // delete
        om.set('1', 2);       // update
        om.value = new Map(); // set
    }

    test();
    cancel();
    test();

    expect(testResult).to.be(12);
});
