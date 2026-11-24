export interface CatalogNode {
  id: string
  name: string
  children?: CatalogNode[]
  file?: string
  owner?: string
}

function example(id: string, name: string, file: string, owner: string): CatalogNode {
  return { id, name, file, owner }
}

export const demoCatalog: CatalogNode[] = [
  {
    id: "scene", name: "场景",
    children: [
      {
        id: "operator", name: "操作器",
        children: [
          example("camera-universal", "通用操作器", "DemoCamera", "Camera"),
          example("camera-freeflight", "第一人称操作器", "DemoDasFreeFlightCamera", "DasFreeFlightCamera"),
          example("camera-setting", "操作器切换", "DemoCameraSetting", "Scene"),
          example("camera-operator-setting", "通用操作器设置", "DemoCameraOperatorSetting", "Camera"),
          example("camera-fly-to-target", "目标点屏幕偏移飞行", "DemoCameraFlyToTarget", "Camera"),
        ],
      },
      example("sceneControl", "场景控制", "SceneDemo", "Scene"),
      example("levelSequence", "序列控制", "levelSequence", "LevelSequenceControl"),
      example("weather", "天气设置", "weatherDemo", "Weather"),
      example("screenshot", "3DTiles分块截图", "DemoDasScreenshot", "ScreenShotTileset"),
      example("screenshotLegacy", "场景截图（原接口）", "DemoDasScreenshotLegacy", "Scene"),
      example("showModel", "模型显示模式", "DemoShowModel", "ShowModel"),
      example("informerShape", "区域感应Shape", "DemoDasInformerShape", "DasInformerShape"),
      example("setOrigin", "场景原点设置", "DemoDasSetOrigin", "Scene"),
      example("kezierTileset", "克孜尔场景加载", "DemoDasKezierTileset", "DasModelTilesetLayer"),
      example("watchGuideLine", "引导路线", "DemoWatchGuideLine", "WatchGuideLine"),
      example("thirdPersonCamera", "人物换装", "DemoDasThirdPersonCamera", "ThirdPersonCamera"),
      example("heightQuery", "高度查询", "DemoDasHeight", "Scene"),
      example("clipPlanes", "裁剪平面控制", "DemoDasClipPlanes", "DasClipPlanes"),
    ],
  },
  {
    id: "tool", name: "工具",
    children: [
      example("pointsTool", "点工具", "DasPointsToolDemo", "DasPointsTool"),
      example("selectTool", "选择工具", "DasSelectToolDemo", "DasSelectTool"),
      example("selectFitPolygonTool", "立面多边形选择", "DemoDasToolSelectFitPolygon", "DasToolSelectFitPolygon"),
      example("gizmosTool", "Gizmos变换工具", "DemoDasGizmosTool", "DasGizmosOperateTool"),
      example("rollerBlindTool", "卷帘对比工具", "DemoDasToolRollerBlind", "DasToolRollerBlind"),
      example("innerLayerRollerBlind", "Inner图层卷帘对比", "DemoDasInnerLayerRollerBlind", "DasToolRollerBlind"),
      example("compass", "指北针控制", "DemoDasCompass", "DasCompass"),
      example("splineWalk", "样条行走", "DemoDasSplineWalk", "DasSplineWalk"),
      example("spotLightTool", "聚光灯工具", "DemoDasToolSpotLight", "DasToolSpotLight"),
      example("measurementPoint", "点位测量", "DemoDasMeasurementPoint", "DasToolMeasurementPoint"),
      example("measurementDistance", "距离测量", "DemoDasMeasurementDistance", "DasToolMeasurementDistance"),
      example("measurementDistanceSurface", "表面距离测量", "DemoDasMeasurementDistanceSurface", "DasToolMeasurementDistanceSurface"),
      example("measurementArea", "面积测量", "DemoDasMeasurementArea", "DasToolMeasurementArea"),
      example("measurementAngle", "角度测量", "DemoDasMeasurementAngle", "DasToolMeasurementAngle"),
      example("caveCameraLook", "洞窟内相机定位", "DemoCaveCameraLook", "DasUtilsCalCircleLook · Camera"),
    ],
  },
  {
    id: "layer", name: "图层",
    children: [
      example("billboardLayer", "Billboard图层", "DemoDasWidgetBillboardLayer", "DasWidgetBillboardLayer"),
      example("uiBillboardLayer", "UI Billboard图层", "DemoDasUIBillboardLayer", "DasUIBillboardLayer"),
      example("polylineLayer", "多段线图层", "DemoDasPolylineLayer", "DasPolylineLayer"),
      example("innerLayer", "内部图层", "DemoDasInnerLayer", "DasInnerLayer"),
      example("groupInnerLayer", "组内部图层", "DemoDasGroupInnerLayer", "DasGroupInnerLayer"),
      example("cameraRoamingLayer", "相机漫游图层", "DemoDasCameraRoamingLayer", "DasCameraRoamingLayer"),
      example("cameraRoamingCircleLayer", "相机环绕图层", "DemoDasCameraRoamingCircleLayer", "DasCameraRoamingCircleLayer"),
      example("videoCompositeLayer", "视频合成图层", "DemoDasVideoComposite", "DasVideoCompositeLayer"),
      example("carLayer", "车辆图层", "DemoDasCarLayer", "DasCarLayer"),
      example("splineLayer", "样条线图层", "DemoDasSplineLayer", "DasSpline"),
      example("decalLayer", "贴花图层", "DemoDasDecalLayer", "DasDecalLayer"),
      example("layerControl", "图层控制", "DemoLayerControl", "DasGroupLayer"),
      example("loadModelSubView", "模型加载子视口图层", "DemoDasLoadModelSubView", "DasLoadModelSubView"),
      example("lightLayer", "灯光图层", "DemoDasLightLayer", "DasLightPointLayer · DasLightTorchLayer"),
      example("customLayer", "自定义图层", "DemoDasCustomLayer", "DasCustomLayer"),
      example("polygonLayer", "多边形图层", "DemoDasPolygonLayer", "DasPolygonLayer"),
      example("fitLookPolygonLayer", "立面多边形图层", "DemoDasFitLookPolygonLayer", "DasFitLookPolygonLayer"),
      example("fitEarthPolygonLayer", "贴地多边形图层", "DemoDasFitEarthPolygonLayer", "DasFitEarthPolygonLayer"),
      example("fitEarthPolylineLayer", "贴地折线图层", "DemoDasFitEarthPolylineLayer", "DasFitEarthPolylineLayer"),
    ],
  },
  {
    id: "app", name: "应用",
    children: [
      example("closeElectronApp", "关闭Electron应用", "DemoDasElectron", "DasElectron"),
    ],
  },
]
