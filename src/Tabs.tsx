import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"
import {
  createContext,
  isValidElement,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

import { cn } from "../clsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu"
import { CloseOutlined } from "@loft-enterprise/icons"
import { useForwardedInnerRef } from "@loft-enterprise/shared"

type TabsContextValue = {
  value?: string | undefined
  changeValue?: (value: string) => void
}

const TabsContext = createContext<TabsContextValue>({})

type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>

const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
  ({ value, onValueChange, defaultValue, ...props }, ref) => {
    const [innerValue, setInnerValue] = useState(value ?? defaultValue)

    const controlled = value !== undefined

    // Synchronize the value from parent if present.
    useEffect(() => {
      if (!controlled) {
        return
      }

      setInnerValue(value)
    }, [controlled, value, setInnerValue])

    const changeValue = useCallback(
      (e: string) => {
        if (!controlled) {
          setInnerValue(e)
        }

        onValueChange?.(e)
      },
      [controlled, setInnerValue, onValueChange]
    )

    const ctxValue = useMemo(
      () => ({
        changeValue,
        value: innerValue,
      }),
      [changeValue, innerValue]
    )

    return (
      <TabsContext.Provider value={ctxValue}>
        <TabsPrimitive.Root {...props} ref={ref} value={innerValue} onValueChange={changeValue} />
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = TabsPrimitive.Root.displayName

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
  size?: "default" | "large" | "small"
  variant?: "ghost" | "filled"
  /** NOTE: If you set this, you're more likely to want an EllipsisTabsList **/
  forceScrollbar?: boolean
}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, forceScrollbar, size = "default", variant = "ghost", ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={cn(
        "group inline-flex min-h-9 items-center gap-4 overflow-x-auto rounded-lg p-1",
        {
          "scrollbar-hide": !forceScrollbar,
          "[&_button]:text-sm [&_svg]:size-3": size === "small",
          "[&_button]:text-base [&_svg]:size-6": size === "large",
          "h-fit w-full gap-0.5 rounded-b-none border-b border-divider-light py-0 pl-0":
            variant === "filled",
        },
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = TabsPrimitive.List.displayName

const EllipsisTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ children, ...props }, ref) => {
  const { value, changeValue } = useContext(TabsContext)

  const childArray = useMemo(() => React.Children.toArray(children), [children])

  const [sizes, measuringPortal] = useMeasureTabList(childArray)

  const listRef = useRef<HTMLDivElement>(null)
  const innerRef = useForwardedInnerRef(ref)

  const ellipsisWidth = 40

  // This will update the visibilities based on the sizes available. (does not: re-measure the sizes)
  const deriveVisibility = useCallback(() => {
    const container = listRef.current
    if (!container) {
      return { visibleIds: [], overflowIds: [] }
    }

    // The container still has some padding "p-1", but it's defined in another component, so we determine this here.
    let containerPadding = 0

    if (innerRef.current) {
      const computedStyle = window.getComputedStyle(innerRef.current!)
      const pl = parseFloat(computedStyle.paddingLeft)
      const pr = parseFloat(computedStyle.paddingRight)
      if (pl === pl && pr === pr) {
        containerPadding = pl + pr
      }
    }

    const max = container.clientWidth - containerPadding

    let usedSpace = 0
    const visibleIds: number[] = []
    const overflowIds: number[] = []

    for (let id = 0; id < childArray.length; id++) {
      const w = (sizes ?? {})[id] ?? 0
      // This 16px gap is currently fixed. If we allow more styles for this, need to determine via computed style.
      const widthIncludingGap = w + 16
      const worstCaseWidth = usedSpace + widthIncludingGap + ellipsisWidth

      // If we already have something in the ellipsis, we add all subsequent elements to it,
      // even if it would hypothetically fit.
      if (overflowIds.length === 0 && worstCaseWidth <= max) {
        visibleIds.push(id)
        usedSpace += widthIncludingGap
      } else {
        overflowIds.push(id)
      }
    }

    return { visibleIds, overflowIds }
  }, [childArray, sizes, innerRef])

  const [{ visibleIds, overflowIds }, setVisibilityState] = useState<{
    visibleIds: number[]
    overflowIds: number[]
  }>(deriveVisibility)

  const updateVisibility = useCallback(() => {
    setVisibilityState(deriveVisibility())
  }, [deriveVisibility, setVisibilityState])

  useLayoutEffect(() => {
    if (sizes && children) {
      updateVisibility()
    }
  }, [sizes, updateVisibility, children])

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null

    if (listRef.current) {
      resizeObserver = new ResizeObserver(updateVisibility)
      resizeObserver.observe(listRef.current)
    }

    window.addEventListener("resize", updateVisibility)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener("resize", updateVisibility)
    }
  }, [updateVisibility])

  const overflowingTriggers = useMemo(() => {
    return childArray.filter(
      (c, i) => isValidElement(c) && c.type === TabsTrigger && overflowIds.includes(i)
    ) as Partial<ReactElement<TabsTriggerProps>>[]
  }, [childArray, overflowIds])

  const dropdownItems = useMemo(() => {
    return overflowingTriggers.map((t) => {
      const value = t.props?.value
      const children = t.props?.children
      const className = t.props?.className
      const key = t.props?.key
      const disabled = t.props?.disabled

      // Non-exhaustive list of props that we pass on.
      return { value, children, className, key, disabled }
    })
  }, [overflowingTriggers])

  const valueInOther = useMemo(() => {
    return !!dropdownItems.find((i) => i.value === value)
  }, [value, dropdownItems])

  return (
    <>
      <div className={"max-w-full overflow-hidden"}>
        <div ref={listRef} className={"flex max-w-full flex-row items-center gap-1"}>
          <TabsList ref={innerRef} {...props}>
            <div className={"inline-flex flex-row items-center gap-4"}>
              {childArray.map((child, i) => {
                if (visibleIds.includes(i)) {
                  return child
                }

                return null
              })}
              {overflowingTriggers.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label={"More options"}
                      title={"More options"}
                      style={{ width: `${ellipsisWidth}px` }}
                      className={cn(
                        "flex h-9 flex-shrink-0 flex-row items-center justify-center bg-transparent",
                        "cursor-pointer select-none border-b-2 font-semibold",
                        {
                          "border-primary-main text-primaryColor-main": valueInOther,
                        }
                      )}>
                      ...
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {dropdownItems.map(
                      ({ value: itemValue, key, children, className, disabled }, i) => (
                        <DropdownMenuItem
                          disabled={disabled}
                          key={key ?? itemValue ?? `${i}`}
                          className={cn(className, {
                            "cursor-not-allowed text-disabledColor-main": disabled,
                            "text-primaryColor-main": itemValue === value,
                          })}
                          onClick={() => {
                            if (changeValue && itemValue) {
                              changeValue(itemValue)
                            }
                          }}>
                          {children}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </TabsList>
        </div>
      </div>
      {measuringPortal}
    </>
  )
})
EllipsisTabsList.displayName = "EllipsisTabsList"

export function useMeasureTabList(
  childArray: ReactNode[]
): [Record<number, number> | null, React.ReactPortal] {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const refs = useMemo(() => childArray.map(() => React.createRef<HTMLDivElement>()), [childArray])

  const [sizes, setSizes] = useState<Record<number, number> | null>(null)

  const updateSizes = useCallback(() => {
    const widths: Record<number, number> = {}
    refs.forEach((ref, i) => {
      if (ref.current) {
        const { width } = ref.current.getBoundingClientRect()
        widths[i] = width
      }
    })
    setSizes(widths)
  }, [refs])

  // Update sizes initially to ensure that the sizes are available for first commit.
  // This will also be called if a reset is not caught by the resize observer.
  useLayoutEffect(() => {
    if (sizes !== null) {
      return
    }
    updateSizes()
  }, [updateSizes, sizes])

  // Attach a resize observer to the list so we can see when the layout shifts but the reference to childArray doesn't.
  // This mainly happens with icons, as they are lazy-loaded.
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null

    // TODO: Potential improvement: Use individual resize observers. Only necessary if we run into cases,
    //  where tab labels change dynamically over time (expanding AND shrinking). (ref: ENG-9005)
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(updateSizes)
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver?.disconnect()
    }
  }, [updateSizes])

  // Create a portal element to render into.
  const portalElement = useMemo(() => {
    const div = document.createElement("div")
    div.style.position = "absolute"
    div.style.left = "0"
    div.style.top = "0"
    div.style.visibility = "hidden"
    div.style.width = "0"
    div.style.height = "0"
    div.style.opacity = "0"
    div.style.pointerEvents = "none"

    // Ensure that children can still "expand" without changing the layout of the page so we can get an accurate measurement.
    div.style.overflow = "scroll"
    div.style.setProperty("scrollbar-width", "none")

    document.body.appendChild(div)

    return div
  }, [])

  // Clean up portal element on dismount.
  useEffect(() => {
    return () => {
      document.body.removeChild(portalElement)
    }
  }, [portalElement])

  // Reset sizes whenever the children change.
  useEffect(() => {
    setSizes(null)
  }, [childArray])

  // We need to render the children to an invisible portal so we can continuously measure ALL the children.
  const portal = createPortal(
    <Tabs>
      <TabsList ref={containerRef} variant={"ghost"} className={"w-fit"}>
        {childArray.map((child, i) => (
          <div ref={refs[i]} key={i} className={"flex flex-shrink-0 flex-row gap-4"}>
            {child}
          </div>
        ))}
      </TabsList>
    </Tabs>,
    portalElement
  )

  return [sizes, portal]
}

