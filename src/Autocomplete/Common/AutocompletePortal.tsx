import { FocusTrap, FocusTrapProps } from "focus-trap-react"
import React, { RefObject, useContext, useLayoutEffect, useRef } from "react"

import { AutocompleteContext } from "./AutocompleteContext"
import { FlipContext } from "./FlipContext"

export type AutocompletePortalProps = {
  placeholderRef: RefObject<HTMLDivElement>
  children: React.ReactNode
}

const FOCUS_TRAP_OPTIONS: FocusTrapProps["focusTrapOptions"] = {
  allowOutsideClick: true,
  escapeDeactivates: false,
}

export function AutocompletePortal({ placeholderRef, children }: AutocompletePortalProps) {
  const portalOutletRef = useRef<HTMLDivElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)

  const flippedRef = useRef<boolean>(false)
  const { setFlipped: setExternalFlippedState } = useContext(FlipContext)

  const { onCloseRequested, value, onSubmit } = useContext(AutocompleteContext)

  useLayoutEffect(() => {
    const updatePosition = () => {
      const placeholder = placeholderRef.current
      const portalOutlet = portalOutletRef.current
      const contentWrapper = contentWrapperRef.current

      if (placeholder && portalOutlet && contentWrapper) {
        const rect = placeholder.getBoundingClientRect()

        portalOutlet.style.width = `${rect.width}px`
        portalOutlet.style.height = `${rect.height}px`
        portalOutlet.style.transform = `translate(${rect.left}px, ${rect.top}px)`

        const dimensions = contentWrapper.getBoundingClientRect()
        const spaceAvailable = window.innerHeight - rect.top >= dimensions.height + 32

        if (spaceAvailable && flippedRef.current) {
          flippedRef.current = false
          setExternalFlippedState?.(false)
          contentWrapper.style.top = `0px`
          contentWrapper.style.bottom = `unset`
          contentWrapper.style.flexDirection = "column"
        } else if (!spaceAvailable && !flippedRef.current) {
          flippedRef.current = true
          contentWrapper.style.top = `unset`
          contentWrapper.style.bottom = `0px`
          contentWrapper.style.flexDirection = "column-reverse"
          setExternalFlippedState?.(true)
        }
      }
    }

    const resizeObserver = new ResizeObserver(updatePosition)
    if (contentWrapperRef.current) {
      resizeObserver.observe(contentWrapperRef.current)
    }

    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("wheel", updatePosition, true)
    window.addEventListener("resize", updatePosition, true)

    updatePosition()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("wheel", updatePosition, true)
      window.removeEventListener("resize", updatePosition, true)
    }
  }, [placeholderRef, setExternalFlippedState])

  const closeAndSubmit = () => {
    onCloseRequested?.()
    onSubmit?.(value as any) // This is fine, it's from the same object. Types will match.
  }

  return (
    <>
      <div
        className={"fixed left-0 top-0 z-top-level h-[100vh] w-[100vw]"}
        onMouseDown={(e) => {
          e.stopPropagation()

          // Prevents focus loss and subsequent selection of input when FocusTrap reclaims focus.
          e.preventDefault()
        }}
        onClick={closeAndSubmit}
      />
      <div
        ref={portalOutletRef}
        className={"fixed left-0 top-0 z-top-level will-change-transform"}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation()
            e.preventDefault()
            closeAndSubmit()
          }
        }}>
        <FocusTrap focusTrapOptions={FOCUS_TRAP_OPTIONS}>
          <div
            ref={contentWrapperRef}
            className={"absolute left-0 top-0 flex w-full flex-col rounded-md shadow-small"}>
            {children}
          </div>
        </FocusTrap>
      </div>
    </>
  )
}
