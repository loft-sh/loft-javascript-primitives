import React from "react"

interface MaybeContainerProps {
  as?: keyof JSX.IntrinsicElements
  show?: boolean
  className?: string
  children?: React.ReactNode
  conditions?: boolean[] | boolean
  [key: string]: any
}

/**
 * If show is false, render children directly without container
 * If conditions is an array, render children directly without container if only one or no conditions are truthy
 * If conditions is a boolean, render children directly without container if the condition is false
 * If conditions is not provided, render children directly without container
 * If conditions is an array, render with container when multiple conditions are truthy
 * If conditions is a boolean, render with container when the condition is true
 * If conditions is not provided, render with container
 * @returns either the children or the container with the children
 */
export const MaybeContainer = ({
  as: Component = "div",
  show = true,
  className,
  children,
  conditions,
  ...props
}: MaybeContainerProps) => {
  if (!show) {
    return <>{children}</>
  }

  // Normalize conditions to array format
  let conditionsArray: boolean[] = []
  if (Array.isArray(conditions)) {
    conditionsArray = conditions
  } else if (typeof conditions === "boolean") {
    conditionsArray = [conditions]
  }

  const truthyConditions = conditionsArray.filter(Boolean).length

  if (truthyConditions <= 1) {
    return <>{children}</>
  }

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}
