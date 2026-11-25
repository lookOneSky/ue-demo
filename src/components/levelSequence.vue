<script setup lang="ts">
import { ref } from 'vue'
import { LevelSequenceControl } from './lib/Scene/LevelSequenceControl.js'; // 导入序列控制

// LevelSequenceControl功能测试
const sequencePath = ref("/Game/C_WDS/WDS_Video/Z_Video_S/WDS_Z_LHJD.WDS_Z_LHJD");

// 序列路径选项列表
const sequenceOptions = ref([
  {
    value: "/Game/C_WDS/WDS_Video/Z_Video_S/WDS_Z_LHJD.WDS_Z_LHJD",
    label: "🎬 Z_LHJD 序列"
  },
  {
    value: "/Game/C_WDS/WDS_Video/SD_Video/North_ShenDao_Sequence.North_ShenDao_Sequence",
    label: "🎭 North_ShenDao 序列"
  }
  ,
  {
    value: "/Game/C_WDS/WDS_Video/Z_Video_S/WDS_Z_72C.WDS_Z_72C",
    label: "🎭 72峰 序列"
  },
  {
    value: "/Game/C_WDS/WDS_Video/Z_Video_S/WDS_SD_Dong.WDS_SD_Dong",
    label: "🎭 东 序列"
  }
]);
const playbackStatus = ref({
  state: "unknown",
  currentTime: 0,
  duration: 0,
});

// 设置序列
const handleSetSequence = async () => {
  const result = await LevelSequenceControl.setSequence(sequencePath.value);
  console.log('设置序列结果:', result);
};

// 播放序列
const handlePlaySequence = async () => {
  const result = await LevelSequenceControl.playSequence(true);
  console.log('播放序列结果:', result);
};

// 暂停序列
const handlePauseSequence = async () => {
  const result = await LevelSequenceControl.pauseSequence();
  console.log('暂停序列结果:', result);
};

// 继续播放序列
const handleResumeSequence = async () => {
  const result = await LevelSequenceControl.resumeSequence();
  console.log('继续播放序列结果:', result);
};

// 停止序列
const handleStopSequence = async () => {
  const result = await LevelSequenceControl.stopSequence();
  console.log('停止序列结果:', result);
};

// 获取序列状态
const handleGetStatus = async () => {
  playbackStatus.value = await LevelSequenceControl.getStatus();
  console.log('序列状态:', playbackStatus.value);
};
</script>

<template>
  <div>
    <div class="title">序列控制</div>
    <div class="split_line"></div>
    
    <el-form-item label="序列选择" class="ruihua">
      <el-select 
        v-model="sequencePath" 
        placeholder="请选择序列"
        style="width: 350px; margin-left: 15px;">
        <el-option 
          v-for="option in sequenceOptions" 
          :key="option.value" 
          :value="option.value" 
          :label="option.label">
        </el-option>
      </el-select>
    </el-form-item>

    <div style="display: flex; flex-wrap: wrap; margin-left: 15px;">
      <el-button @click="handleSetSequence" style="margin: 10px;">设置序列</el-button>
      <el-button type="success" @click="handlePlaySequence" style="margin: 10px;">播放序列</el-button>
      <el-button type="warning" @click="handlePauseSequence" style="margin: 10px;">暂停序列</el-button>
      <el-button type="info" @click="handleResumeSequence" style="margin: 10px;">继续播放</el-button>
      <el-button type="danger" @click="handleStopSequence" style="margin: 10px;">停止序列</el-button>
      <el-button @click="handleGetStatus" style="margin: 10px;">获取状态</el-button>
    </div>

    <!-- 当前选择的序列信息 -->
    <div class="current-sequence" style="margin: 10px; padding: 10px; background: rgba(225, 187, 130, 0.05); border-radius: 5px; border: 1px solid rgba(225, 187, 130, 0.2);">
      <h4 style="color: #e1bb82; margin: 0 0 8px 0;">📋 当前序列</h4>
      <p style="color: #ffffff; margin: 4px 0; font-size: 13px; word-break: break-all;">
        <span style="color: #e1bb82;">名称:</span> {{ sequenceOptions.find(opt => opt.value === sequencePath)?.label || '未选择' }}
      </p>
      <p style="color: #ffffff; margin: 4px 0; font-size: 12px; word-break: break-all;">
        <span style="color: #e1bb82;">路径:</span> {{ sequencePath }}
      </p>
    </div>

    <!-- 播放状态信息 -->
    <div class="sequence-status" style="margin: 10px; padding: 10px; background: rgba(225, 187, 130, 0.1); border-radius: 5px;">
      <h4 style="color: #e1bb82; margin: 0 0 8px 0;">▶️ 播放状态</h4>
      <p style="color: #e1bb82; margin: 4px 0;">状态: <span style="color: #ffffff;">{{ playbackStatus.state }}</span></p>
      <p style="color: #e1bb82; margin: 4px 0;">当前时间: <span style="color: #ffffff;">{{ playbackStatus.currentTime.toFixed(2) }}秒</span></p>
      <p style="color: #e1bb82; margin: 4px 0;">总时长: <span style="color: #ffffff;">{{ playbackStatus.duration.toFixed(2) }}秒</span></p>
      <div style="margin-top: 8px;">
        <div style="background: rgba(255, 255, 255, 0.1); height: 4px; border-radius: 2px; overflow: hidden;">
          <div 
            style="background: #e1bb82; height: 100%; transition: width 0.3s ease;"
            :style="{ width: playbackStatus.duration > 0 ? (playbackStatus.currentTime / playbackStatus.duration * 100) + '%' : '0%' }">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
