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
let a = i3.pop()
        ObservableArray.observe(o3, 'test3');
        ObservableArray.observe(o3, ['test4']);

        expect(o3.test3).to.be.a(ObservableVariable);
        expect(o3.test4).to.be.a(ObservableVariable);
    });
});