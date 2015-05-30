'use strict';

var forEach      = require('es5-ext/object/for-each')
  , ensureObject = require('es5-ext/object/valid-object')
  , getRouter    = require('controller-router')
  , ensureView   = require('site-tree/ensure-view')

  , create = Object.create, stringify = JSON.stringify;

module.exports = function (viewMap, tree/*, options*/) {
	var options = Object(arguments[2]), baseContext, notFoundView
	  , routes = create(null), router;

	if (options.context != null) baseContext = ensureObject(options.context);
	if (options.notFound != null) notFoundView = ensureView(options.notFound);
	forEach(viewMap, function (viewConf, path) {
		var view;
		if (viewConf.match && viewConf.view) {
			// Dynamic path
			view = viewConf.view;
			routes[path] = {
				match: viewConf.match,
				controller: function () { tree.load(view, this); }
			};
		} else {
			// Static path
			routes[path] = function () { tree.load(viewConf, this); };
		}
	});
	router = getRouter(routes);
	return function (pathname) {
		var result, context = baseContext ? create(baseContext) : {};
		result = router.call(context, pathname);
		if (result) return result;
		if (!notFoundView) throw new Error(stringify(pathname) + ' route not found');
		tree.load(notFoundView, context);
		return result;
	};
};
