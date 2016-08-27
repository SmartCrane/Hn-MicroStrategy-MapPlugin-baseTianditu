(function () { 
    if (!mstrmojo.plugins.ArcGISClientPipe) {
        mstrmojo.plugins.ArcGISClientPipe = {};
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

    mstrmojo.plugins.ArcGISClientPipe.ArcGISClientPipe = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: "mstrmojo.plugins.ArcGISClientPipe.ArcGISClientPipe",
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
				var attr = "";
					//加载管线基本信息
					for(var j = 0;j<dataSets.length;j++)
					{
					var pipeLine = dataSets[j]["管线"];
					var netWork = dataSets[j]["管网"];
					var type = dataSets[j]["管网类型"];
					var date = dataSets[j]["投产日期"];
					var consState = dataSets[j]["运行状态"];
					
					var material = dataSets[j]["材质"];
					var situation = dataSets[j]["防腐状况"];
					var firtStop = dataSets[j]["首站"];
					var lastStop = dataSets[j]["末站"];
					
					var manageState = dataSets[j]["管理状态"];
					var management = dataSets[j]["管理处"];
					var time = dataSets[j]["寿命起始时间"];
					var outTime = dataSets[j]["预计失效时间"];
					var startTime=dataSets[j]["起止地点"];
					/*度量*/
					var linelength=dataSets[j]["管线长度"];
					var throughput=dataSets[j]["设计输量"];
					var pipeDiameter=dataSets[j]["管径"];
					var wall=dataSets[j]["壁厚"];
					var coating=dataSets[j]["防腐层厚度"];
					var temperature=dataSets[j]["设计温度"];
					var pressure=dataSets[j]["设计压力"];
					var battlefield=dataSets[j]["战场数量"];
					var station=dataSets[j]["压气站/泵站"];
					var pigging=dataSets[j]["清管站数量"];
					var chamber=dataSets[j]["线路截断阀室数"];
					var system=dataSets[j]["泄露报警系统数"];

					/*******度量*************/
					//var linelength,throughput,pipeDiameter,wall,coating,temperature,pressure,battlefield,station,pigging,chamber,system;
					for(var i=0; i<d_interface.getTotalRows(); i++ ) {                                        
                      linelength = d_interface.getMetricValue(i,0).getRawValue();
					  throughput = d_interface.getMetricValue(i,1).getRawValue();
					  pipeDiameter = d_interface.getMetricValue(i,2).getRawValue();
					  wall = d_interface.getMetricValue(i,3).getRawValue();
					  coating = d_interface.getMetricValue(i,4).getRawValue();
					  temperature = d_interface.getMetricValue(i,5).getRawValue();
					  pressure = d_interface.getMetricValue(i,6).getRawValue();
					  battlefield = d_interface.getMetricValue(i,7).getRawValue();
					  station = d_interface.getMetricValue(i,8).getRawValue();
					  pigging = d_interface.getMetricValue(i,9).getRawValue();
					  chamber = d_interface.getMetricValue(i,10).getRawValue();
					  system = d_interface.getMetricValue(i,11).getRawValue();
					}
					/***********************/
					attr = {"pipeLine":pipeLine,"netWork":netWork,"type":type,"date":date,"consState":consState,"material":material,"situation":situation,"firtStop":firtStop,"lastStop":lastStop,"manageState":manageState,"management":management,"time":time,"outTime":outTime,"startTime":startTime,"linelength":linelength,"throughput":throughput,"pipeDiameter":pipeDiameter,"wall":wall,"coating":coating,"temperature":temperature,"pressure":pressure,"battlefield":battlefield,"station":station,"pigging":pigging,"chamber":chamber,"system":system};
				}

		
					var i = setTimeout(function (){                             
						if(dataSets.length==1){
							
							var whereVal = varTaskField + " in ( '";
							whereVal = whereVal + dataSets[0]['STATIONID'] +"')";
							// var whereVal = "EVENTID IN ('" + dataSets[0]['管线'] +"')";
							// console.log(whereVal);
							var queryTask = new esri.tasks.QueryTask(varQueryTask);
							queryTask.disableClientCaching = true;
							var query = new esri.tasks.Query();
							query.returnGeometry = true;                  
							query.spatialRel = "esriSpatialRelIntersects";
							outSR=4326;
							query.where = whereVal;     
							// console.log(whereVal);
							query.outFields =["*"];
							
							queryTask.execute(query, showResults);
						}                      
					},1000); 
				
					
				var graphics = [];	
				function showResults(results){
					var Pipelayer = new esri.layers.GraphicsLayer({id: "pipe" });
					map.addLayer(Pipelayer,2);
					var resultCount = results.features.length;
					// console.log(resultCount);
					for(var i=0; i<resultCount; i++){
					//高亮颜色
					var lineSymbol = new esri.symbol.SimpleLineSymbol().setColor(new dojo.Color([247,82,196])).setWidth(3);
					infoTemplate = new esri.InfoTemplate(attr);
					// console.log(results.features[0].geometry);
					Linegraphic = new esri.Graphic(results.features[0].geometry,lineSymbol,attr,infoTemplate);
					Pipelayer.add(Linegraphic);
					
					//设置地图缩放
					LineExtend = results.features[i].geometry.getExtent();
					//管线和地图的坐标系不同会导致Extent赋值无效
					LineExtend.spatialReference = map.spatialReference;
					// console.log(LineExtend);
					map.setExtent(LineExtend);
					// console.log(map.spatialReference);
					
					//定义管线上的点
					// console.log(Math.floor(results.features[i].geometry.paths[0].length/2));
					pointIndex = Math.floor(results.features[i].geometry.paths[0].length/2);
					var PointX = results.features[i].geometry.paths[0][pointIndex][0];
					var PointY = results.features[i].geometry.paths[0][pointIndex][1];
					pt = new esri.geometry.Point(PointX,PointY,map.SpatialReference);  
					// console.log(pt);
					PtGraphic = new esri.Graphic(pt, new esri.symbol.TextSymbol(""), "", infoTemplate);
					Pipelayer.add(PtGraphic);
					//设置InfoWindow
					map.infoWindow.resize(500, 300);
					map.infoWindow.setTitle("管线基本信息");
					//console.log("attributes:"+Linegraphic.attributes);
					map.infoWindow.setContent(getTemplateContent(Linegraphic));
					map.infoWindow.show(pt, map.getInfoWindowAnchor(pt));
					}
					
				}
				function getTemplateContent(graphic)
				{
					var attr = graphic.attributes;
					
					var query = dojo.objectToQuery(attr);
					
					var src = '/MicroStrategy/plugins/ArcGISClientPipe/javascript/mojo/js/source/Pipe_iframe.html?'+query;
					return "<IFRAME id='iframepage' scrolling='auto' marginWidth=0 marginHeight=0 \
					src="+src+" frameBorder=0 width='100%' height='99%'></IFRAME>";
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
