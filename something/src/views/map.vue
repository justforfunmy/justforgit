<template>
  <div>
  
    <div id="map" ref="map">
      <div class="css-animation" ref="css_animation" v-show="isActive"></div>
      <div id="mouse-position" class="mouse-position-wrapper">
        <div class="custom-mouse-position"></div>
      </div>
      <div class="ol-popup" ref="popup">
        <a href="#" class="ol-popup-closer" ref="popup_closer"></a>
        <div class="content j-center a-center flex" ref="popup_content"></div>
      </div>
    </div>
    <div class="menu">
      <el-button @click='zoomIn'>zoomIn</el-button>
      <el-button @click='zoomOut'>zoomOut</el-button>
      <el-button @click='flyLocate(city[0].coords)'>fly to {{city[0].text}}</el-button>
      <el-button @click='flyLocate(city[1].coords)'>fly to {{city[1].text}}</el-button>
      <el-button @click='addMarks'>addMarks</el-button>
      <el-button @click='rectangular'>rectangular</el-button>
      <el-button @click='highLight'>HighLight</el-button>
      <el-button @click='warning'>warning</el-button>
      <el-button @click='reset'>reset</el-button>
      <el-button @click='fitToCD'>fitToChengdu</el-button>
      <el-button @click='styleChange'>selectStyle</el-button>
      <el-button @click='getCoords'>getCoords</el-button>
      <el-button @click='forTest'>test</el-button>
      <el-select v-model="measureType" placeholder="choose measureOption" @change='measure(measureType)'>
        <el-option v-for="item in measureOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </div>
  </div>
