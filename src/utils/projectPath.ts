declare const __UE_DEMO_PROJECT_ROOT__: string

const PROJECT_ROOT_STORAGE_KEY = 'ue-demo-project-root'

const normalizeWindowsPath = (value: string) =>
  value.replace(/\//g, '\\').replace(/\\+$/, '')

export const getProjectRootPath = () => {
  if (typeof window === 'undefined') {
    return normalizeWindowsPath(__UE_DEMO_PROJECT_ROOT__)
  }

  const stored = window.localStorage.getItem(PROJECT_ROOT_STORAGE_KEY)
  if (stored) {
    return normalizeWindowsPath(stored)
  }

  return normalizeWindowsPath(__UE_DEMO_PROJECT_ROOT__)
}

export const persistProjectRootPath = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PROJECT_ROOT_STORAGE_KEY, getProjectRootPath())
}

export const buildProjectRelativePath = (...segments: string[]) => {
  const cleanRoot = getProjectRootPath()
  const cleanSegments = segments
    .map(segment => segment.replace(/\//g, '\\').replace(/^\\+|\\+$/g, ''))
    .filter(Boolean)

  return [cleanRoot, ...cleanSegments].join('\\')
}

