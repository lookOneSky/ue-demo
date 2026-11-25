interface GizmosTransform {
  translation: number[]
  rotation: number[]
  scale3D: number[]
}

export const DasGizmosOperateTool: {
  className: string
  OperateType: { NoTransform: 0; Translation: 1; Rotation: 2; Scale: 3 }
  AxisType: { X: 0; Y: 1; Z: 2 }
  setOperateLayer(layer: { id: string; class: string }, saveLast?: boolean): Promise<boolean>
  setTransform(transform: GizmosTransform): Promise<boolean>
  setOperateType(type: number): Promise<boolean>
  setRotateDegreeOnePixel(value: number): Promise<boolean>
  autoRotate(): Promise<boolean>
  recoverOperate(): Promise<boolean>
  setAxisColor(axis: number, color: number[]): Promise<boolean>
  getAxisColor(axis: number): Promise<number[]>
  addCallBack(callback: (event: { transform?: Partial<GizmosTransform> }) => void): void
  removeCallBack(): void
}
