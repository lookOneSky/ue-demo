<script setup lang="ts">
const emit = defineEmits(['close']);
const props = defineProps({
    detailInfo: {
        type: Object,
        default: () => {},
    }
});
</script>

<template>
    <div class="detail_container">
        <div class="bg-filter"></div>
        <div class="close"><img src="/src/assets/images/detail_close.png" @click="emit('close')" /></div>
        <div class="line">
            <div class="title">{{ detailInfo.name }}</div>
            <!-- <div class="audio"></div> -->
            <div class="content">
                <div v-if="detailInfo.video" class="content-video">
                    <video :src="detailInfo.video" controls autoplay style="width: 100%; height: 100%;"></video>
                </div>
                <div v-else-if="detailInfo.cover" class="content-img">
                    <el-image :src="detailInfo.cover" :preview-src-list="[detailInfo.cover]" fit="contain" />
                </div>
                <div class="content-text">{{ detailInfo.description }}</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.detail_container {
    position: absolute;
    width: 70%;
    height: 65%;
    top: 15%;
    left: 15%;
    background: rgba(33, 32, 29, 0.5);
    border-image-source: linear-gradient(148.68deg, #E1BB82 0%, rgba(225, 187, 130, 0) 100%);
    // backdrop-filter: blur(16px);
    z-index: 9999;
    .bg-filter {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        backdrop-filter: blur(16px);
        background-image: url(/src/assets/images/detail_back.png);
        background-repeat: no-repeat;
        background-size: 98.5% 97%;
        background-position: 50% 50%;
        z-index: -1;
    }
    .line {
        width: calc(100% - 10px);
        height: calc(100% - 10px);
        margin-left: 4px;
        margin-top: 4px;
        border: 1px solid rgba(225, 187, 130, 0.5);

        .title {
            font-family: Source Han Serif CN;
            font-size: 32px;
            font-weight: 500;
            line-height: 38.4px;
            height: 70px;
            margin-top: 25px;
            text-align: center;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            color: #FFE6A7;
            background-image: url(/src/assets/images/title_back.png);
            background-repeat: no-repeat;
            background-size: 25%;
            background-position: 50% 100%;
        }

        .audio {
            margin-left: 100px;
            margin-right: 100px;
            width: calc(100% - 210px);
            height: 26px;
            margin-top: 20px;
            background-image: url(/src/assets/images/audio.png);
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }

        .content {
            margin: 50px 100px 10px 100px;
            width: calc(100% - 210px);
            height: calc(100% - 160px);
            font-family: Source Han Serif CN;
            font-size: 14px;
            font-weight: 500;
            line-height: 31.92px;
            letter-spacing: 0.52em;
            text-align: left;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            color: #FFE6A7;
            display: flex;
            align-items: flex-start;
            .content-video {
                width: 500px;
                margin-right: 55px;
            }
            .content-img {
                width: 350px;
                max-height: 90%;
                margin-right: 55px;
                overflow: hidden;
                :deep(.el-image) {
                    .el-image-viewer__mask {
                        opacity: 0.8;
                    }
                }
            }
            .content-text {
                margin-top: 40px;
                flex: 1;
            }
        }
    }

    .close {
        position: absolute;
        cursor: pointer;
        right: -30px;

        img {
            width: 30px;
        }
    }
}
</style>
