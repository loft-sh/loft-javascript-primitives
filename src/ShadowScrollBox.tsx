import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"

import { cn } from "../cn-utils"

type ShadowScrollBoxProps = React.ComponentPropsWithoutRef<"div"> & {
  onShadowChange?: (hasTopShadow: boolean, hasBottomShadow: boolean) => void
  onScrollableChange?: (isScrollable: boolean) => void
  topShadow?: string
  bottomShadow?: string
  scrollableAreaClassName?: string
}

const ShadowScrollBox = forwardRef<HTMLDivElement, ShadowScrollBoxProps>(
  (
    {
      children,
      style,
      className,
      onScroll,
      onShadowChange,
      onScrollableChange,
      topShadow,
      bottomShadow,
      scrollableAreaClassName,
      ...props
    },
    ref
  ) => {
    const [scrollTop, setScrollTop] = useState(0)
    const [scrollHeight, setScrollHeight] = useState(0)
    const [clientHeight, setClientHeight] = useState(0)

    const innerRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => innerRef.current!)

    const update = useCallback(() => {
      if (!innerRef.current) {
        return
      }

      setScrollTop(innerRef.current.scrollTop)
      setScrollHeight(innerRef.current.scrollHeight)
      setClientHeight(innerRef.current.clientHeight)
    }, [])

    useEffect(() => {
      let resizeObserver: ResizeObserver | undefined = undefined

      if (innerRef.current) {
        resizeObserver = new ResizeObserver(update)
        resizeObserver.observe(innerRef.current)
      }

      return () => {
        resizeObserver?.disconnect()
      }
    }, [update])

    const isScrollable = scrollHeight !== clientHeight

    const { boxShadow, hasTopShadow, hasBottomShadow } = useMemo(() => {
      let boxShadow = "none"

      if (!isScrollable) {
        return { boxShadow: "none", hasTopShadow: false, hasBottomShadow: false }
      }
      const isBottom = clientHeight === scrollHeight - scrollTop
      const isTop = scrollTop === 0
      const isBetween = scrollTop > 0 && clientHeight < scrollHeight - scrollTop

      const top = topShadow || "inset 0 8px 5px -5px rgb(0 0 0 / 0.4)"
      const bottom = bottomShadow || "inset 0 -8px 5px -5px rgb(0 0 0 / 0.4)"

      if (isTop) {
        boxShadow = bottom
      } else if (isBetween) {
        boxShadow = `${top}, ${bottom}`
      } else if (isBottom) {
        boxShadow = top
      }

      return {
        boxShadow: boxShadow,
        hasTopShadow: isTop || isBetween,
        hasBottomShadow: isBottom || isBetween,
      }
    }, [scrollTop, scrollHeight, clientHeight, isScrollable, topShadow, bottomShadow])

    useEffect(() => {
      onShadowChange?.(hasTopShadow, hasBottomShadow)
    }, [hasTopShadow, hasBottomShadow, onShadowChange])

    useEffect(() => {
      onScrollableChange?.(isScrollable)
    }, [isScrollable, onScrollableChange])

    const onScrollWrapper = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        onScroll?.(e)
        update()
      },
      [onScroll, update]
    )

    return (
      <div className={cn("relative flex w-full flex-col overflow-hidden", className)}>
        <div
          ref={innerRef}
          className={cn("flex w-full flex-col overflow-y-auto", scrollableAreaClassName)}
          onScroll={onScrollWrapper}
          {...props}>
          {children}
        </div>
        <div
          className="pointer-events-none  absolute left-0 top-0 z-top-level h-full w-full"
          style={{ boxShadow, ...style }}></div>
      </div>
    )
  }
)
ShadowScrollBox.displayName = "ShadowScrollBox"

export { ShadowScrollBox }
