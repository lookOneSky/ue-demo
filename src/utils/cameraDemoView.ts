export interface CameraView {
  locationLLH: [number, number, number]
  rotationLLH: { pitch: number; yaw: number; roll: number }
}

export function isLLH(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every(Number.isFinite)
}

export function isCameraView(value: unknown): value is CameraView {
  if (!value || typeof value !== 'object' || !('locationLLH' in value) || !isLLH(value.locationLLH)) return false
  if (!('rotationLLH' in value)) return false
  const rotation = value.rotationLLH
  return !!rotation && typeof rotation === 'object' &&
    'pitch' in rotation && Number.isFinite(rotation.pitch) &&
    'yaw' in rotation && Number.isFinite(rotation.yaw) &&
    'roll' in rotation && Number.isFinite(rotation.roll)
}
