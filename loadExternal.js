old_load_plugins = window.loadPlugins;
window.loadPlugins=function()
{
        old_load_plugins.apply(this,arguments);
        loadExternalScripts.apply(this,arguments);
};
function loadExternalScripts(){
		if (!store.isTiddler("ExternalScripts")) {
			alert('Tiddler ExternalScripts not found!');
			return;
		}
        var originalPath = document.location.toString();
        var localPath = getLocalPath(originalPath);
        var backSlash = true;
        var dirPathPos = localPath.lastIndexOf("\\");
        if(dirPathPos == -1) {
                dirPathPos = localPath.lastIndexOf("/");
                backSlash = false;
        }
        var scriptPath = localPath.substr(0,dirPathPos) + (backSlash ? "\\" : "/");
        var scripts = store.getTiddlerText("ExternalScripts").readBracketedList();
        for (var i=0; i<scripts.length;i++)
                {
                eval(loadFile(scriptPath+scripts[i]));
				alert(scriptPath+scripts[i]);
                }
};
TiddlyWiki.prototype.isTiddler= function (title)
{
        return store.tiddlerExists(title) || store.isShadowTiddler(title);
};