type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
  variant?: "config-page" | "default" | "filled"
  closable?: boolean
  onClose?: () => void
  buttonClassName?: string
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(
  (
    { className, variant = "default", closable, buttonClassName, onClose, children, ...props },
    ref
  ) => {
    const innerRef = useRef<React.ElementRef<typeof TabsPrimitive.Trigger>>(null)

    useImperativeHandle(ref, () => innerRef.current!)

    return (
      <TabsPrimitive.Trigger
        ref={innerRef}
        className={cn(
          "relative text-nowrap border-0 bg-transparent",
          "inline-flex h-9 cursor-pointer items-center justify-center border-b-2 p-1 text-sm font-semibold text-secondary underline-offset-4 disabled:cursor-not-allowed disabled:text-disabled data-active:border-b-2 data-active:border-primary-main  data-active:text-primaryColor-main [&_svg]:size-4",
          "transition-colors group-data-[variant=filled]:data-active:bg-white",
          {
            "w-full justify-start self-start border-0 border-b-0 py-2 pl-0 font-medium text-primary data-active:rounded data-active:border-none data-active:bg-gray-20 data-active:pl-0 data-active:font-semibold data-active:text-primary":
              variant === "config-page",
          },
          {
            // filled variant
            "disabled:opacity-50 group-[[data-variant]:not([data-variant=filled])]:mb-[-1px] data-[state=active]:z-10 group-data-[variant=filled]:rounded-t-lg group-data-[variant=filled]:border group-data-[variant=filled]:border-b-0 group-data-[variant=filled]:border-divider-light group-data-[variant=filled]:px-4 group-data-[variant=filled]:data-active:bg-white group-data-[variant=filled]:data-active:text-primaryColor-main group-data-[variant=filled]:data-inactive:bg-body-main group-data-[variant=filled]:data-inactive:text-secondary":
              true,
          },
          className
        )}
        {...props}>
        {children}
        {closable && (
          <button
            type="button"
            className={cn(
              "ml-2 flex size-4 items-center justify-center text-neutral-main transition-colors hover:text-neutral-dark",
              buttonClassName
            )}
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}>
            <CloseOutlined className="*:size-5" />
          </button>
        )}
      </TabsPrimitive.Trigger>
    )
  }
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "p-1 transition-opacity data-[state=inactive]:opacity-0 data-active:flex-grow data-active:opacity-100",

      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent, EllipsisTabsList }
