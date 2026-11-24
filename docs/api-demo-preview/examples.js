(() => {
  const stringLiteral = value => JSON.stringify(String(value ?? ''));
  const numberLiteral = value => {
    const number = Number(value);
    return value !== '' && Number.isFinite(number) ? String(number) : 'undefined';
  };
  const coordinates = () => [
    { key: 'longitude', label: '经度', value: 116.39, type: 'number', unit: '°', min: -180, max: 180, step: 'any' },
    { key: 'latitude', label: '纬度', value: 39.91, type: 'number', unit: '°', min: -90, max: 90, step: 'any' }
  ];
  const duration = () => ({
    key: 'duration', label: '飞行时间', value: 5, type: 'number', unit: 's', min: 0.1, max: 60, step: 0.1
  });
  const booleanResult = () => '模拟返回\ntrue';

  window.demoExamples = [
    {
      id: 'camera', group: '场景', nav: '通用操作器', title: '相机控制', owner: 'Camera',
      description: '控制三维场景中的相机位置、观察方向与飞行时间。',
      methods: [
        {
          label: '飞行到点位', method: 'flyToCameraPositionByName',
          description: '通过预设点位名称，让相机在指定时间内飞行到目标视角。',
          fields: [
            { key: 'positionName', label: '点位名称', value: '相机点位1', type: 'text' },
            duration()
          ],
          code: v => `const arrived = await Camera.flyToCameraPositionByName(\n  ${stringLiteral(v.positionName)},\n  ${numberLiteral(v.duration)}\n);`,
          result: booleanResult
        },
        {
          label: '读取相机信息', method: 'getCameraFlyInfoLLH',
          description: '读取当前位置的经度、纬度、高度，以及相机的俯仰角、偏航角和滚转角。',
          fields: [],
          code: () => 'const view = await Camera.getCameraFlyInfoLLH();\nconst { locationLLH, rotationLLH } = view;',
          result: () => '模拟返回\n{\n  "locationLLH": [116.39, 39.91, 120],\n  "rotationLLH": { "pitch": -30, "yaw": 0, "roll": 0 }\n}'
        },
        {
          label: '经纬度飞行', method: 'flyToLocationLongLat',
          description: '根据地形高度飞向指定经纬度，并设置到达时的相机朝向。',
          fields: [
            ...coordinates(),
            { key: 'rotationYaw', label: '偏航角', value: 0, type: 'number', unit: '°', min: -360, max: 360, step: 1 },
            { key: 'rotationPitch', label: '俯仰角', value: -30, type: 'number', unit: '°', min: -90, max: 90, step: 1 },
            duration(),
            { key: 'addHeightScale', label: '飞行高度系数', value: 1, type: 'number', min: 0, step: 0.1 }
          ],
          code: v => `const arrived = await Camera.flyToLocationLongLat(\n  ${numberLiteral(v.longitude)}, ${numberLiteral(v.latitude)},\n  ${numberLiteral(v.rotationYaw)}, ${numberLiteral(v.rotationPitch)},\n  ${numberLiteral(v.duration)}, ${numberLiteral(v.addHeightScale)}\n);`,
          result: booleanResult
        }
      ]
    },
    {
      id: 'scene', group: '场景', nav: '场景控制', title: '场景控制', owner: 'Scene',
      description: '管理当前三维场景中加载的关卡。',
      methods: [{
        label: '加载关卡', method: 'loadLevel', description: '按关卡名称发起加载请求，并使关卡在加载完成后可见。',
        fields: [{ key: 'levelName', label: '关卡名称', value: 'YuXuGong', type: 'select', options: ['YuXuGong', 'YuZhenGong', 'WholeMoutain'] }],
        code: v => `const requested = await Scene.loadLevel(\n  ${stringLiteral(v.levelName)}, true\n);`,
        result: booleanResult
      }]
    },
    {
      id: 'weather', group: '场景', nav: '天气设置', title: '天气设置', owner: 'Weather',
      description: '调整场景中的天气与光照。',
      methods: [{
        label: '设置天气', method: 'SetWeatherType', description: '使用天气名称切换场景中的天气效果。',
        fields: [{ key: 'weatherType', label: '天气类型', value: '晴', type: 'select', options: ['晴', '多云', '雾', '雨', '雪', '雷雨'] }],
        code: v => `const weatherType = ${stringLiteral(v.weatherType)};\nawait Weather.SetWeatherType(weatherType);`,
        result: () => '模拟返回\nundefined'
      }]
    },
    {
      id: 'height', group: '场景', nav: '高度查询', title: '高度查询', owner: 'Scene',
      description: '根据经纬度查询场景中单点的地形高度。',
      methods: [{
        label: '查询高度', method: 'getHeightAtLongLat', description: '输入经纬度，读取高度值以及查询是否成功。',
        fields: coordinates(),
        code: v => `const elevation = await Scene.getHeightAtLongLat(\n  ${numberLiteral(v.longitude)}, ${numberLiteral(v.latitude)}\n);`,
        result: () => '模拟返回\n{ "height": 48.5, "success": true }'
      }]
    },
    {
      id: 'distance', group: '工具', nav: '距离测量', title: '距离测量', owner: 'DasToolMeasurementDistance',
      description: '在三维场景内拾取多个点，沿折线测量空间距离。',
      methods: [{
        label: '激活测量', method: 'setToCurrent', description: '激活后单击场景添加测量点，双击结束本次测量。',
        fields: [],
        code: () => 'const tool = new DasToolMeasurementDistance();\nawait tool.setToCurrent(() => {\n  console.log("距离测量已激活");\n});',
        result: () => '模拟回调输出\n距离测量已激活'
      }]
    },
    {
      id: 'polyline', group: '图层', nav: '多段线图层', title: '多段线图层', owner: 'DasPolylineLayer',
      description: '使用经纬度和高度坐标创建三维多段线。',
      methods: [{
        label: '创建图层', method: 'createInstance', description: '连接两个示例坐标，并设置线条的粗细。',
        fields: [{ key: 'thickness', label: '线条粗细', value: 3, type: 'number', min: 0.1, step: 0.1 }],
        code: v => `const points = [[116.39, 39.91, 50], [116.4, 39.92, 50]];\nconst layer = await DasPolylineLayer.createInstance({\n  param: { points, thickness: ${numberLiteral(v.thickness)} }\n});\nconst layerId = layer?.id;`,
        result: () => '模拟图层实例\n{ id: "preview-line-01", className: "DasPolylineLayer" }'
      }]
    },
    {
      id: 'electron', group: '应用', nav: '关闭 Electron 应用', title: '关闭 Electron 应用', owner: 'DasElectron',
      description: '通过桌面应用的桥接接口向 Electron 发送关闭请求。',
      methods: [{
        label: '关闭应用', method: 'closeElectronApp', description: '在 Electron 桌面环境中调用，当前预览仅演示请求。',
        fields: [],
        code: () => '// 在 Electron 桌面环境中执行\nDasElectron.closeElectronApp();',
        result: () => '模拟返回\nundefined'
      }]
    }
  ];
})();
