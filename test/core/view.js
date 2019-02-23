'use strict';

var assert = require('assert');
var path = require('path');
var thinkjs = require('../../lib/index.js');

var tjs = new thinkjs();
tjs.load();

var View = think.safeRequire(path.resolve(__dirname, '../../lib/core/view.js')),
    old_prevent = think.prevent,
    old_status = this.statusAction,
    instance = new View();

describe('core/view', function() {
    before(function () {
        instance.fetch = instance.render = think.prevent = function () { return Promise.resolve('my-content') };
    });
    it('assign', function () {
        assert.deepEqual(instance.assign(), {});
    });
    it('checkTemplateExist, unknown file', function () {
        assert.equal(instance.checkTemplateExist('unknown-file'), false);
    });
    it('display', function (done) {
        // templateFile, charset, contentType, config
        instance.display('test-file', {}, 'text/html', {}).then(function (data) {
            assert.equal(data, 'my-content');
            instance.display('test-file', null, {}, {}).then(function (data) {
                assert.equal(data, 'my-content');
                done();
            });
        });
    });
    it('display, throw Exception', function (done) {
        instance.fetch = function () { throw new Error(arguments) };
        think.prevent = think.statusAction = function () { return 'throws error' };
        // templateFile, charset, contentType, config
        instance.display('test-file', {}, 'text/html', {}).then(function (data) {
            assert.equal(data, 'throws error');
            done();
        });
    });
    after(function () {
        // Restore prevent:
        think.prevent = old_prevent;
        // Restore statusAction:
        think.statusAction = old_status;
    });
});