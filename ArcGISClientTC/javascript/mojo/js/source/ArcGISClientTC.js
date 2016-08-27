(function () { 
    if (!mstrmojo.plugins.ArcGISClientTC) {
        mstrmojo.plugins.ArcGISClientTC = {};
    }
	dojoConfig = {
            parseOnLoad: true,
            packages: [{
                name: 'scripts',
                location: "/MicroStrategy/plugins/TDT/scripts/layerEx"
            }]
        };
    mstrmojo.requiresCls(
        "mstrmojo.CustomVisBase",
        "mstrmojo.models.template.DataInterface"
    );

    mstrmojo.plugins.ArcGISClientTC.ArcGISClientTC = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: "mstrmojo.plugins.ArcGISClientTC.ArcGISClientTC",
            cssClass: "redialprogress",
            errorMessage: "Either there is not enough data to display the visualization or the visualization configuration is incomplete.",
            errorDetails: "Erroring  Error message  0.09",
            externalLibraries: [{url:"/arcgis_js_v312_api/arcgis_js_api/library/3.12/3.12/init.js"}, 
            {url:"../plugins/js/jquery-1.12.1.min.js"}],
            useRichTooltip: true,
            reuseDOMNode: true,
            plot:function(){              

            this.domNode.innerHTML="";

            //获取数据
            var $D1 = mstrmojo.models.template.DataInterface;
            var d_interface = new $D1(this.model.data);    
            this.domNode.style.top=this.top+"px";
            this.domNode.style.left=this.left+"px";
            this.domNode.style.width=this.width+"px";
            var dataSets= d_interface.getRawData($D1.ENUM_RAW_DATA_FORMAT.ROWS);  
			debugger;
			var map; 
            $(this.domNode).append("<link rel='stylesheet' type='text/css' href='/arcgis_js_v312_api/arcgis_js_api/library/3.12/3.12/dijit/themes/claro/claro.css'>");                   
            $(this.domNode).append("<link rel='stylesheet' type='text/css' href='/arcgis_js_v312_api/arcgis_js_api/library/3.12/3.12/esri/css/esri.css'>");  
						
            $(this.domNode).append("<link rel='stylesheet' href='../plugins/js/default.css'>");
			$(this.domNode).append("<div id='map' style='width:100%;height:100%;'></div>");
            var varQueryTask,varTaskField,varTaskValue;
            // $("#"+Rand).append("<div id='legend'><span id='great' class='legend'>重大</span><span id='large' class='legend'>较大</span><span id='general' class='legend'>一般</span></div>");
            require([
				"esri/map",  
				"scripts/TDTLayer",  
				"scripts/TDAnnoLayer",  
				"esri/layers/FeatureLayer",  
				"esri/layers/ImageParameters",
				"esri/layers/ArcGISDynamicMapServiceLayer",
				"esri/geometry/Point",  
				"esri/symbols/SimpleFillSymbol",  
				"esri/symbols/SimpleLineSymbol", 
				"esri/request",
				"dojo/query",
				"dojo/_base/Color",
				/**************/
                "dojo/domReady!"
                ],
               function(Map,  
				TDTLayer,  
				TDAnnoLayer,
				ImageParameters,
				ArcGISDynamicMapServiceLayer,
				 FeatureLayer,  
				 Point,  
				 SimpleFillSymbol,  
				 SimpleLineSymbol,
				esriRequest,
				query,
				 Color  ){
				/**********************
				var tokenurl,username,password,localserverip,basemapUrl,PipeLineInfo,mapServer,annolayerUrl;
				(function(){
					$.ajax({
						type:'GET',
						async:false,
						url:"/MicroStrategy/plugins/ArcGISClientHC/javascript/mojo/js/source/config.json",
						dataType:'json',
						success:function(data){
							//console.log("sucess:"+data);
							for(var key in data){
								tokenurl=data[key].tokenurl;
								username=data[key].username;
								password=data[key].password;
								localserverip=data[key].localserverip;
								basemapUrl=data[key].basemapUrl;
								annolayerUrl=data[key].annolayerUrl;
								PipeLineInfo=data[key].PipeLineInfo;
								mapServer=data[key].mapServer;
								
							}
							
						}
						
					})
				}());

			*/
			/****************/
			var photos = esriRequest({
                  url: "/MicroStrategy/plugins/Mapconfig/config.json",
                  handleAs: "json"
                });
				// console.log("photos:"+photos);
				// for(var key in photos){
					// console.log("hahah:"+photos[key]);
				// }
				var tokenurl,userid,username,password,localserverip,basemapUrl,PipeLineInfo,mapServer,annolayerUrl;
                photos.then(function(e){
					varQueryTask = e[0].QueryTask;
					console.log('json',e)
					varTaskField = e[0].TaskField;
					if(dataSets[0]['userid'])
						userid = dataSets[0]['userid'];
					else
						userid=e[0].userid;
					varMetricName = e[0].MetricName;
					varTiledMap = e[0].TiledMap;
					varConditionN = e[0].ConditionN;
					varConditionM = e[0].ConditionM;
					varDynamicServer = e[0].DynamicServer;
					console.log('1',e[0].tokenurl)
					tokenurl=e[0].tokenurl;
					username=e[0].username;
					password=e[0].password;
					localserverip=e[0].localserverip;
					basemapUrl=e[0].basemapUrl;
					PipeLineInfo=e[0].PipeLineInfo;
					mapServer=e[0].mapServer;
					annolayerUrl=e[0].annolayerUrl;
				
			/****************/
				dojo.ready (GetToken);
				function GetToken ()
				{
					
					$.ajax ({
						type : 'GET',
						async:false,
						
						url : tokenurl,
						dataType : 'html' ,//json>>error,html>>success
						contentType : 'application/json ',
						data : {
							request : 'getToken',
							username : username ,
							password : password ,
							clientid : 'ref.' +localserverip ,
							expiration : 60
						},
						timeout : 600000 ,
						success : function ( token) {
						//加载完token后再加载地图
										
							MapInit (token );
						},
						error :function (xhr ){
							return false;
						},
					});

				}
				function MapInit(token){
					//console.log("token"+token);															
					var fullExtent= new esri.geometry.Extent(100.297607,21.331299,114.612793,26.670654,
						new esri.SpatialReference({wkid:4326})
					);
					
					map = new Map("map",{logo:false,extent:fullExtent,zoom: 5,maxZoom: 20,});
					//console.log(map.extent);
					//var basemap = GetTDTLayer ("1","http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-image-globe/WMTS" , "img" , token ,"true" );
					
					var basemap = GetTDTLayer ("1",basemapUrl , "img" , token ,"true" );
					map.addLayer(basemap);  
					//var annolayer = GetTDTLayer ("2","http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-label-image/WMTS" , "cia" , token ,"true" ); 
					var annolayer = GetTDTLayer ("2",annolayerUrl , "cia" , token ,"true" );
					map.addLayer(annolayer);                                               
                  var ORGCODES = [];
                  // 拼接where条件 
				$.ajax({
					async:false,
					type:"GET",
					url:PipeLineInfo,
					data:"userid=" + dataSets[0]['userid'],//未来通过提示应答，单独存到报表中，再冲报表中取用户信息
					data:"userid=" + userid,
					success:function(data){
						//var arr=[];
						for(key in data){
							var orgcode=data[key].ORGCODE;
							if(dojo.indexOf(ORGCODES,orgcode)<0){
								ORGCODES.push(orgcode)
							}
						}
					
				}
					});	
				  //加载管道本体图层
				  
				  var imageParameters = new esri.layers.ImageParameters();
				  imageParameters.layerDefinitions = layerDefs;
				  imageParameters.layerIds = [53,54];
				  imageParameters.layerOption = ImageParameters.LAYER_OPTION_SHOW;
				  imageParameters.transparent = true;
				  var layerDefs = [];
				  //ORGCODE从服务中获取
				  layerDefs[0] = "ORGCODE IN ("+"'"+ORGCODES.join("','")+"'"+")";
				  varDynamicServer = mapServer;
				  GXBTLayer = new esri.layers.ArcGISDynamicMapServiceLayer(varDynamicServer,{"imageParameters": imageParameters});
				  
				  map.addLayer(GXBTLayer);  
  		  
				/**********************************/
				var tclayer = new esri.layers.GraphicsLayer({id: "tc" });
				  map.addLayer(tclayer,2);
					//加载第三方施工
					for(var j = 0;j<dataSets.length;j++)
					{
						var consNam = dataSets[j]["第三方施工名称"];
						var stickNum = dataSets[j]["位置/桩号"];
						var situDes = dataSets[j]["情况描述"];
						var consOrg = dataSets[j]["施工单位"];
						var consState = dataSets[j]["施工状态"];
					
					var consRate = dataSets[j]["施工进展"];
					var consCharge = dataSets[j]["负责人"];
					var consChargeTel = dataSets[j]["负责人电话"];
					var localGuard = dataSets[j]["现场监护"];
					
					var localTel = dataSets[j]["监护电话"];
					var secAgree = dataSets[j]["安全协议"];
					var guaMoney = dataSets[j]["有无保证金"];
					var measure = dataSets[j]["采取措施"];
					
					
					var x = dataSets[j]['x'];
					var y = dataSets[j]['y'];
					//console.log(dataSets[j]);
					//if(hdLevel)
					//var lineSymbol = new esri.symbol.SimpleLineSymbol().setColor(new dojo.Color([255,232,0])).setWidth(3);
					var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
					var color =new esri.Color([144,255,0,0.8]);
					//if(hdLevel == "重大")
					//{
						//color = new esri.Color([255,0,0,0.8])
					//}
					//else if(hdLevel == "较大")
					//{
					 // color = new esri.Color([255,255,60,0.8])
					//}
					//else
					//{
					 // color = new esri.Color([0,255,0,0.8])
					//}
					var outline = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new Color([255,0,0]), 1);
					markerSymbol.setColor(color);
					markerSymbol.setOutline(outline);
					markerSymbol.setSize(5);
					//markerSymbol.setOffset(x, y);
					//console.log(markerSymbol);
					//var renderer = new SimpleRenderer(markerSymbol);

					//featureLayer.setRenderer(renderer);
					//map.infoWindow.resize(500,210);
					
					var attr = {"consNam":consNam,"stickNum":stickNum,"situDes":situDes,"consOrg":consOrg,"consState":consState,"consRate":consRate,"consCharge":consCharge,"consChargeTel":consChargeTel,"localGuard":localGuard,"localTel":localTel,"secAgree":secAgree,"guaMoney":guaMoney,"measure":measure,};
					//console.log(attr);
					var pt = new esri.geometry.Point(x,y,map.SpatialReference);
					//var content = "<div><span>隐患名称：${hdName},隐患等级：${hdLevel}</span></div>";
					var template = new esri.InfoTemplate();
					template.setTitle("第三方施工信息");
					//template.setContent(content);
					template.setContent(getTemplateContent);
					//console.log(template);
					var graphic = new esri.Graphic(pt, markerSymbol,attr,template); 
					//var graphic = new esri.Graphic(results.features[i].geometry,markerSymbol,template);
					graphic.setInfoTemplate(template);
					//console.log(graphic);
					//map.graphics.add(graphic); 
					tclayer.add(graphic);
					// dojo.connect(map.graphic, "onClick", identifyFeatures); 
					// function identifyFeatures(evt){
						// var extentGeom = pointToExtent(map,evt.mapPoint,10);
					   // }
					var i = setTimeout(function (){                             
                      if(dataSets.length==1){
						zoomTo(pt.y,pt.x);
                        map.infoWindow.resize(500, 300);
                        map.infoWindow.setTitle("第三方施工信息");                    
                        map.infoWindow.setContent(getTemplateContent(graphic));                    
                        map.infoWindow.show(pt, map.getInfoWindowAnchor(pt));                                     //缩放地图
						//map.centerAndZoom(pt,12);
						

                      }                      
                    },1000); 

					//map.infoWindow.show(pt, map.getInfoWindowAnchor(pt)); 
					//dojo.connect(tclayer, "onClick", showInfo_graphisc);
				//for (var i = 0; i < resultCount; i++) {  

					//results.features[i].setRenderer(renderer);                    
					//results.features[i].setInfoTemplate(template);                    
					//var graphic = new esri.Graphic(results.features[i].geometry,markerSymbol);
					//graphicsLayer.add(graphic);
					//var renderer = new esri.renderers.UniqueValueRenderer(null, "Type");
					//renderer.addValue("", markerSymbol);
					//layer.setRenderer(renderer);
					//map.addLayer(layer);
					//console.log(results.features[i]);
				//} 
					//var point =  new esri.Graphic(results.features[i].geometry,markerSymbol);

				}            

				
				function showInfo_graphisc(evt) {                                                              
					//map.infoWindow.resize(500, 200);
					//map.infoWindow.setTitle("信息");                    
					//map.infoWindow.setContent("....");    
					//console.log(evt);                                        
					//map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));    
				}
				function getTemplateContent(graphic)
				{
					var attr = graphic.attributes;
					//console.log(graphic);
					var query = dojo.objectToQuery(attr);
					//console.log(query);
					/*console.log(graphic);
					var attr = graphic.attributes.qSpecies.replace('"',"");
					var names=attr.split("::");
					var commName = string.trim(names[1].replace('"',""));
					var hlink = names[0].split(" ");
					var sciName = hlink[0] + "_" + hlink[1];
					if(commName === ""){
						commName = names[0];
					}*/
					var src = '/MicroStrategy/plugins/ArcGISClientTC/javascript/mojo/js/source/tc_iframe.html?'+query;
					// console.log(src);
					return "<IFRAME id='iframepage' scrolling='auto' marginWidth=0 marginHeight=0 \
					src="+src+" frameBorder=0 width='100%' height='99%'></IFRAME>";
				} 
				function zoomTo(lat, lon) {
					require([
					  "esri/geometry/Point", "esri/geometry/webMercatorUtils"
					], function(Point, webMercatorUtils) {
					  var point = new Point(lon, lat, {
						wkid: "4326"
					  });
					  var wmpoint = webMercatorUtils.geographicToWebMercator(point);
					  // map.centerAt(wmpoint);
						map.centerAndZoom(wmpoint,3)
					});
				}
			/**/}
			/************/
			function GetTDTLayer (id ,url , layerType , token ,visible )
				{
						var cTDTLayer ;
						require (
						[
								"scripts/TDTLayer" ,
						],

								function( TDTLayer)
								{
										cTDTLayer = new TDTLayer ();
										cTDTLayer.id = id ;
										cTDTLayer.baseURL = url ;
										cTDTLayer.layerType = layerType ;
										cTDTLayer.tokenValue = token ;
										cTDTLayer.visible = visible ;
										//map.addLayer(cTDTLayer);
										//console.log(cTDTLayer);
										//return cTDTLayer;

								}
						);
						return cTDTLayer ;
				}
			
				/*???*/});
        }); 
			/************************/															
			}/*polt*/
		})/*null xia  he  shang */
}());
