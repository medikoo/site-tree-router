'use strict';

var forEach        = require('es5-ext/object/for-each')
  , ensureObject   = require('es5-ext/object/valid-object')
  , getRouter      = require('controller-router')
  , ensureSiteTree = require('site-tree/ensure')

  , create = Object.create, stringify = JSON.stringify;

module.exports = function (routesMap, siteTree/*, options*/) {
	var options = Object(arguments[2]), baseContext, notFoundView
	  , routes = create(null), router, ensureView;
	ensureObject(routesMap);
	ensureSiteTree(siteTree);
	ensureView = siteTree.constructor.ensureView.bind(siteTree.constructor);

	if (options.context != null) baseContext = ensureObject(options.context);
	if (options.notFound != null) notFoundView = ensureView(options.notFound);
	forEach(routesMap, function (viewConf, path) {
		var view;
		if (viewConf.match && viewConf.view) {
			// Dynamic path
			view = ensureView(viewConf.view);
			routes[path] = {
				match: viewConf.match,
				controller: function () { siteTree.load(view, this); }
			};
		} else {
			// Static path
			ensureView(viewConf);
			routes[path] = function () { siteTree.load(viewConf, this); };
		}
	});
	router = getRouter(routes);
	return function (pathname) {
		var result, context = baseContext ? create(baseContext) : {};
		result = router.call(context, pathname);
		if (result) return result;
		if (!notFoundView) throw new Error(stringify(pathname) + ' route not found');
		siteTree.load(notFoundView, context);
		return result;
	};
};
