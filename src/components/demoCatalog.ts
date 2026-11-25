export interface CatalogNode {
  id: string
  name: string
  children?: CatalogNode[]
  file?: string
  owner?: string
  description?: string
}

function example(id: string, name: string, file: string, owner: string, description?: string): CatalogNode {
  return { id, name, file, owner, description }
}

function group(id: string, name: string, children: CatalogNode[]): CatalogNode {
  return { id, name, children }
}

export const demoCatalog: CatalogNode[] = [
  group('camera', '相机与漫游', [
    group('viewpoints', '视点与飞行', [
      example('camera-universal', '相机控制', 'DemoCamera', 'Camera', '控制三维场景中的相机位置、观察方向与飞行时间。'),
      example('camera-fly-to-target', '目标点屏幕偏移飞行', 'DemoCameraFlyToTarget', 'Camera'),
      example('caveCameraLook', '洞窟内相机定位', 'DemoCaveCameraLook', 'DasUtilsCalCircleLook · Camera'),
    ]),
    group('operator', '操作器设置', [
      example('camera-setting', '操作器切换与投影', 'DemoCameraSetting', 'Scene'),
      example('camera-operator-setting', '通用操作器设置', 'DemoCameraOperatorSetting', 'Camera'),
      example('camera-freeflight', '第一人称操作器', 'DemoDasFreeFlightCamera', 'DasFreeFlightCamera'),
    ]),
    group('roaming', '路线漫游与导航', [
      example('cameraRoamingLayer', '相机路径漫游', 'DemoDasCameraRoamingLayer', 'DasCameraRoamingLayer'),
      example('cameraRoamingCircleLayer', '相机环绕漫游', 'DemoDasCameraRoamingCircleLayer', 'DasCameraRoamingCircleLayer'),
      example('splineWalk', '样条行走', 'DemoDasSplineWalk', 'DasSplineWalk'),
      example('watchGuideLine', '引导路线', 'DemoWatchGuideLine', 'WatchGuideLine'),
      example('compass', '指北针', 'DemoDasCompass', 'DasCompass'),
    ]),
  ]),
  group('scene', '场景与环境', [
    group('scene-content', '关卡加载与序列', [
      example('sceneControl', '关卡加载与切换', 'SceneDemo', 'Scene · Camera'),
      example('kezierTileset', '克孜尔场景加载', 'DemoDasKezierTileset', 'DasModelTilesetLayer'),
      example('levelSequence', '关卡序列播放', 'levelSequence', 'LevelSequenceControl'),
    ]),
    group('scene-actors', '角色与车辆', [
      example('thirdPersonCamera', '人物换装', 'DemoDasThirdPersonCamera', 'ThirdPersonCamera'),
      example('carLayer', '车辆图层与运动', 'DemoDasCarLayer', 'DasCarLayer'),
    ]),
    group('weather-light', '天气与光照', [
      example('weather', '天气、季节与降水', 'weatherDemo', 'Weather', '选择雨、雪或雷雨后，可分别调整对应的降水参数。'),
      example('atmosphere', '风场与云雾', 'DemoWeatherAtmosphere', 'Weather'),
      example('sky-light', '时间、日照与夜空', 'DemoWeatherLighting', 'Weather'),
      example('lightLayer', '灯光图层', 'DemoDasLightLayer', 'DasLightPointLayer · DasLightTorchLayer'),
      example('spotLightTool', '交互聚光灯', 'DemoDasToolSpotLight', 'DasToolSpotLight'),
    ]),
  ]),
  group('spatial', '空间查询与测量', [
    group('coordinates', '坐标与空间查询', [
      example('setOrigin', '场景原点设置', 'DemoDasSetOrigin', 'Scene'),
      example('screenToWorld', '屏幕坐标转世界坐标', 'DemoScreenToWorld', 'Scene'),
      example('screenPosInformer', '跟踪点位屏幕坐标', 'ScreenPosInformerDemo', 'ScreenPosInformer'),
      example('heightQuery', '高度查询', 'DemoDasHeight', 'Scene'),
      example('informerShape', '区域感应', 'DemoDasInformerShape', 'DasInformerShape'),
    ]),
    group('measurement', '空间测量', [
      example('measurementPoint', '点位测量', 'DemoDasMeasurementPoint', 'DasToolMeasurementPoint'),
      example('measurementDistance', '距离测量', 'DemoDasMeasurementDistance', 'DasToolMeasurementDistance'),
      example('measurementDistanceSurface', '表面距离测量', 'DemoDasMeasurementDistanceSurface', 'DasToolMeasurementDistanceSurface'),
      example('measurementArea', '面积测量', 'DemoDasMeasurementArea', 'DasToolMeasurementArea'),
      example('measurementAngle', '角度测量', 'DemoDasMeasurementAngle', 'DasToolMeasurementAngle'),
    ]),
  ]),
  group('tool', '绘制与编辑', [
    group('draw-lines', '点线绘制', [
      example('pointsTool', '点位绘制', 'DasPointsToolDemo', 'DasPointsTool'),
      example('polylineTool', '多段线绘制', 'DemoDasPolylineTool', 'DasPolylineTool', '在视口采集折点，保存后可到「多段线图层」调整线条样式。'),
      example('polylineLayer', '多段线图层', 'DemoDasPolylineLayer', 'DasPolylineLayer'),
      example('fitEarthPolylineLayer', '贴地折线图层', 'DemoDasFitEarthPolylineLayer', 'DasFitEarthPolylineLayer'),
      example('splineLayer', '样条线图层', 'DemoDasSplineLayer', 'DasSpline'),
    ]),
    group('draw-surfaces', '多边形与贴花', [
      example('polygonLayer', '多边形图层', 'DemoDasPolygonLayer', 'DasPolygonLayer'),
      example('fitEarthPolygonLayer', '贴地多边形图层', 'DemoDasFitEarthPolygonLayer', 'DasFitEarthPolygonLayer'),
      example('fitLookPolygonLayer', '立面多边形图层', 'DemoDasFitLookPolygonLayer', 'DasFitLookPolygonLayer'),
      example('decalLayer', '贴花图层', 'DemoDasDecalLayer', 'DasDecalLayer'),
    ]),
    group('select-transform', '选择与变换', [
      example('selectTool', '场景对象选择', 'DasSelectToolDemo', 'DasSelectTool'),
      example('selectFitPolygonTool', '立面多边形选择', 'DemoDasToolSelectFitPolygon', 'DasToolSelectFitPolygon'),
      example('gizmosTool', 'Gizmos 车辆变换', 'DemoDasGizmosTool', 'DasGizmosOperateTool'),
      example('gizmosAxisColors', 'Gizmos 坐标轴配色', 'DemoDasGizmosAxisColors', 'DasGizmosOperateTool'),
    ]),
  ]),
  group('layer', '图层与可视化', [
    group('layer-management', '图层管理与显示', [
      example('layerControl', '图层列表与批量控制', 'DemoLayerControl', 'DasGroupLayer'),
      example('innerLayer', '内部图层', 'DemoDasInnerLayer', 'DasInnerLayer'),
      example('groupInnerLayer', '内部图层组', 'DemoDasGroupInnerLayer', 'DasGroupInnerLayer'),
      example('customLayer', '自定义图层', 'DemoDasCustomLayer', 'DasCustomLayer'),
      example('showModel', '模型显示模式', 'DemoShowModel', 'ShowModel'),
    ]),
    group('billboards', '标牌与标注', [
      example('billboardLayer', '场景标牌（Widget Billboard）', 'DemoDasWidgetBillboardLayer', 'DasWidgetBillboardLayer'),
      example('uiBillboardLayer', '屏幕标牌（UI Billboard）', 'DemoDasUIBillboardLayer', 'DasUIBillboardLayer'),
    ]),
    group('compare-clip', '卷帘对比与裁剪', [
      example('rollerBlindTool', '模型卷帘对比', 'DemoDasToolRollerBlind', 'DasToolRollerBlind'),
      example('innerLayerRollerBlind', '内部图层卷帘对比', 'DemoDasInnerLayerRollerBlind', 'DasToolRollerBlind'),
      example('clipPlanes', '裁剪平面', 'DemoDasClipPlanes', 'DasClipPlanes'),
    ]),
  ]),
  group('app', '影像与应用', [
    group('capture', '场景截图', [
      example('screenshot', '3D Tiles 分块截图', 'DemoDasScreenshot', 'ScreenShotTileset'),
      example('screenshotLegacy', '场景截图（原接口）', 'DemoDasScreenshotLegacy', 'Scene'),
    ]),
    group('media-views', '视频与子视口', [
      example('videoCompositeLayer', '视频合成图层', 'DemoDasVideoComposite', 'DasVideoCompositeLayer'),
      example('loadModelSubView', '模型子视口', 'DemoDasLoadModelSubView', 'DasLoadModelSubView'),
    ]),
    example('closeElectronApp', '关闭 Electron 应用', 'DemoDasElectron', 'DasElectron'),
  ]),
]
