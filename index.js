// SiteTreeRouter class

'use strict';

var ensureObject     = require('es5-ext/object/valid-object')
  , forEach          = require('es5-ext/object/for-each')
  , mixin            = require('es5-ext/object/mixin-prototypes')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , d                = require('d')
  , ControllerRouter = require('controller-router')
  , ensureSiteTree   = require('site-tree/ensure')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties, stringify = JSON.stringify
  , routeEvent = ControllerRouter.prototype.routeEvent;

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
			if (conf.match && conf.view) {
				if (ensureView) ensureView(conf.view);
				dummyRoutes[path] = {
					match: conf.match,
					controller: Function.prototype
				};
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
			var view;
			if (conf.match && conf.view) {
				view = conf.view;
				normalizedRoutes[path] = {
					match: conf.match,
					controller: function () { siteTree.load(view, this); }
				};
			} else {
				view = conf;
				normalizedRoutes[path] = function () { siteTree.load(view, this); };
			}
		});
		return normalizedRoutes;
	})
});

if (setPrototypeOf) setPrototypeOf(SiteTreeRouter, ControllerRouter);
else mixin(SiteTreeRouter, ControllerRouter);

SiteTreeRouter.prototype = Object.create(ControllerRouter.prototype, {
	constructor: d(SiteTreeRouter),
	routeEvent: d(function (event, path/*, …controllerArgs*/) {
		var result = routeEvent.apply(this, arguments);
		if (result) return result;
		if (!this.notFoundView) throw new Error(stringify(path) + ' route not found');
		this.siteTree.load(this.notFoundView, event);
		return result;
	})
});