</template>
<script type="text/javascript">
import ol from 'openlayers'
export default {
  data() {
    return {
      map: null,
      layer: null,
      view: null,
      city: [{
        text: 'guangzhou',
        coords: [113.15, 23.08]
      }, {
        text: 'hangzhou',
        coords: [120.0, 30.0]
      }],
      measureOptions: [{
        value: 'length',
        label: 'Length'
      }, {
        value: 'area',
        label: 'Area'
      }],
      measureType: '',
      isActive: false
    }

  },
  mounted() {
    this.show();
  },
  methods: {
    show() {
      this.layer = new ol.layer.Tile({
        source: new ol.source.OSM()
      });
      this.view = new ol.View({
        center: [12950000, 4860000],
        minZoom: 2,
        maxZoom: 12,
        // rotation: Math.PI / 6,
        zoom: 8
      });
      this.map = new ol.Map({
        layers: [
          this.layer
        ],
        target: 'map',
        controls: ol.control.defaults({
          attributionOptions: ({
            collapsible: false
          })
        }).extend([
          new ol.control.FullScreen(),//全屏控件
          new ol.control.MousePosition({//鼠标位置控件
            coordinateFormat: ol.coordinate.createStringXY(2),
            projection: 'EPSG:4326',
            className: 'custom-mouse-position',
            target: document.getElementById('mouse-position')
          }),
          new ol.control.ScaleLine(),//比例尺
          new ol.control.ZoomSlider({}),//缩放条
          new ol.control.ZoomToExtent({})//缩放到图层
        ]),
        interaction: ol.interaction.defaults().extend([
          new ol.interaction.DragRotateAndZoom()

        ]),
        view: this.view
      });
    },
    zoomIn() {
      let view = this.map.getView();
      let zoom = view.getZoom();
      view.setZoom(zoom + 1);
    },
    zoomOut() {
      let view = this.map.getView();
      let zoom = view.getZoom();
      view.setZoom(zoom - 1);
    },
    flyLocate(coords) {
      let aimCity = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
      let duration = 2000;
      let start = +new Date();
      let pan = ol.animation.pan({
        duration: duration,
        source: this.view.getCenter(),
        start: start
      });
      let bounce = ol.animation.bounce({
        duration: duration,
        resolution: 4 * this.view.getResolution(),
        start: start,
      });
      this.map.beforeRender(pan, bounce);
      this.view.setCenter(aimCity)
    },
    measure(_type) {
      let map = this.map;
      //测量绘图的矢量图层
      let source = new ol.source.Vector();
      let vector = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
          //图层样式
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)' //填充颜色
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33', //边框颜色
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        })
      });
      map.addLayer(vector);
      //定义一个球对象
      let wgs84Sphere = new ol.Sphere(6378137);
      //当前绘制对象
      let sketch;
      //帮助提示框对象
      let helpTooltipElement;
      //帮助提示框提示信息
      let helpTooltip;
      //测量工具提示框对象
      let measureTooltipElement;
      //测量工具中显示的测量值
      let measureTooltip;
      //用户绘制多边形时的提示文本
      let continuePolygonMsg = 'Click to continue drawing the polygon';
      //用户绘制线时的提示文本
      let continueLineMsg = 'Click to continue drawing the line';

      //鼠标移动处理函数
      let pointerMoveHandler = function (evt) {
        if (evt.dragging) {
          return;
        }

        //type选择时对应文本
        let helpMsg = 'click to start drawing';
        if (sketch) {
          let geom = (sketch.getGeometry());
          if (geom instanceof ol.geom.Polygon) {
            helpMsg = continuePolygonMsg;
          } else if (geom instanceof ol.geom.LineString) {
            helpMsg = continueLineMsg;
          }
        }

        helpTooltipElement.innerHTML = helpMsg;
        helpTooltip.setPosition(evt.coordinate); //帮助信息位置

      };
      map.on('pointermove', pointerMoveHandler); //地图容器绑定鼠标移动事件，动态显示帮助提示框内容
      let draw;
      //交互绘制控件函数
      function addInteraction() {
        let type = (_type == 'area' ? 'Polygon' : 'LineString');
        draw = new ol.interaction.Draw({
          source: source, //测量绘制层数据源
          type: /** @type {ol.geom.GeometryType} */ (type), //几何图形类型
          style: new ol.style.Style({ //绘制几何图形的样式
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.5)'
            }),
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 0.5)',
              lineDash: [10, 10],
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 5,
              stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
              })
            })
          })
        });
        map.addInteraction(draw);
        createMeasureTooltip(); //创建测量工具提示框
        createHelpTooltip(); //创建帮助提示框

        let listener;
        //绑定交互绘制工具开始绘制的事件
        draw.on('drawstart',
          function (evt) {
            // set sketch
            sketch = evt.feature; //绘制的要素

            /** @type {ol.Coordinate|undefined} */
            let tooltipCoord = evt.coordinate; // 绘制的坐标
            //绑定change事件，根据绘制几何类型得到测量长度值或面积值，并将其设置到测量工具提示框中显示
            listener = sketch.getGeometry().on('change', function (evt) {
              let geom = evt.target; //绘制几何要素
              let output;
              if (geom instanceof ol.geom.Polygon) {
                output = formatArea( /** @type {ol.geom.Polygon} */(geom)); //面积值
                tooltipCoord = geom.getInteriorPoint().getCoordinates(); //坐标
              } else if (geom instanceof ol.geom.LineString) {
                output = formatLength( /** @type {ol.geom.LineString} */(geom)); //长度值
                tooltipCoord = geom.getLastCoordinate(); //坐标
              }
              measureTooltipElement.innerHTML = output; //将测量值设置到测量工具提示框中显示
              measureTooltip.setPosition(tooltipCoord); //设置测量工具提示框的显示位置
            });
          }, this);
        //绑定交互绘制工具结束绘制的事件
        draw.on('drawend',
          function (evt) {
            measureTooltipElement.className = 'tooltip tooltip-static'; //设置测量提示框的样式
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null; //置空当前绘制的要素对象
            // unset tooltip so that a new one can be created
            measureTooltipElement = null; //置空测量工具提示框对象
            createMeasureTooltip(); //重新创建一个测试工具提示框显示结果
            ol.Observable.unByKey(listener);
          }, this);

      };

      /**
       *创建一个新的帮助提示框（tooltip）
       */
      function createHelpTooltip() {
        if (helpTooltipElement) {
          helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'tooltip hidden';
        helpTooltip = new ol.Overlay({
          element: helpTooltipElement,
          offset: [15, 0],
          positioning: 'center-left'
        });
        map.addOverlay(helpTooltip);
      }
      /**
       *创建一个新的测量工具提示框（tooltip）
       */
      function createMeasureTooltip() {
        if (measureTooltipElement) {
          measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'tooltip tooltip-measure';
        measureTooltip = new ol.Overlay({
          element: measureTooltipElement,
          offset: [0, -15],
          positioning: 'bottom-center'
        });
        map.addOverlay(measureTooltip);
      }
      let formatLength = function (line) {
        let length = Math.round(line.getLength() * 100) / 100; //直接得到线的长度

        let output;
        if (length > 100) {
          output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km'; //换算成KM单位
        } else {
          output = (Math.round(length * 100) / 100) + ' ' + 'm'; //m为单位
        }
        return output; //返回线的长度
      };

      let formatArea = function (polygon) {
        let area = polygon.getArea(); //直接获取多边形的面积
        let output;
        if (area > 10000) {
          output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>'; //换算成KM单位
        } else {
          output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>'; //m为单位
        }
        return output; //返回多边形的面积
      };
      addInteraction(); //调用加载绘制交互控件方法，添加绘图进行测量
    },
    addMarks() {
      let map = this.map;
      let overlay = new ol.layer.Vector({
        source: new ol.source.Vector()
      });
      map.addLayer(overlay);
      map.on('click', function (evt) {
        let mark = new ol.Feature({
          geometry: new ol.geom.Point(evt.coordinate)
        });
        let hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
          evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
        mark.setStyle(new ol.style.Style({
          image: new ol.style.Icon({
            src: '../../static/mark.png'
          }),
          text: new ol.style.Text({
            fill: new ol.style.Fill({
              color: 'blue'
            }),
            text: hdms,
            offsetY: 18
          })
        }));
        overlay.getSource().addFeature(mark);
      });
    },
    rectangular() {
      let map = this.map;
      let source = new ol.source.Vector();
      let layer = new ol.layer.Vector({
        source
      });
      let draw = new ol.interaction.Draw({
        source: source,
        type: 'LineString',
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        }),
        maxPoints: 2,
        geometryFunction: function (coordinates, geometry) {
          if (!geometry) {
            geometry = new ol.geom.Polygon(null);
          }
          let start = coordinates[0];
          let end = coordinates[1];
          geometry.setCoordinates([
            [start, [start[0], end[1]], end, [end[0], start[1]], start]
          ]);
          return geometry;
        }
      })
      map.addLayer(layer);
      map.addInteraction(draw);
    },
    setBorder() {
      let map = this.map;
      //创建鼠标移动到热区样式
      let style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,255,255,0.6)'
        }),
        text: new ol.style.Text({
          font: '12px Calibri,sans-serif',
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: 'green',
            width: 3
          })
        })
      });
      let vectorLayer = new ol.layer.Vector({
        style: style
      });
      let features;
      let geojsonObject = {
        "type": "FeatureCollection",
        "features": []
      };
      this.$http.get('../../static/border.json').then(
        (response) => {
          features = response.data;
          geojsonObject.features.push(features);
          vectorLayer.setSource(new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
          }));
          map.addLayer(vectorLayer);
        }, (err) => {
          console.log(err)
        }
      );


    },
    warning() {
      let point_div = this.$refs.css_animation;
      let point_overlay = new ol.Overlay({
        element: point_div,
        positioning: 'center-center'
      });
      let map = this.map;
      map.addOverlay(point_overlay);
      let position = ol.proj.transform([116.38, 39.91], 'EPSG:4326', 'EPSG:3857');
      point_overlay.setPosition(position);
      this.isActive = true;
    },
    highLight() {
      let map = this.map;
      map.getView().setZoom(3);
      let highlightStyleCache = {};
      let highlight;

      /** 
      * 定义矢量图层 
      * 其中style是矢量图层的显示样式  
      */
      let style = new ol.style.Style({
        fill: new ol.style.Fill({ //矢量图层填充颜色，以及透明度  
          color: 'rgba(255, 255, 255, 0)'
        }),
        stroke: new ol.style.Stroke({ //边界样式  
          color: '#319FD3',
          width: 1
        }),
        text: new ol.style.Text({ //文本样式  
          font: '12px Calibri,sans-serif',
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
          })
        })
      });

      let vectorLayer = new ol.layer.Vector({ //初始化矢量图层  
        source: new ol.source.Vector({
          projection: 'EPSG:3857',
          url: '../../static/countries.geojson',   //从文件加载边界等地理信息 
          format: new ol.format.GeoJSON()
        }),
        style: function (feature, resolution) {
          style.getText().setText(resolution < 5000 ? feature.get('name') : '');  //当放大到1:5000分辨率时，显示国家名字  
          return [style];
        }
      });
      map.addLayer(vectorLayer);

      //当鼠标移动时，高亮相应的区域的函数 

      let featureOverlay = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#ffd800',
            width: 2
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.6)'
          }),
          text: new ol.style.Text({
            font: '12px Calibri,sans-serif',
            fill: new ol.style.Fill({
              color: '#000'
            }),
            stroke: new ol.style.Stroke({
              color: '#fff',
              width: 3
            })
          })
        })
      });
      map.addLayer(featureOverlay);

      let displayFeatureInfo = function (pixel) {
        let feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
          return feature;
        });
        if (feature !== highlight) {
          if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
          }
          if (feature) {
            featureOverlay.getSource().addFeature(feature);
          }
          highlight = feature;
        }

      };


      //鼠标移动的事件  

      map.on('pointermove', function (evt) {
        if (evt.dragging) {   //如果是拖动地图造成的鼠标移动，则不作处理  
          return;
        }
        let pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureInfo(pixel);
      });
      //地图点击事件
      let container = this.$refs.popup;
      let content = this.$refs.popup_content;
      let closer = this.$refs.popup_closer;
      let overlay = new ol.Overlay({
        element: content,
        position: 'center-center'
      });
      map.on('click', function (evt) {
        let pixel = map.getEventPixel(evt.originalEvent);
        let feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
          return feature;
        });
        let coordinate = evt.coordinate;
        let hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
          coordinate, 'EPSG:3857', 'EPSG:4326'));
        if (feature !== undefined) {
          content.innerHTML = '<p>你点击的坐标是：</p><code>' + hdms + '</code><p>这里属于：' + feature.get('name') + '</p>';
        }
        else {
          content.innerHTML = '<p>你点击的坐标是：</p><code>' + hdms + '</code><p>这里是大海！</p>';
        }
        overlay.setPosition(coordinate);
        map.addOverlay(overlay);
      })
    },
    reset() {
      this.$router.go(0)//刷新页面
    },
    forTest() {
      //地图范围
      let map = this.map;
      let bbox = map.getView().calculateExtent(map.getSize());
      console.log(bbox)
      let num = ol.proj.transform([bbox[0], bbox[1]], 'EPSG:3857', 'EPSG:4326');
      console.log(num)
    },
    fitToCD() {
      let map = this.map;
      let range = [];
      let min = ol.proj.transform([104, 30.6], 'EPSG:4326', 'EPSG:3857');
      let max = ol.proj.transform([104.12, 30.74], 'EPSG:4326', 'EPSG:3857');
      //es6 sperad
      range.push(...min, ...max);
      console.log(range)
      map.getView().fit(range, map.getSize());
    },
    styleChange() {
      let map = this.map;
      let layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
          image: new ol.style.Circle({
            radius: 30,
            fill: new ol.style.Fill({
              color: 'gold'
            })
          })
        })
      });
      let point = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([116, 40], "EPSG:4326", "EPSG:3857"))
      });
      // point.setStyle(new ol.style.Style({
      //   image: new ol.style.Circle({
      //     radius: 30,
      //     fill: new ol.style.Fill({
      //       color: 'gold'
      //     })
      //   })
      // }))
      layer.getSource().addFeature(point);
      map.addLayer(layer);
      let selectClick = new ol.interaction.Select({
        // condition: ol.events.condition.pointerMove,     // 唯一的不同之处，设置鼠标移到feature上就选取
        // style: new ol.style.Style({
        //   image: new ol.style.Circle({
        //     radius: 10,
        //     fill: new ol.style.Fill({
        //       color: 'blue'
        //     })
        //   })
        // })
      });
      map.addInteraction(selectClick);
      selectClick.on('select', function (event) {
        console.log(event.selected[0])
        event.selected[0].setStyle(new ol.style.Style({
          image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({
              color: 'red'
            })
          })
        }));
      })
    },
    getCoords(){
      let map = this.map;
      let layer = new ol.layer.Vector({
        source:new ol.source.Vector(),
        style:new ol.style.Style({
          stroke:new ol.style.Stroke({
            color:"red",
            size:3
          })
        })
      });
      map.addLayer(layer);
      let lineDraw = new ol.interaction.Draw({
        type:'LineString',
        style:new ol.style.Style({
          stroke:new ol.style.Stroke({
            color:'#009933',
            size:3
          })
        }),
        maxPoints:4,
        source:layer.getSource()// 注意设置source，这样绘制好的线，就会添加到这个source里
      });
      //获取坐标
      let content = this.$refs.popup_content;
      lineDraw.on('drawend',function(event){
          let coords = JSON.stringify(event.feature.getGeometry().getCoordinates());
          alert(coords)
      })
      map.addInteraction(lineDraw)
    }

  },
  components: {

  }
};
</script>

