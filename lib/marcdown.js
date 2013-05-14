// Some Global String stuff
String.prototype.format     = function(){var args = arguments;return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {if (m == "{{") { return "{"; }if (m == "}}") { return "}"; }return args[n];});};

(function() {

	'use strict';
	
	// References
	var http = require("http");
	var fs   = require('fs');
	var path = require("path");
	var pkginfo = require('pkginfo')(module);

	// Config
	var host = (process.env.IP === undefined) ? 'localhost' : process.env.IP;
	var port = (process.env.PORT === undefined) ? 8080 : process.env.PORT;
	
	var pwd  = (process.env.PWD === undefined ) 
		? process.mainModule.paths[1].substr(0,process.mainModule.paths[1].indexOf('/node_modules')+1)
		: process.env.PWD;
	
	// Logging
	var msgfmt = '> {0} {1} - {2} - {3}';
	
	// Mime Types
	var mimeTypes = {
		'.md ' : 'text/html',
		'.js'  : 'text/javascript',
    	'.css' : 'text/css',
    	'.gif' : 'image/gif',
    	'.ico' : 'image/x-icon'
	};
	
	// Server
	var httpServer = http.createServer(function (req, res) 
	{
    	var url = "", contentType = "text/plain", filePath = "";
    	
    	var serveRequestedFile = function (file) 
    	{
			var ext = path.extname(filePath).toLowerCase();
			
    		if (file === false) {
    			var fn = path.basename(filePath, ext);
	    		
    			if (fn == 'packages') {
    				res.writeHead(200, {'Content-Type':'text/html'});
					res.write('<link href="public/css/marcdown.css" rel="stylesheet"></link>\n');
					res.write('<h2>Markdown by Package Dependencies</h2>');
					var deps=Object.keys(module.exports.dependencies);
					if(deps.length > 0) {
						res.write('<ol>');
						for(var i=0;i<deps.length;i++) {
							res.write('<li><a href="node_modules/'+deps[i]+'/README.md">'+deps[i]+'</a></li>');
						}
						res.write('</ol>');
					}
					res.write('<br/><br/><a href="/README.md">&laquo; back to Marcdown</a>');
					
				} else if(fn == 'subdirs') {
					res.writeHead(200, {'Content-Type':'text/html'});
					res.write('<link href="public/css/marcdown.css" rel="stylesheet"></link>\n');
					res.write('<h2>Markdown by Directory</h2><ol>');
					
					var traverseFileSystem = function (currentPath) {
    					var files = fs.readdirSync(currentPath);
				    	for (var i in files) {
				       		var currentFile = path.normalize(currentPath + '/' + files[i]);
				       		var stats = fs.statSync(currentFile);
				       		if (stats.isFile()) {
					       		var ext = path.extname(currentFile).toLowerCase();
				    	   		if(ext != '.md') continue;
				    	   		ext=currentFile.substring(pwd.length);
				       			res.write('<li><a href="'+ext+'">'+ext+'</a></li>');
				       		}
				      		else if (stats.isDirectory()) {
				            	traverseFileSystem(currentFile);
				           	}
     					}
   					};
					traverseFileSystem(path.normalize(pwd));
					res.write('</ol><br/><br/><a href="/README.md">&laquo; back to Marcdown</a>');
					
    			} else {
     				res.writeHead(404);
    			}
    			res.end();
    			return;
    		}
    		
    		if(fs.statSync(filePath).isDirectory()) {
   				res.writeHead(403);
	    		res.end('Forbidden', 'utf8');
	    		console.error(msgfmt.format('Error '+req.method,req.url,403,'Forbidden'));
	    		return;    		
    		}
    		
	    	contentType = mimeTypes[ext];
    		
    		if(ext === '.md') {
    		    fs.readFile(filePath, function (err, data) {
	                res.writeHead(200, {'Content-Type':'text/html'});
	                res.write(require("marked")(data.toString(),{breaks: false}));
	                res.end();
            	});
    		
    		} else {
		    	var stream = fs.createReadStream(filePath);
		    	
		    	stream.on('error', function(error) {res.writeHead(500);res.end();return;});
		    	
		    	res.writeHead(200, {'Content-Type':contentType});
		    	
		    	stream.pipe(res, function(err) {
		        	//Only called when the res is closed or an error occurs
		        	console.error(msgfmt.format('Error '+req.method,req.url,err.status,err.message));
		        	res.end();
		        	return;
		    	});
		    
		    	stream.on('end', function() {
	    			console.log(msgfmt.format(req.method,req.url,200,"OK"));
	    		});
    		}
		};
    	
    	//If the request method doesn't equal 'GET'
		if (req.method !== 'GET') { 
	    	res.writeHead(405);
	    	res.end('Unsupported request method', 'utf8');
	    	console.error(msgfmt.format('Error '+req.method,req.url,405,'Unsupported request method'));
	    	return;
		}

		if(req.url === '/') {
	    	filePath = pwd+'/README.md';
	    	fs.exists(filePath, serveRequestedFile);
	    
    	} else if(req.url === '/favicon.ico') {		
	    	filePath = pwd+'/public/favicon.ico';
	    	fs.exists(filePath, serveRequestedFile);
	    	
		} else {
	    	filePath = pwd + req.url;
	    	fs.exists(filePath, serveRequestedFile);
	    	return;
		}	

	}).listen(port,host);
	
	console.log("> Listening as http://"+host+":"+port);

	// Error handling....
		
	httpServer.on('error', function (e) {console.error(e);});
	
    process.on('uncaughtException', function(e) {console.error(e.stack);});


}).call(function(){return this;}());
