<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import Scene from './lib/Scene/Scene.js'
import { onUEEvent, requestUE } from '../utils/demoRpc.js'
import { DasPointsLayer } from './lib/Layer/DasPointsLayer.js'

// 单点查询
const longitude = ref(116.39)
const latitude = ref(39.91)
const singleLoading = ref(false)
const singleResult = ref<{ height: number; success: boolean } | null>(null)

const handleGetHeight = async () => {
  singleLoading.value = true
  singleResult.value = null
  try {
    singleResult.value = await Scene.getHeightAtLongLat(longitude.value, latitude.value)
  } catch {
    singleResult.value = { success: false, height: 0 }
  } finally {
    singleLoading.value = false
  }
}

// 多点查询
interface PointItem {
  name: string
  longitude: number
  latitude: number
  altitude: number
  o2Number: number
  checkDate: string
  isPeak?: boolean
  cameraNear?: {
    locationLLH: number[]
    rotationLLH: { pitch: number; yaw: number; roll: number }
  }
  height: number | null
  success: boolean | null
  [key: string]: any
}

const points = ref<PointItem[]>([
  { name: '清音阁', longitude: 103.386337, latitude: 29.561462, altitude: 1030.689, o2Number: 13760, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '一线天', longitude: 103.383563, latitude: 29.559797, altitude: 1102.363, o2Number: 35920, isPeak: true, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '猴区管理站', longitude: 103.385782, latitude: 29.563128, altitude: 940.744, o2Number: 10721, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '生态猴区', longitude: 103.386337, latitude: 29.565627, altitude: 871.923, o2Number: 12950, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '二道桥', longitude: 103.386892, latitude: 29.562572, altitude: 916.808, o2Number: 12357, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '万渡桥', longitude: 103.38384, latitude: 29.558964, altitude: 1052.197, o2Number: 10660, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '洞天首步', longitude: 103.382731, latitude: 29.557854, altitude: 1033.258, o2Number: 9308, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '洪椿坪', longitude: 103.383286, latitude: 29.558409, altitude: 1060.755, o2Number: 14580, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '赖子坡', longitude: 103.36942, latitude: 29.553146, altitude: 1409.516, o2Number: 10526, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '天池峰', longitude: 103.372747, latitude: 29.55342, altitude: 1199.396, o2Number: 15173, isPeak: true, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '扁担崖', longitude: 103.369975, latitude: 29.553146, altitude: 1338.218, o2Number: 9416, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '寿星桥', longitude: 103.366925, latitude: 29.552594, altitude: 1549.426, o2Number: 18426, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '茶棚子', longitude: 103.361381, latitude: 29.552879, altitude: 1554.737, o2Number: 7260, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '仙峰寺', longitude: 103.357778, latitude: 29.553995, altitude: 1475.081, o2Number: 7140, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '九老洞', longitude: 103.355838, latitude: 29.554554, altitude: 1523.784, o2Number: 7040, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '龙桥', longitude: 103.350019, latitude: 29.554841, altitude: 1946.481, o2Number: 7580, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '长寿桥', longitude: 103.348357, latitude: 29.562063, altitude: 1765.314, o2Number: 10796, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '遇仙寺', longitude: 103.351404, latitude: 29.564002, altitude: 1802.628, o2Number: 6401, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '华严顶', longitude: 103.350019, latitude: 29.562893, altitude: 1822.966, o2Number: 5208, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '九岭岗', longitude: 103.348356, latitude: 29.565395, altitude: 1684.835, o2Number: 5560, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '莲花寺', longitude: 103.344755, latitude: 29.565679, altitude: 1691.512, o2Number: 5236, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '钻天坡', longitude: 103.342815, latitude: 29.563739, altitude: 1721.727, o2Number: 6180, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '伴岩花雨亭', longitude: 103.34143, latitude: 29.562631, altitude: 1761.875, o2Number: 4860, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '洗象池', longitude: 103.341984, latitude: 29.561241, altitude: 1846.977, o2Number: 6545, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '大成寺', longitude: 103.343093, latitude: 29.563183, altitude: 1743.237, o2Number: 5120, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '白云亭', longitude: 103.33312, latitude: 29.54904, altitude: 2300.522, o2Number: 10480, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '雷洞坪', longitude: 103.33432, latitude: 29.53936, altitude: 2201.355, o2Number: 13046, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '伏虎寺', longitude: 103.431889, latitude: 29.567034, altitude: 685.249, o2Number: 6360, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '报国寺', longitude: 103.447745, latitude: 29.577058, altitude: 496.256, o2Number: 3334, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '雷音寺', longitude: 103.423548, latitude: 29.567301, altitude: 778.548, o2Number: 13308, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '纯阳殿', longitude: 103.417156, latitude: 29.571738, altitude: 834.706, o2Number: 13154, isPeak: true, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '神水阁', longitude: 103.394384, latitude: 29.582562, altitude: 858.976, o2Number: 4744, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '中峰寺', longitude: 103.457766, latitude: 29.582634, altitude: 479.609, o2Number: 4110, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '万年寺（石笋沟）', longitude: 103.380511, latitude: 29.58368, altitude: 951.793, o2Number: 33026, isPeak: true, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '息心所', longitude: 103.333951, latitude: 29.547095, altitude: 2412.773, o2Number: 6068, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '长老坪', longitude: 103.608578, latitude: 29.957319, altitude: 733.384, o2Number: 2860, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '华严顶', longitude: 103.358833, latitude: 29.561226, altitude: 1596.684, o2Number: 5208, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '金顶', longitude: 103.339527, latitude: 29.520275, altitude: 2419.708, o2Number: 44632, isPeak: true, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
  { name: '万佛顶', longitude: 103.334351, latitude: 29.507177, altitude: 2451.025, o2Number: 42155, isPeak: true, checkDate: '2026/5/27', cameraNear: { locationLLH: [103.42934370252047, 29.608867887972096, 3714.7139622330837], rotationLLH: { pitch: -39.23746124492647, yaw: 125.29822079734909, roll: 0.0006409911677047653 } }, height: null, success: null },
])

const batchLoading = ref(false)
const batchDone = ref(false)
const batchError = ref('')
const currentLayer = ref<any>(null)
const layerLoading = ref(false)

let unsubscribe: (() => void) | null = null

const handleBatchQuery = async () => {
  batchLoading.value = true
  batchDone.value = false
  batchError.value = ''
  currentLayer.value = null
  points.value.forEach(p => { p.height = null; p.success = null })

  if (unsubscribe) { unsubscribe(); unsubscribe = null }

  unsubscribe = onUEEvent(Scene.className, 'pointsHeightResult', data => {
    if (!Array.isArray(data.points)) return
    const EPS = 1e-6
    data.points.forEach(item => {
      const p = points.value.find(p =>
        Math.abs(p.longitude - item.longitude) < EPS &&
        Math.abs(p.latitude - item.latitude) < EPS
      )
      if (p) {
        p.height = Number.isFinite(item.height) ? item.height : null
        p.success = item.success === true && p.height !== null
      }
    })
    batchLoading.value = false
    batchDone.value = true
    if (unsubscribe) { unsubscribe(); unsubscribe = null }
  })

  try {
    await requestUE(Scene.className, 'getPointsHeightAsync', {
      points: points.value.map(p => ({ longitude: p.longitude, latitude: p.latitude })),
    })
  } catch (error) {
    unsubscribe?.()
    unsubscribe = null
    batchLoading.value = false
    batchError.value = error instanceof Error ? error.message : String(error)
  }
}

const createPointsLayer = async () => {
  layerLoading.value = true
  const pts = points.value
    .filter(p => p.success === true && p.height !== null)
    .map(p => [p.longitude, p.latitude, p.height as number])
  try {
    currentLayer.value = await DasPointsLayer.createInstance({ param: { points: pts } })
  } finally {
    layerLoading.value = false
  }
}

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <div class="height-demo">
    <div class="title">高度查询</div>

    <!-- 单点查询 -->
    <div class="section">
      <div class="section-title">单点高度查询</div>
      <div class="row">
        <span class="label">经度</span>
        <el-input-number v-model="longitude" :precision="6" :step="0.01" size="small" />
      </div>
      <div class="row">
        <span class="label">纬度</span>
        <el-input-number v-model="latitude" :precision="6" :step="0.01" size="small" />
      </div>
      <el-button class="btn" :loading="singleLoading" @click="handleGetHeight">获取高度</el-button>
      <div v-if="singleResult" class="result">
        <span v-if="singleResult.success" class="success">高度：{{ singleResult.height.toFixed(3) }} 米</span>
        <span v-else class="fail">查询失败</span>
      </div>
    </div>

    <!-- 多点查询 -->
    <div class="section">
      <div class="section-title">多点高度查询（异步）</div>
      <table class="point-table">
        <thead>
          <tr><th>名称</th><th>经度</th><th>纬度</th><th>高度 (m)</th><th>状态</th></tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in points" :key="i">
            <td>{{ p.name }}</td>
            <td>{{ p.longitude }}</td>
            <td>{{ p.latitude }}</td>
            <td>{{ p.height !== null ? p.height.toFixed(3) : '-' }}</td>
            <td>
              <span v-if="p.success === null">-</span>
              <span v-else-if="p.success" class="success">✓</span>
              <span v-else class="fail">✗</span>
            </td>
          </tr>
        </tbody>
      </table>
      <el-button class="btn" :loading="batchLoading" @click="handleBatchQuery">批量查询</el-button>
      <p v-if="batchError" class="fail" role="status">{{ batchError }}</p>
      <el-button v-if="batchDone" class="btn" :disabled="!points.some(point => point.success)" :loading="layerLoading" @click="createPointsLayer">创建图层</el-button>
      <div v-if="batchDone" class="result">
        <span v-if="currentLayer" class="success">图层已创建：{{ currentLayer.id }}</span>
        <span v-else class="success">查询完成</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.height-demo {
  padding: 16px;
  color: #e1bb82;

  .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e1bb82;
  }

  .section {
    margin-bottom: 24px;

    .section-title {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 10px;
      opacity: 0.8;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .label {
        width: 40px;
        font-size: 13px;
      }
    }

    .btn {
      margin-top: 10px;
      margin-right: 8px;
      background: transparent;
      border-color: #e1bb82;
      color: #e1bb82;

      &:hover { background: rgba(225, 187, 130, 0.15); }
    }

    .result {
      margin-top: 10px;
      font-size: 13px;

      .success { color: #67c23a; }
      .fail { color: #f56c6c; }
    }

    .point-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;

      th, td {
        border: 1px solid rgba(225, 187, 130, 0.3);
        padding: 6px 10px;
        text-align: center;
      }

      th { background: rgba(225, 187, 130, 0.1); }

      .success { color: #67c23a; }
      .fail { color: #f56c6c; }
    }
  }
}
</style>
