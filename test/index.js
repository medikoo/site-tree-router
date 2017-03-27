'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Domjs    = require('domjs')
  , SiteTree = require('site-tree');

module.exports = function (T, a) {
	var tree = new SiteTree(document), domjs = new Domjs(document), ns = domjs.ns
	  , header, content, foo, bar, par, other, newcontent, partialContent = {}, router;

	var rootPage = { _name: 'root', body: function () {
		var df = document.createDocumentFragment();
		header = df.appendChild(ns.div({ id: 'header' }, 'Header'));
		content = df.appendChild(ns.div({ id: 'content' },
			foo = ns.div({ id: 'foo' },
				ns.p('foo'),
				ns.p('bar')),
			ns.div(bar = ns.div({ id: 'bar' },
				ns.p('Other foo'),
				ns.p('Other bar')))));
		partialContent = df.appendChild(ns.div({ id: 'partial-content' }, ' melon '));
		return df;
	} };

	var page1 = { _name: 'page1', _parent: rootPage, foo: function () {
		var df = document.createDocumentFragment();
		df.appendChild(ns.span('foo 1 '));
		df.appendChild(ns.span('foo 2'));
		return df;
	}, bar: { content: function () {
		var df = document.createDocumentFragment();
		df.appendChild(ns.span('bar 1 '));
		df.appendChild(ns.span('bar 2'));
		return df;
	} }, 'partial-content': {
		class: { active: true },
		prepend: function () {
			var df = document.createDocumentFragment();
			df.appendChild(ns.span('prepended 1 '));
			df.appendChild(ns.span('prepended 2'));
			return df;
		},
		append: function () {
			var df = document.createDocumentFragment();
			df.appendChild(ns.span('appended 1 '));
			df.appendChild(ns.span('appended 2'));
			return df;
		}
	} };

	var page2 = { _name: 'page2', _match: 'id', _parent: rootPage, content: function () {
		var df = document.createDocumentFragment();
		par = df.appendChild(ns.p('Whatever'));
		other = df.appendChild(ns.div({ id: 'other-content' },
			ns.div('page2 other 1 '),
			ns.div('page2 other 2 ' + this.eloma)));
		return df;
	} };

	var page3 = { _name: 'page3', _parent: page2, 'other-content': function () {
		var df = document.createDocumentFragment();
		df.appendChild(ns.div('other 1 '));
		df.appendChild(ns.p('other 2'));
		return df;
	} };

	var page4 = { _name: 'page4', _parent: page2, 'other-content': function () {
		var df = document.createDocumentFragment();
		df.appendChild(ns.div('other 1b '));
		df.appendChild(ns.p('other 2b'));
		return df;
	} };

	var newpage = { _name: 'newpage', _parent: rootPage, body: function () {
		var df = document.createDocumentFragment();
		newcontent = df.appendChild(ns.div());
		return df;
	} };

	router = new T({
		'/': rootPage,
		foo: page1,
		'bar/foka': {
			decorateContext: function () { this.eloma = 'foogar'; },
			view: page2
		},
		'miszka/[0-9][a-z]{3}': {
			match: function (token) {
				if (token !== '1elo') return false;
				this.id = token;
				return true;
			},
			view: page3
		},
		'dynamic-view': {
			resolveView: function () { return page4; }
		}
	}, tree, { notFound: newpage });
	router.route('/foo/');
	a(foo.textContent, 'foo 1 foo 2', "Replace content #1");
	a(bar.textContent, 'bar 1 bar 2', "Replace content #2");
	a(partialContent.className, 'active', "Classname");
	a(partialContent.textContent, 'prepended 1 prepended 2 melon appended 1 appended 2',
		"Append/Prepend");

	router.route('/miszka/1elo/');
	a.deep(toArray(content.childNodes), [par, other],
		"Replace content (2 steps) #1");
	a(other.textContent, 'other 1 other 2', "Replace content (2 steps) #2");

	router.route('/bar/foka/');
	a(other.textContent, 'page2 other 1 page2 other 2 foogar', "Go back");

	router.route('/marasdfa/');
	a.deep(toArray(document.body.childNodes), [newcontent], "Replace whole content");

	router.route('/');
	a.deep(toArray(document.body.childNodes), [header, content, partialContent], "Reload home #1");
	a.deep(toArray(content.childNodes), [foo, bar.parentNode], "Reload home #2");
	a(partialContent.className, '');
	a(partialContent.textContent, ' melon ', "Append/Prepend");

	router.route('/foo/');
	a(foo.textContent, 'foo 1 foo 2', "Replace content #1");
	a(bar.textContent, 'bar 1 bar 2', "Replace content #2");
	a(partialContent.className, 'active', "Classname");
	a(partialContent.textContent, 'prepended 1 prepended 2 melon appended 1 appended 2',
		"Append/Prepend");

	router.route('/dynamic-view/');
	a.deep(toArray(content.childNodes), [par, other],
		"Replace content (2 steps) #1");
	a(other.textContent, 'other 1b other 2b', "Replace content (2 steps) #2");
};
