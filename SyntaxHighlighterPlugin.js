/***
|''Name''|SyntaxHighlighterPlugin3|
|''Description''|Enables syntax highlighting|
|''Author''|PMario|
|''Version''|0.2.0|
|''Status''|''beta''|
|''Source''|http://syntaxhighlighter.tiddlyspace.com/#SyntaxHighlighterPlugin3|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5.0|
|''Requires''|ShCore.js|
|''Keywords''|syntax highlighting color code|
!Documentation
*see: [[SyntaxHighlighterPlugin3Info]]
!Description
Enables syntax highlighting for <pre> and <code> blocks. Adds a new formatter for {{{<code class='brush:???'>}}} 
!Usage
!!!!StyleSheet
<<<
*add this to your StyleSheet
{{{
[[ShCore.css]]
[[ShThemeDefault.css]]
}}}
<<<
!!!!Macro
<<<
*The macro is only needed if you have inline html blocks. see: [[SyntaxHighlighterPlugin3Info]]
<<<
!!!!ViewTemplate
<<<
*Same as macro, but will be executed automatically for every tiddler. see: [[SyntaxHighlighterPlugin3Info]]
<<<
!!!!Parameters
<<<
{{{<<highlightSyntax [tagName]>> }}}
*will render all blocks, with any defined tag name. eg: tagName = code.
*[tagName] is optional. Default is "pre".
<<<
!!!!Configuration options
<<<
Guess syntax: <<option chkGuessSyntax>> .. If activated, ~TiddlyWiky <pre> blocks will be rendered according to there block braces. see [[SyntaxHighlighterPlugin3Info]]
Expert mode: <<option chkExpertSyntax>> .. If activated, additional values below will be used. see [[SyntaxHighlighterPlugin3Info]]

{{{ {{{ }}} txtShText: <<option txtShText>> eg: 'brush:text tab-size:4 + options'
{{{ /*{{{* / }}} txtShCss: <<option txtShCss>> eg: 'brush:css  + options'
{{{ //{{{ }}} txtShPlugin: <<option txtShPlugin>> 'brush:js  + options'
{{{ <!--{{{-->> }}} txtShXml: <<option txtShXml>> 'brush:xml  + options'

Additional options can be found at: [[SyntaxHighlighter homepage|http://alexgorbatchev.com/SyntaxHighlighter/manual/configuration/]]
<<<
!!!!Revision History
<<<
*V 0.2.0 2010-08-22
**New formatter for {{{<code class='brush:???'>}}} is available now
**expert mode uses config options now
<<<
!!!!ToDo
<<<
*
<<<
!!!Code
***/

//{{{
version.extensions.SyntaxHighlighterPlugin3 = {major: 0, minor: 2, revision: 0, date: new Date(2010,8,22)};

(function($) {

if(!window.SyntaxHighlighter) {
	throw "Missing dependency: SyntaxHighlighter";
}

config.macros.highlightSyntax = {
	getElementsByClass: function (searchClass,node,tag) {
		var classElements = [];
        if ( node == null ) node = document;
        if ( tag == null )  tag = '*';
		
		var els = node.getElementsByTagName(tag);
		var elsLen = els.length;
		var pattern = new RegExp("(^|\\s)"+searchClass+"(:|\\s|$)");
		for (i = 0, j = 0; i < elsLen; i++) {
			if ( pattern.test(els[i].className) ) {
				classElements[j] = els[i];
				j++;
			}
		}
		return classElements;
	},
	
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		// the configured tagName can be temporarily overwritten by the macro.
		var tagName = params[0] || SyntaxHighlighter.config.tagName;
		var arr = this.getElementsByClass('brush', story.findContainingTiddler(place), tagName);
		for (i=0; i<arr.length; i++) {
			SyntaxHighlighter.highlight(null, arr[i]);
		}			
	} // handler
};

})(jQuery);
//}}}
/***
!!!!!New formatter for {{{<code class='brush:??'>}}}
***/
//{{{
config.formatters.push({
	name: "highlightSyntax",
	match: "^<code[\\s]+[^>]+>\\n",
	element: "pre",
	handler: function(w)
	{
        this.lookaheadRegExp = /<code[\s]+class.*=.*["'](.*)["'].*>\n((?:^[^\n]*\n)+?)(^<\/code>$\n?)/img;
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
            var options = lookaheadMatch[1];
			var text = lookaheadMatch[2];
			if(config.browser.isIE)
				text = text.replace(/\n/g,"\r");
			var element = createTiddlyElement(w.output,this.element,null,options,text);
            SyntaxHighlighter.highlight(null, element);
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	}
});
//}}}
/***
!!!!!Add class attribute to pre, if defined
***/
//{{{
(function(formatters) { //# set up alias
	var helper = {};	
	helper.enclosedTextHelper = function(w){
		var attr;
		var co = config.options;
		var expert = (co.chkExpertSyntax != undefined)? co.chkExpertSyntax : false;
		var guess  = (co.chkGuessSyntax != undefined)? co.chkGuessSyntax : true;
		
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			if(config.browser.isIE)
				text = text.replace(/\n/g,"\r");

			switch(w.matchText) {
			case "{{{\n": // text
				attr = (expert) ? (co.txtShText) ? (co.txtShText) : 'brush:text' : 'brush:text' ;
				break;
			case "/*{{{*/\n": // CSS
				attr = (expert) ? (co.txtShCss) ? (co.txtShCss) : 'brush:css' : 'brush:css';
				break;
			case "//{{{\n": // plugin
				attr = (expert) ? (co.txtShPlugin) ? (co.txtShPlugin) : 'brush:js' : 'brush:js';
				break;
			case "<!--{{{-->\n": //template
				attr =  (expert) ? (co.txtShXml) ? (co.txtShXml) : 'brush:xml' : 'brush:xml';
				break;
			}
			var element = createTiddlyElement(w.output,this.element,null,attr,text);		
	        if (guess || expert) SyntaxHighlighter.highlight(null, element);

			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	};
	// merge the new helper function into formatterHelpers. 
	merge(config.formatterHelpers, helper);

})(config.formatters); //# end of alias
//}}}
