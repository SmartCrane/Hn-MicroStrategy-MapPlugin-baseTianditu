/**************************************************************************************************
 * 项目名称: 中国石化智能化管线管理系统
 * 模块名称: 自定义的加载天地图底图服务图层
 * 当前版本: V 1.0
 * 开始时间: 20160323..
 * 完成时间:
 * 开发者  : ..ALEX..
 * 重要描述: 基于自定义的图层类，加载天地图底图服务
 ***************************************************************************************************
 * 版本: V 1.0 (..ALEX..20160323.)
 * 描述: 建立
 ***************************************************************************************************/

define([
        "dojo/_base/declare",
        "esri/layers/tiled"],
    function (declare) {
        return declare(esri.layers.TiledMapServiceLayer, {
            baseURL:"",//地图服务根路径
            layerType:"",//图层的类型：img、cia、vec、cva、ter、cta
            tokenValue:"",//安全地图服务Token值

            constructor: function () {
                this.spatialReference = new esri.SpatialReference({ wkid: 4326 });
                this.initialExtent = (this.fullExtent = new esri.geometry.Extent(-180.0, -90.0, 180.0, 90.0, this.spatialReference));
                this.tileInfo = new esri.layers.TileInfo({
                    "rows": 256,
                    "cols": 256,
                    "compressionQuality": 0,
                    "origin": {//原点坐标
                        "x": -180,
                        "y": 90
                    },
                    "spatialReference": {//坐标系
                        "wkid": 4326
                    },
                    "lods": [//切片级别参数
                        { "level": 1, "resolution": 0.703125, "scale": 2.9549759305875003E8},
                       { "level": 2, "resolution":0.3515625, "scale": 1.4774879652937502E8},
                       { "level": 3, "resolution":0.17578125, "scale": 7.387439826468751E7},
                       { "level": 4, "resolution":0.087890625, "scale": 3.6937199132343754E7},
                       { "level": 5, "resolution":0.0439453125, "scale": 1.8468599566171877E7},
                       { "level": 6, "resolution":0.02197265625, "scale": 9234299.783085939},
                       { "level": 7, "resolution":0.010986328125, "scale": 4617149.891542969},
                       { "level": 8, "resolution":0.0054931640625, "scale": 2308574.9457714846},
                       { "level": 9, "resolution":0.00274658203125, "scale": 1154287.4728857423},
                       { "level": 10, "resolution":0.001373291015625, "scale": 577143.7364428712},
                       { "level": 11, "resolution":6.866455078125E-4, "scale": 288571.8682214356},
                       { "level": 12, "resolution":3.4332275390625E-4, "scale": 144285.9341107178},
                       { "level": 13, "resolution":1.71661376953125E-4, "scale": 72142.9670553589},
                       { "level": 14, "resolution":8.58306884765625E-5, "scale": 36071.48352767945},
                       { "level": 15, "resolution":4.291534423828125E-5, "scale": 18035.741763839724},
                       { "level": 16, "resolution":2.1457672119140625E-5, "scale": 9017.870881919862},
                       { "level": 17, "resolution":1.0728836059570312E-5, "scale": 4508.935440959931},
                       { "level": 18, "resolution":0.536441802978516e-5, "scale": 2254.4677204799655},
                       { "level": 19, "resolution":0.26822090148925781e-5, "scale": 1127.2338602399827},
                       { "level": 20, "resolution":1.3411045074462891e-6, "scale": 563.61693011999137}
                    ]
                });
                this.loaded = true;
                this.onLoad(this);
            },
            getTileUrl: function (level, row, col) {
                var url = this.baseURL+ "/WMTS?TOKEN="+this.tokenValue+"&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0" +
                "&STYLE=Default&FORMAT=tiles&LAYER="+this.layerType +
                "&TILEMATRIXSET=c&TILEMATRIX=" + level + "&TILEROW=" + row + "&TILECOL=" + col;
                return url;
            }
        });
    });