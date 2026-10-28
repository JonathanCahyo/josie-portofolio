import { createContext } from 'react'

/** `live`: the 3D scene is mounted, animating and carrying the visual narrative. */
export const SceneContext = createContext<{ live: boolean }>({ live: false })
