# site-tree-router
## URL router for [SiteTree](https://github.com/medikoo/site-tree) view engine

```javascript
var SiteTreeRouter = require('site-tree-router');
var SiteTree = require('site-tree');

// Initialize site tree
var siteTree = new SiteTree(document);

// Configure router
var router = new SiteTreeRouter({
	// Map view nodes to urls
  '/': require('./homepage'),
  'subpage': require('./subpage')
}, siteTree);

// Route between pages with url router:
// Present homepage
router.route('/');

// Present subpage
router.route('/subpage/');

// Present homepage again
router.route('/');
```

### Installation

	$ npm install site-tree-router

### API
#### SiteTreeRouter constructor properties
##### SiteTreeRouter.ensureRoutes(routes[, options])

Validates provided routes configuration, for views to be validated `siteTree` needs to be passed with options (as `options.siteTree`). It's also used internally on router initialization.

##### SiteTreeRouter.normalizeRoutes(routes, options)

Normalizes routes map up into basic [ControllerRouter](https://github.com/medikoo/controller-router#routes-map-configuration) format. So out of provided _view_, a _controller_ function is generated.  
_siteTree_ instance needs to be passed with options (as `options.siteTree`).  
Input object is left intact, new one is returned. It is assumed that input routes are valid (as assured by `ensureRoutes` function). This function is used internally at router initialization.

#### SiteTreeRouter initialization
##### new SiteTreeRouter(routes, siteTree[, options])

```javascript
var router = new SiteTreeRouter({
  '/': homepageView,
  'subpage': subpageView
}, siteTree);

// Present homepage
router.route('/');
```

Initializes router, for provided [routes map](#routes-map-configuration), and siteTree instance.

Supported options:

- __notFound__ - view which should be used when route for provided url was not found. If not provided, router will crash when its invoked with unmatched path

Additionally all options as described in [controller-router](https://github.com/medikoo/controller-router#getrouterroutes-options) documentation, are supported.

##### Routes map configuration

Routes map is a configuration of key value, pairs, where key is a path, and value is a view configuration.

###### Routes map: path keys

Please refer to [controller-router](https://github.com/medikoo/controller-router#-routes-map-path-keys) documentation.

###### Routes map: view values

For static path keys, views maybe provided directlye.g.:

```javascript
'foo/bar': viewConfiguration
```

They can also be configured via objects which provide a `view` property:

```javascript
'foo/bar': {
  view: viewConfiguration
};
```
Two of above configurations are equal in meaning.

For dynamic paths, same way, view needs to be provied via `view` property.

For more details refer to [controller-router](https://github.com/medikoo/controller-router#-routes-map-controller-values) documentation.

### Tests [![Build Status](https://travis-ci.org/medikoo/site-tree-router.svg)](https://travis-ci.org/medikoo/site-tree-router)

	$ npm test
