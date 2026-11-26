import { ShowModel as SDKShowModel } from '../components/lib/Scene/ShowModel.js'
import { requestUE } from './demoRpc.js'

type ShowModelCommand = Exclude<keyof typeof SDKShowModel, 'className' | 'prototype'>

// 原版 ShowModel 的设置方法会提前返回，Demo 需要等 UE 确认后再更新或还原界面。
function requestShowModel(command: ShowModelCommand, params: Record<string, unknown> = {}) {
  return requestUE(SDKShowModel.className, command, params)
}

export const ShowModel = {
  SetWhiteModelEnable: (bEnable: boolean) => requestShowModel('SetWhiteModelEnable', { bEnable }),
  IsWhiteModelEnable: () => requestShowModel('IsWhiteModelEnable'),
  SetWireframeEnable: (bEnable: boolean) => requestShowModel('SetWireframeEnable', { bEnable }),
  IsWireframeEnable: () => requestShowModel('IsWireframeEnable'),
  SetTwoSideEnable: (bEnable: boolean) => requestShowModel('SetTwoSideEnable', { bEnable }),
  IsTwoSideEnable: () => requestShowModel('IsTwoSideEnable'),
  SetUnlightEnable: (bEnable: boolean) => requestShowModel('SetUnlightEnable', { bEnable }),
  IsUnlightEnable: () => requestShowModel('IsUnlightEnable'),
  SetGenerateNormal: (bEnable: boolean) => requestShowModel('SetGenerateNormal', { bEnable }),
  IsGenerateNormal: () => requestShowModel('IsGenerateNormal'),
  SetNormalInverse: (normalInverse: number) => requestShowModel('SetNormalInverse', { normalInverse }),
  GetNormalInverse: () => requestShowModel('GetNormalInverse'),
  SetPostProcessEnable: (bEnable: boolean) => requestShowModel('SetPostProcessEnable', { bEnable }),
  IsPostProcessEnable: () => requestShowModel('IsPostProcessEnable'),
  SetPureColor: (color: Parameters<typeof SDKShowModel.SetPureColor>[0]) => requestShowModel('SetPureColor', { color }),
}
