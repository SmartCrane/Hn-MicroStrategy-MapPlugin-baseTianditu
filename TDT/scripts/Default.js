/**************************************************************************************************
 * 项目名称: 中国石化智能化管线管理系统
 * 模块名称: 主页面的默认入口单元
 * 当前版本: V 1.0
 * 开始时间: 20160323..
 * 完成时间:
 * 开发者  : ..ALEX..
 * 重要描述: 主页面的默认入口单元
 ***************************************************************************************************
 * 版本: V 1.0 (..ALEX..20160323.)
 * 描述: 建立
 ***************************************************************************************************/

require([
    "esri/map",
    "esri/geometry/Extent",
    "layerEx/TDTLayer",
    "dojo",
    "dojo/request",
    "dojo/domReady!"
], function(
    Map,
    Extent,
    TDTLayer,
    dojo,
    request
    ) {
    //=============================================================================================
    //获取安全地图服务token值
    //=============================================================================================
    request.post("http://10.246.132.249:8080/RemoteTokenServer", {
        data: {
            request:"getToken",
            expiration:180,
            username:"",
            password:"",
            clientid:"ref.http://localhost"
        },
        headers: {
        }
    }).then(
        function(text){
            onGetTokenCallback(text);
        },
        function(error){
            alert("获取安全地图服务的token值失败。\n" + error);
        }
    );
    //=============================================================================================
    //创建地图对象并添加图层
    //=============================================================================================
    var BASEMAP_TYPE_RASTER = 0;
    var BASEMAP_TYPE_VECTOR = 1;
    var BASEMAP_TYPE_TERRAIN = 2;

    var LAYER_ID_TDT_RASTER = "tdtRasterLayer";
    var LAYER_ID_TDT_RASTER_LABEL = "tdtRasterLabelLayer";
    var LAYER_ID_TDT_VECTOR = "tdtVectorLayer";
    var LAYER_ID_TDT_VECTOR_LABEL = "tdtVectorLabelLayer";
    var LAYER_ID_TDT_TERRAIN = "tdtTerrainLayer";
    var LAYER_ID_TDT_TERRAIN_LABEL = "tdtTerrainLabelLayer";

    var map = null;
    function onGetTokenCallback(token) {
        map = new Map("mapDiv", {
            logo: false
        });
        map.on("load", function(event){
            map.fullExtent = new Extent(71.4223526482106, 11.8475766820388, 145.233233049066, 56.2483190508318);
            map.extent = map.fullExtent;
        });
        //---------------------------------------------------------------------------------------------
        AddTDTLayer(LAYER_ID_TDT_RASTER, "http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-image-globe/WMTS", "img", token);//加载影像底图
        AddTDTLayer(LAYER_ID_TDT_RASTER_LABEL, "http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-label-image/WMTS", "cia", token);//加载影像标注
        //---------------------------------------------------------------------------------------------
        AddTDTLayer(LAYER_ID_TDT_VECTOR, "http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-vector-globe/WMTS", "vec", token);//加载矢量底图
        AddTDTLayer(LAYER_ID_TDT_VECTOR_LABEL, "http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-label-vector/WMTS", "cva", token);//加载矢量标注
        //---------------------------------------------------------------------------------------------
        AddTDTLayer(LAYER_ID_TDT_TERRAIN, "http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-ter-globe/WMTS", "ter", token);//加载矢量底图
        AddTDTLayer(LAYER_ID_TDT_TERRAIN_LABEL, "http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-label-ter/WMTS", "cta", token);//加载矢量标注
        //---------------------------------------------------------------------------------------------
        BindingEvents();
        ChangeBasemap(BASEMAP_TYPE_RASTER);
    }
    //创建天地图图层
    function AddTDTLayer(id, url, layerType, token){
        var cTDTLayer = new TDTLayer();
        cTDTLayer.id = id;
        cTDTLayer.baseURL = url;
        cTDTLayer.layerType = layerType;
        cTDTLayer.tokenValue = token;
        cTDTLayer.visible = false;
        map.addLayer(cTDTLayer);
    }
    //=============================================================================================
    //切换底图部分
    //=============================================================================================
    function BindingEvents() {
        //document.getElementById("imgRaster").addEventListener('click', onImageClick, false);
        //document.getElementById("imgVector").addEventListener('click', onImageClick, false);
        //document.getElementById("imgTerrain").addEventListener('click', onImageClick, false);
        dojo.connect(dojo.byId("imgRaster"), "click", onImageClick);
        dojo.connect(dojo.byId("imgVector"), "click", onImageClick);
        dojo.connect(dojo.byId("imgTerrain"), "click", onImageClick);
    }
    function onImageClick(event) {
       switch(event.target.id)
       {
           case "imgRaster" : { ChangeBasemap(BASEMAP_TYPE_RASTER); break; };
           case "imgVector" : { ChangeBasemap(BASEMAP_TYPE_VECTOR); break; };
           case "imgTerrain" : { ChangeBasemap(BASEMAP_TYPE_TERRAIN); break; };
       }
    }
    function ChangeBasemap(type)
    {
        switch(type)
        {
            case BASEMAP_TYPE_RASTER: {
                HideAllLayers();
                SetLayerVisible(LAYER_ID_TDT_RASTER, true);
                SetLayerVisible(LAYER_ID_TDT_RASTER_LABEL, true);
                break;
            }
            case BASEMAP_TYPE_VECTOR: {
                HideAllLayers();
                SetLayerVisible(LAYER_ID_TDT_VECTOR, true);
                SetLayerVisible(LAYER_ID_TDT_VECTOR_LABEL, true);
                break;
            }
            case BASEMAP_TYPE_TERRAIN: {
                HideAllLayers();
                SetLayerVisible(LAYER_ID_TDT_TERRAIN, true);
                SetLayerVisible(LAYER_ID_TDT_TERRAIN_LABEL, true);
                break;
            }
        }
    }
    function HideAllLayers()
    {
        var layerIDArray = map.layerIds;
        if(layerIDArray && (layerIDArray.length > 0))
        {
            for(var i = 0; i < layerIDArray.length; i++)
            {
                SetLayerVisible(layerIDArray[i], false);
            }
        }
    }
    function SetLayerVisible(cID, cVisible)
    {
        var lyr =  map.getLayer(cID);
        if(lyr)
        {
            if(lyr.visible != cVisible)
            {
                lyr.setVisibility(cVisible);
            }
        }
    }
});