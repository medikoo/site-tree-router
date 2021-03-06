// SiteTreeRouter class

'use strict';

var constant         = require('es5-ext/function/constant')
  , assign           = require('es5-ext/object/assign')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , ensureObject     = require('es5-ext/object/valid-object')
  , forEach          = require('es5-ext/object/for-each')
  , mixin            = require('es5-ext/object/mixin-prototypes')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , isPromise        = require('is-promise')
  , d                = require('d')
  , autoBind         = require('d/auto-bind')
  , ControllerRouter = require('controller-router')
  , ensureSiteTree   = require('site-tree/ensure')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties, stringify = JSON.stringify
  , routeEvent = ControllerRouter.prototype.routeEvent;

var resolveLoadResult = function (siteTree) {
	var promises = siteTree.releasePromises(), promise = promises.shift(), nextPromise;
	while ((nextPromise = promises.shift())) promise = promise.then(constant(nextPromise));
	return promise;
};

var SiteTreeRouter = module.exports = defineProperties(function (routes, siteTree/*, options*/) {
	var options;
	if (!(this instanceof SiteTreeRouter)) return new SiteTreeRouter(routes, siteTree, arguments[2]);
	ensureObject(routes);
	ensureSiteTree(siteTree);
	options = normalizeOptions(arguments[2]);
	options.siteTree = siteTree;
	ControllerRouter.call(this, routes, options);
	defineProperty(this, 'siteTree', d(siteTree));
	if (options.notFound != null) {
		defineProperty(this, 'notFoundView', d(siteTree.constructor.ensureView(options.notFound)));
	}
}, {
	// Validate routes map, views are validated only if siteTree instance was passed with options
	ensureRoutes: d(function (routes/*, options*/) {
		var options = Object(arguments[1]), ensureView, dummyRoutes = create(null);
		if (options.siteTree != null) {
			ensureView = ensureSiteTree(options.siteTree).constructor.ensureView
				.bind(options.siteTree.constructor);
		}
		forEach(ensureObject(routes), function (conf, path) {
			ensureObject(conf);
			if (conf.view || conf.resolveView) {
				if (conf.view) {
					if (ensureView) ensureView(conf.view);
				} else {
					ensureCallable(conf.resolveView);
				}
				if (conf.decorateContext != null) ensureCallable(conf.decorateContext);
				if (conf.match != null) {
					dummyRoutes[path] = {
						match: conf.match,
						controller: Function.prototype
					};
				} else {
					dummyRoutes[path] = Function.prototype;
				}
			} else {
				ensureView(conf);
				dummyRoutes[path] = Function.prototype;
			}
		});
		return ControllerRouter.ensureRoutes(dummyRoutes);
	}),
	// Normalize routes map for controller router.
	// siteTree instance needs to be provided with options
	normalizeRoutes: d(function (routes, options) {
		var normalizedRoutes = create(null), siteTree = ensureSiteTree(ensureObject(options).siteTree);
		forEach(routes, function (conf, path) {
			var staticView, resolveView, decorateContext, loadView;
			if (conf.view || conf.resolveView) {
				staticView = conf.view;
				resolveView = conf.resolveView;
				loadView = function () {
					var view;
					if (staticView) {
						siteTree.load(staticView, this);
						return resolveLoadResult(siteTree);
					}
					view = resolveView.call(this);
					if (isPromise(view)) {
						return view.then(function (view) {
							siteTree.load(view, this);
							return resolveLoadResult(siteTree);
						}.bind(this));
					}
					siteTree.load(view, this);
					return resolveLoadResult(siteTree);
				};
				if (conf.decorateContext) {
					decorateContext = conf.decorateContext;
					normalizedRoutes[path] = { controller: function () {
						decorateContext.call(this);
						return loadView.call(this);
					} };
				} else {
					normalizedRoutes[path] = { controller: function () { return loadView.call(this); } };
				}
				if (conf.match) normalizedRoutes[path].match = conf.match;
			} else {
				staticView = conf;
				normalizedRoutes[path] = function () {
					siteTree.load(staticView, this);
					return resolveLoadResult(siteTree);
				};
			}
		});
		return normalizedRoutes;
	})
});

if (setPrototypeOf) setPrototypeOf(SiteTreeRouter, ControllerRouter);
else mixin(SiteTreeRouter, ControllerRouter);

SiteTreeRouter.prototype = Object.create(ControllerRouter.prototype, assign({
	constructor: d(SiteTreeRouter)
}, autoBind({
	routeEvent: d(function (event, path/*, …controllerArgs*/) {
		var result = routeEvent.apply(this, arguments);
		var handleResult = function (result) {
			var loadResult;
			if (result) return result;
			if (!this.notFoundView) throw new Error(stringify(path) + ' route not found');
			this.siteTree.load(this.notFoundView, event);
			loadResult = resolveLoadResult(this.siteTree);
			return loadResult ? loadResult.then(constant(result)) : result;
		}.bind(this);
		if (!isPromise(result)) return handleResult(result);
		return result.then(handleResult);
	})
})));
