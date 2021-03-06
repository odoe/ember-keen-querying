import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import env from 'dummy/config/environment';
import QUnit from 'qunit';
import keenClientStub from '../../helpers/stubs';
import { KeenQueryMock } from '../../helpers/stubs';

moduleFor('service:keen-querying', 'KeenQueryingService', {
  setup: function() {
    env.KEEN_PROJECT_ID = "project321";
    env.KEEN_READ_KEY = "read321";
    this.container.register('config:environment', env);
  }
});

test('project id uses ENV variable', function() {
  expect(1);
  var service = this.subject();
  equal(service.get('projectId'), "project321");
});

test('project id defaults to global if no env variable or meta tag exists', function(){
  expect(1);
  env.KEEN_PROJECT_ID = null;
  window.KEEN_PROJECT_ID = "123project";
  var service = this.subject();
  equal(service.get('projectId'), "123project");
});

test('read key uses ENV variable', function() {
  expect(1);
  var service = this.subject();
  equal(service.get('readKey'), "read321");
});

test('read key defaults to global if no env variable or meta tag exists', function(){
  expect(1);
  env.KEEN_READ_KEY = null;
  window.KEEN_READ_KEY = "123read";
  var service = this.subject();
  equal(service.get('readKey'), "123read");
});

/**
 * @todo change ENV variables and meta tag at runtime, and test them
 */

test('query returns a promise that resolves if success', function() {
  var service = this.subject({
    client: keenClientStub.create({successMsg: "Yay"})
  });
  var promise = service.query('analysisType', 'event');
  promise.then(function(response) {
    equal(response, "Yay");
  });
});

test('query returns a promise to catch if there\'s an error', function() {
  var service = this.subject({
    client: keenClientStub.create({failing: true, failureMsg: "Womp"})
  });
  var promise = service.query('analysisType', 'event');
  promise.catch(function(reason) {
    equal(reason, "Womp");
  });
});

test('multiQuery returns a promise that resolves if success', function() {
  var service = this.subject({
    client: keenClientStub.create({successMsg: "Hoorah"})
  });
  var promise = service.query('analysisType', 'event');
  promise.then(function(response) {
    equal(response, "Hoorah");
  });
});

test('multiQuery returns a promise to catch if there\'s an error', function() {
  var service = this.subject({
    client: keenClientStub.create({failing: true, failureMsg: "Boo"})
  });
  var promise = service.query('analysisType', 'event');
  promise.catch(function(reason) {
    equal(reason, "Boo");
  });
});

test('_prepareAnalysis returns a new Keen.Query', function() {
  window.Keen.Query = KeenQueryMock;
  var service = this.subject();
  var keenQuery = service._prepareAnalysis("count", {});
  equal(keenQuery.constructor.name, "KeenQueryMock");
});

test('_prepareAnalysis accepts either an object or a string for its second argument', function() {
  window.Keen.Query = KeenQueryMock;
  var service = this.subject();
  var keenQuery1 = service._prepareAnalysis("sum", {eventCollection: "wiggles"});
  var keenQuery2 = service._prepareAnalysis("sum", "wiggles");
  equal(keenQuery1.params.eventCollection, "wiggles", "params accepts object as is");
  equal(keenQuery2.params.eventCollection, "wiggles", "params adds string as eventCollection property");
});
