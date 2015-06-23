# site-tree-router
## URL router for [SiteTree](https://github.com/medikoo/site-tree) view engine

```javascript
var getSiteTreeRouter = require('site-tree-router');
var SiteTree = require('site-tree');

// Initialize site tree
var siteTree = new SiteTree(document);

// Configure router
var router = getSiteTreeRouter({
	// Map view nodes to urls
  '/': require('./homepage'),
	'subpage': require('./subpage')
}, siteTree);

// Route between pages with url router:
// Present homepage
router('/');

// Present subpage
router('/subpage/');

// Present homepage again
router('/');
```

### Installation

	$ npm install site-tree-router

### API
#### getSiteTreeRouter(routes, siteTree[, options]);

```javascript
var router = getSiteTreeRouter({
  '/': homepageView,
	'subpage': subpageView
}, siteTree);

// Present homepage
router('/');
```

Configures router, for provided _url: view_ map (`routes`), and siteTree instances.

Supported options:

- __notFound__ - view configuration, that should be used when route for provided url was not found. If not provided, router will crash when its invoked with unmatched path

Additionally all options as described in [controller-router](https://github.com/medikoo/controller-router#getrouterroutes-options) documentation, are supported.

For all details about routes configuration, and multiple ways of how `router` function can be invoked see [controller-router](https://github.com/medikoo/controller-router#getrouterroutes-options) documentation.

### Tests [![Build Status](https://travis-ci.org/medikoo/site-tree-router.svg)](https://travis-ci.org/medikoo/site-tree-router)

	$ npm test
