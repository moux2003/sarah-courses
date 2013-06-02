exports.action = function(data, callback, config, SARAH){
	var end = {'tts':'', 'objects':[]};
	
	switch(data.method){
		case "init":
			var request = require('request');
			var param = 0,
			fake = '',
			url = '',
			i = 1;
			param = i * 1000000;
			url = 'http://www.pourmescourses.fr/liste_produit.php?param='+ param +'&nomfam1=&nomfam2=';
			var parse = function (err, response, body){
				if (err || response.statusCode != 200) {
				  return;
				}
				end.objects.push(list(body));
				if(i == 27){
					end.tts = 'done !';
					save(data.directory,end.objects);
					callback(end);
				}
				else {
					i++;
					param = i * 1000000;
					url = 'http://www.pourmescourses.fr/liste_produit.php?param='+ param +'&nomfam1=&nomfam2=';
					request({ 'uri' : url, 'headers':{'Accept-Charset': 'utf-8'}, 'encoding':'binary' }, parse);
				}
			};
			request({ 'uri' : url, 'headers':{'Accept-Charset': 'utf-8'}, 'encoding':'binary' }, parse);
			break;
		case "add":
			end.tts = "j'ai ajouté à la liste, " + data.item;
			callback(end);
			break;
		default:
			end.tts = "aucune action demandé";
			callback(end);
			break;
	}
	
	
}


  // ------------------------------------------
  //  SCRAPING
  // ------------------------------------------

var list = function(body){
	var $ = require('cheerio').load(body, { xmlMode: false, ignoreWhitespace: true, lowerCaseTags: false });
  var result = $('b').map(function(){ 
	return $(this).text();
	});
  return result;
}

var save = function(directory, objects){
  var fs   = require('fs');
  var file = directory + '/../plugins/courses/data.xml';
  var xml  = fs.readFileSync(file,'utf8');
  var replace  = '§ -->\n';
      replace += '<rule id="ruleCourseItemName">\n';
      replace += '  <tag>out.action=new Object();</tag>\n';
      replace += '  <one-of>\n';
      
  for(var i = 0 ; i < objects.length ; i++){
	for(var j = 0 ; j < objects[i].length ; j++){
      var item = objects[i][j];
	  if(item && item.match(/\S/)){
		replace += '    <item>'+item+'<tag>out.item="'+item+'";</tag></item>\n';
	  }
	}
  }
      replace += '  </one-of>\n';
      replace += '</rule>\n';
      replace += '<!-- §';
  
  var regexp = new RegExp('§[^§]+§','gm');
  var xml    = xml.replace(regexp,replace);
  
  fs.writeFileSync(file, xml, 'utf8');
}