<style scoped lang="scss">
#map {
  position: absolute;
  top: 50px;
  left: 0;
  bottom: 0;
  right: 0;
  .marks {
    position: absolute;
    z-index: 9999;
  }
}

.menu {
  padding: 7px 0;
}










/* 提示框的样式信息*/

.tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
}

.tooltip-measure {
  opacity: 1;
  font-weight: bold;
}

.tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}

.tooltip-measure:before,
.tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}

.tooltip-static:before {
  border-top-color: #ffcc33;
}

.mouse-position-wrapper {
  width: 150px;
  height: 29px;
  color: #FFFFFF;
  background: #111;
  opacity: 0.5;
  position: absolute;
  left: 150px;
  bottom: 6px;
  z-index: 9999;
  border-radius: 5px;
  line-height: 29px;
  text-align: center;
}

.ol-popup {
  position: absolute;
}

.content {
  width: 300px;
  height: 120px;
  background: #fff;
  flex-direction: column;
  font-size: 16px;
  line-height: 30px;
  border-radius: 5px;
}

.css-animation {
  height: 50px;
  width: 50px;
  border-radius: 25px;
  background: rgba(255, 0, 0, 0.9);
  transform: scale(0);
  animation: myfirst 3s;
  animation-iteration-count: infinite;
}

@keyframes myfirst {
  to {
    transform: scale(2);
    background: rgba(0, 0, 0, 0);
  }
}
</style>