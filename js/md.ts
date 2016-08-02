/// <reference path="../typings/index.d.ts" />

import * as marked from 'marked';
import * as MarkdownIt from 'markdown-it';
import * as hljs from 'highlight.js';

const renderer = new marked.Renderer();

// copied from marked.js
function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}


// like https://github.com/chjj/marked/blob/master/lib/marked.js#L869
// but adds target="_blank"
renderer.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += 'target="_blank" rel="nofollow"';
  out += '>' + text + '</a>';
  return out;
};

const markedOpts = {
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
};

function toHtmlMarked(s) {
  s = s.trim();
  const html = marked(s, markedOpts);
  return html;
}

const markdownItOpts : MarkdownIt.Options = {
  html: false,
  linkify: true,
  breaks: false, // Convert '\n' in paragraphs into <br>
  typographer: false
};

markdownItOpts.highlight = function(str, lang) {
  // TODO: doesn't seem to work
  hljs.configure({
    tabReplace: '  '
  });

  const hasLang = lang && hljs.getLanguage(lang);
  if (hasLang) {
    try {
      return hljs.highlight(lang, str).value;
    } catch (__) {}
  }
  return ''; // use external default escaping
};

const preset: string = null;
const markdownIt = new MarkdownIt(preset, markdownItOpts);

// https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md
// Remember old renderer, if overriden, or proxy to default renderer
function myRenderer(tokens: MarkdownIt.Token[], idx: number, options: any, env: any, md: MarkdownIt.MarkdownIt): string {
  return md.renderer.renderToken(tokens, idx, options);
};

var defaultRender = markdownIt.renderer.rules["link_open"] || myRenderer;

markdownIt.renderer.rules["link_open"] = function(tokens, idx, options, env, self) {
  // If you are sure other plugins can't add `target` - drop check below
  var aIndex = tokens[idx].attrIndex('target');

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank']); // add new attribute
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank'; // replace value of existing attr
  }

  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self);
};

function toHtmlMarkdownIt(s) {
  s = s.trim();
  const html = markdownIt.render(s);
  return html;
}

export function toHtml(s) {
  return toHtmlMarkdownIt(s);
// return toHtmlMarked(s);
}
