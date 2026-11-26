<script setup lang="ts">
import { ref } from 'vue'
import { LevelSequenceControl } from '../utils/sequencePlayback'; // 导入序列控制

defineProps<{ msg?: string }>()
const form1 = ref({ one: false, two: false, three: false, });

const handleEffectOneChange = (value: boolean) => {
    console.log('Effect one changed to:', value);
    // TODO: 添加实际逻辑
}
const handleEffectTwoChange = (value: boolean) => {
    console.log('Effect two changed to:', value);
    // TODO: 添加实际逻辑
}
const handleEffectThreeChange = (value: boolean) => {
    console.log('Effect three changed to:', value);
    // TODO: 添加实际逻辑
}

// LevelSequenceControl功能测试
const sequencePath = "/Game/C_WDS/WDS_Video/Z_Video/Z_Video_A1.Z_Video_A1";
const playbackStatus = ref({
  state: "unknown",
  currentTime: 0,
  duration: 0
});

// 设置序列
const handleSetSequence = async () => {
  const result = await LevelSequenceControl.setSequence(sequencePath);
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
    <div class="effect_container">
        <div class="title">
            空间特效
        </div>
        <div class="split_line">
        </div>
        <el-form ref="form" :model="form1" label-width="280px">
            <el-form-item label="效果一">
                <el-switch v-model="form1.one" @change="handleEffectOneChange" active-text="ON" inactive-text="OFF" style="margin-left: 55px;"
                    active-color="#E1BB82"></el-switch>
            </el-form-item>
            <el-form-item label="效果二">
                <el-switch v-model="form1.two" @change="handleEffectTwoChange" active-text="ON" inactive-text="OFF" style="margin-left: 55px;"
                    active-color="#E1BB82"></el-switch>
            </el-form-item>
            <el-form-item label="效果三">
                <el-switch v-model="form1.three" @change="handleEffectThreeChange" active-text="ON" inactive-text="OFF" style="margin-left: 55px;"
                    active-color="#E1BB82"></el-switch>
            </el-form-item>
        </el-form>

        <div class="title" style="margin-top: 20px;">序列控制</div>
        <div class="split_line"></div>

        <el-button @click="handleSetSequence" style="margin: 10px;">设置序列</el-button>
        <el-button type="success" @click="handlePlaySequence" style="margin: 10px;">播放序列</el-button>
        <el-button type="warning" @click="handlePauseSequence" style="margin: 10px;">暂停序列</el-button>
        <el-button type="info" @click="handleResumeSequence" style="margin: 10px;">继续播放</el-button>
        <el-button type="danger" @click="handleStopSequence" style="margin: 10px;">停止序列</el-button>
        <el-button @click="handleGetStatus" style="margin: 10px;">获取状态</el-button>

        <div class="sequence-status" style="margin: 10px; padding: 10px; background: rgba(225, 187, 130, 0.1); border-radius: 5px;">
          <p style="color: #e1bb82;">状态: {{ playbackStatus.state }}</p>
          <p style="color: #e1bb82;">当前时间: {{ playbackStatus.currentTime.toFixed(2) }}秒</p>
          <p style="color: #e1bb82;">总时长: {{ playbackStatus.duration.toFixed(2) }}秒</p>
          <p style="color: #e1bb82;">进度: {{ (playbackStatus.duration > 0 ? playbackStatus.currentTime / playbackStatus.duration * 100 : 0).toFixed(2) }}%</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.effect_container {
    width: 440px;
    height: 520px;
    flex-shrink: 0;
    border-radius: 8px;
    border: 0.5px solid #E1BB82;
    background: #21201dcc;
    backdrop-filter: blur(4px);
    position: absolute;
    top: 62px;
    right: 119px;
    padding: 10px;
    z-index: 2;

    .title {
        align-self: stretch;
        color: #e1bb82;
        text-align: center;
        font-family: "Source Han Serif CN";
        font-size: 24px;
        font-style: normal;
        line-height: normal;
        letter-spacing: 9.6px;
        margin-top: 15px;
    }

    .split_line {
        background-image: url('/src/assets/images/hl.png');
        background-size: 100% 100%;
        height: 12px;
        width: 180px;
        margin: auto;
        margin-top: 15px;
        margin-bottom: 20px;
    }

    :deep(.el-form-item__label) {
        justify-content: flex-start;
        color: #ffffff;
        font-family: "Source Han Sans CN";
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 40px;
        padding-left: 15px;

    }

    :deep(.el-form-item) {
        width: 410px;
        height: 40px;
        flex-shrink: 0;
        background: #e1bb820d;
        border-radius: 3px;
        margin-left: 15px;
    }

    :deep(.el-switch__core) {
        width: 64px;
        height: 28px;
        border-radius: 20px;
        background: #e1bb8233;
        border: 0.2px solid #E1BB82;
    }

    :deep(.el-switch__action) {
        width: 20px;
        height: 20px;
    }

    :deep(.el-switch.is-checked .el-switch__core .el-switch__action) {
        left: calc(100% - 21px);
    }

    :deep(.el-switch.is-checked .el-switch__core) {
        background: #E1BB82;
        border-color: #E1BB82;
        z-index: -1;
    }

    :deep(.el-switch__label--left) {
        left: 30px;
        position: absolute;
        z-index: -2;
        color: #e1bb82;
        display: none;
    }

    :deep(.el-switch__label--right) {
        margin-left: 10px;
        position: absolute;
        z-index: -1;
        color: #5f0d0b;
        display: none;
    }

    :deep(.is-active) {
        display: block;
    }

    :deep(.ruihua .el-form-item__label) {
        width: 280px;
    }

    :deep(.el-radio-button__inner) {
        background: none;
        color: #e1bb82;
        border: none;
    }

    :deep(.el-radio-group) {
        border: 0.2px solid #E1BB82;
        border-radius: 5px;
    }

    :deep(.el-radio-button:first-child .el-radio-button__inner) {
        border: none;
    }

    :deep(.el-radio-button.is-active .el-radio-button__original-radio:not(:disabled)+.el-radio-button__inner) {
        border-radius: 4px;
        background: #E1BB82;
        color: #5f0d0b;
        box-shadow: none;
    }


    :deep(.el-slider__button) {
        width: 30px;
        height: 18px;
        border: none;
        background: none;
        border-color: inherit;
        background-image: url('/src/assets/images/slider.png');
        background-size: 100% 100%;
    }

    :deep(.el-slider__bar) {
        height: 4px;
        background: #E1BB82;
    }

    :deep(.el-slider__runway) {
        height: 4px;
        background: #e1bb8233;
    }

    :deep(.el-slider__marks-text) {
        color: #e1bb82;
        font-family: "Source Han Sans CN";
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 12px;
    }

    :deep(.el-slider__marks-text:first-child) {
        margin-left: 5px;
    }

    :deep(.sewen .el-slider__marks-text:last-child) {
        margin-left: -15px;
    }

    :deep(.sun_angle .el-slider__marks-text:last-child) {
        margin-left: -12px;
    }

    :deep(.sun_power .el-slider__marks-text:last-child) {
        margin-left: -8px;
    }

    :deep(.wu_level .el-slider__marks-text:last-child) {
        margin-left: -3px;
    }


    :deep(.el-slider__stop) {
        background: none;
    }
}
</style>
