export interface ScreenShotTilesetStartResult {
    bStarted: boolean;
    bCapturing: boolean;
}

export interface ScreenShotTilesetProgress {
    progress: number;
    percent?: number;
    finishedTileCount: number;
    totalTileCount: number;
    currentTileLoadProgress: number;
}

export interface ScreenShotTilesetStatus extends Omit<ScreenShotTilesetProgress, "percent"> {
    bCapturing: boolean;
}

declare class ScreenShotTileset {
    static className: string;

    static takeScreenshot(
        savePath?: string,
        resolutionMultiplier?: number,
        tilesetMaxSSE?: number,
        minTileCount?: number
    ): Promise<ScreenShotTilesetStartResult>;

    static cancelScreenshot(): Promise<boolean>;

    static isCapturing(): Promise<ScreenShotTilesetStatus>;

    static onMessage(message: string, callback: (data: unknown) => void): () => void;

    static onScreenshotProgress(callback: (data: ScreenShotTilesetProgress) => void): () => void;

    static onScreenshotCompleted(callback: () => void): () => void;
}

export { ScreenShotTileset };
