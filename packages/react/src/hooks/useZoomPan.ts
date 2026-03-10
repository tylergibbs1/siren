import { useState, useCallback, useRef, useEffect, type RefObject } from 'react'

interface ZoomPanOptions {
  minZoom?: number
  maxZoom?: number
  initialZoom?: number
}

interface ZoomPanState {
  zoom: number
  pan: { x: number; y: number }
}

export function useZoomPan(
  containerRef: RefObject<HTMLElement | null>,
  options: ZoomPanOptions = {}
) {
  const { minZoom = 0.1, maxZoom = 4, initialZoom = 1 } = options

  const [state, setState] = useState<ZoomPanState>({
    zoom: initialZoom,
    pan: { x: 0, y: 0 },
  })

  const isPanning = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  const setZoom = useCallback(
    (zoom: number) => {
      setState((prev) => ({
        ...prev,
        zoom: Math.min(maxZoom, Math.max(minZoom, zoom)),
      }))
    },
    [minZoom, maxZoom]
  )

  const setPan = useCallback((x: number, y: number) => {
    setState((prev) => ({ ...prev, pan: { x, y } }))
  }, [])

  const zoomIn = useCallback(() => {
    setZoom(state.zoom * 1.2)
  }, [state.zoom, setZoom])

  const zoomOut = useCallback(() => {
    setZoom(state.zoom / 1.2)
  }, [state.zoom, setZoom])

  const resetView = useCallback(() => {
    setState({ zoom: 1, pan: { x: 0, y: 0 } })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setState((prev) => ({
          ...prev,
          zoom: Math.min(maxZoom, Math.max(minZoom, prev.zoom * delta)),
        }))
      } else {
        // Pan
        setState((prev) => ({
          ...prev,
          pan: {
            x: prev.pan.x - e.deltaX,
            y: prev.pan.y - e.deltaY,
          },
        }))
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        isPanning.current = true
        lastMouse.current = { x: e.clientX, y: e.clientY }
        el.style.cursor = 'grabbing'
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      lastMouse.current = { x: e.clientX, y: e.clientY }
      setState((prev) => ({
        ...prev,
        pan: { x: prev.pan.x + dx, y: prev.pan.y + dy },
      }))
    }

    const onMouseUp = () => {
      isPanning.current = false
      el.style.cursor = ''
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [containerRef, minZoom, maxZoom])

  return {
    ...state,
    setZoom,
    setPan,
    zoomIn,
    zoomOut,
    resetView,
    transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`,
  }
}
