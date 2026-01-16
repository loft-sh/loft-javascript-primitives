import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"

import { cn } from "../clsx"
import { CheckOutlined } from "@loft-enterprise/icons"

interface StepContextValue {
  setCompleted: (completed: boolean) => void
  goToPrevious: () => void
  isActive: boolean
  isCompleted: boolean
  stepNumber: number
  totalSteps: number
}

const StepContext = createContext<StepContextValue | null>(null)

export const useStepContext = () => {
  const context = useContext(StepContext)
  if (!context) {
    throw new Error("useStepContext must be used within a Step component")
  }

  return context
}

interface StepsContextValue {
  completedSteps: Set<number>
  setStepCompleted: (stepNum: number, completed: boolean) => void
  goToPrevious: (currentStepNum: number) => void
  goToNext: () => void
  activeStep: number | null
  totalSteps: number
  stepNumbers: number[]
  isPending: boolean
}

const StepsContext = createContext<StepsContextValue | null>(null)

interface StepsProps {
  children: ReactNode
  "aria-label"?: string
}

export const Steps: React.FC<StepsProps> = ({ children, "aria-label": ariaLabel }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isPending, startTransition] = useTransition()

  const { totalSteps, stepNumbers, activeStep } = useMemo(() => {
    const childrenArray = React.Children.toArray(children)

    const result = childrenArray.reduce(
      (acc, child) => {
        if (React.isValidElement(child) && child.type === Step) {
          acc.stepCount++
          acc.stepNumbers.push(acc.stepCount)
          if (acc.activeStep === null && !completedSteps.has(acc.stepCount)) {
            acc.activeStep = acc.stepCount
          }
        }

        return acc
      },
      {
        stepCount: 0,
        stepNumbers: [] as number[],
        activeStep: null as number | null,
      }
    )

    return {
      totalSteps: result.stepCount,
      stepNumbers: result.stepNumbers,
      activeStep: result.activeStep,
    }
  }, [children, completedSteps])

  const setStepCompleted = useCallback((stepNum: number, completed: boolean) => {
    startTransition(() => {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev)
        if (completed) {
          newSet.add(stepNum)
        } else {
          newSet.delete(stepNum)
        }

        return newSet
      })
    })
  }, [])

  const goToNext = useCallback(() => {
    if (activeStep === null) return
    startTransition(() => {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev)
        newSet.add(activeStep)

        return newSet
      })
    })
  }, [activeStep])

  const goToPrevious = useCallback((currentStepNum: number) => {
    startTransition(() => {
      setCompletedSteps((prev) => {
        const newSet = new Set<number>()
        prev.forEach((stepNum) => {
          if (stepNum < currentStepNum - 1) {
            newSet.add(stepNum)
          }
        })

        return newSet
      })
    })
  }, [])

  const contextValue: StepsContextValue = {
    completedSteps,
    setStepCompleted,
    goToPrevious,
    goToNext,
    activeStep,
    totalSteps,
    stepNumbers,
    isPending,
  }

  const completedCount = completedSteps.size
  const progressLabel = `Step ${activeStep || completedCount + 1} of ${totalSteps}`

  const stepsWithNumbers = useMemo(
    () =>
      React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Step) {
          return React.cloneElement(child as React.ReactElement<StepProps>, {
            ...child.props,
            __stepNumber: index + 1, // Internal prop
          })
        }

        return child
      }),
    [children]
  )

  return (
    <StepsContext.Provider value={contextValue}>
      <nav
        role="navigation"
        aria-label={ariaLabel || "Step-by-step process"}
        className="w-full [--step-circle-size:2rem]">
        {/* Screen reader announcement for progress */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
          {progressLabel}
          {activeStep && `, currently on step ${activeStep}`}
        </div>

        <ol className="list-none space-y-4 pl-0" role="list">
          {stepsWithNumbers}
        </ol>
      </nav>
    </StepsContext.Provider>
  )
}

interface StepProps {
  children: ReactNode
  __stepNumber?: number // Internal prop
}

const StepCircle: React.FC<{
  num: number
  status: "completed" | "active" | "upcoming"
  isAnimating?: boolean
}> = ({ num, status, isAnimating = false }) => {
  const baseClasses =
    "relative z-60 flex size-[var(--step-circle-size)] items-center justify-center rounded-full text-sm font-medium transition-all duration-300"

  const statusClasses = {
    completed: cn(
      baseClasses,
      "bg-success-main text-white transition-all duration-500 ease-out",
      isAnimating && "scale-110 shadow-lg shadow-success-main/30"
    ),
    active: cn(baseClasses, "bg-primary-main text-white"),
    upcoming: cn(baseClasses, "border-1 border border-divider-main bg-white text-tertiary"),
  }

  if (status === "completed") {
    return (
      <span className={statusClasses.completed} aria-hidden="true">
        <span
          className={cn(
            "transition-all duration-300",
            isAnimating ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}>
          {num}
        </span>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isAnimating ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}>
          ✓
        </span>
      </span>
    )
  }

  return (
    <span className={statusClasses[status]} aria-hidden="true">
      {num}
    </span>
  )
}

const ConnectorLine: React.FC<{
  status: "completed" | "active" | "upcoming"
}> = ({ status }) => {
  if (status === "completed") {
    return (
      <div
        className="absolute left-8 top-12 z-50 h-[calc(100%-var(--step-circle-size)/2)] w-0.5"
        aria-hidden="true">
        <div className="absolute inset-0 bg-divider-light opacity-30" />
        <div className="absolute inset-0 translate-y-0 bg-success-main opacity-60 transition-all duration-1000 ease-out" />
      </div>
    )
  }

  if (status === "active") {
    return (
      <div
        className="absolute left-8 top-12 z-50 h-[calc(100%-var(--step-circle-size)/2)] w-0.5"
        aria-hidden="true">
        <div className="absolute inset-0 bg-divider-light opacity-50" />
      </div>
    )
  }

  return (
    <div
      className="absolute left-8 top-12 z-50 h-[calc(100%-var(--step-circle-size)/2)] w-0.5 bg-divider-light opacity-30"
      aria-hidden="true"
    />
  )
}

const StepHeader: React.FC<{
  num: number
  status: "completed" | "active" | "upcoming"
  stepTitle: React.ReactNode
  stepDescription: React.ReactNode
  isAnimating?: boolean
}> = ({ num, status, stepTitle, stepDescription, isAnimating = false }) => {
  return (
    <div className="flex items-start gap-3" role="button" aria-expanded={status === "active"}>
      <StepCircle num={num} status={status} isAnimating={isAnimating} />
      <div className={cn("flex-1", status === "completed" && "transition-all duration-300")}>
        {stepTitle}
        {stepDescription}
      </div>
      {status === "completed" && (
        <span
          className={cn(
            "text-success-main transition-all duration-500",
            isAnimating && "scale-125"
          )}
          aria-label="Completed">
          <CheckOutlined className="size-4" />
        </span>
      )}
    </div>
  )
}

const getStepContainerClasses = (
  status: "completed" | "active" | "upcoming",
  isPending: boolean
) => {
  const baseClasses =
    "group relative rounded-md p-4 transition-all duration-500 ease-in-out overflow-visible"

  switch (status) {
    case "completed":
      return cn(baseClasses, "bg-white hover:border-primary-light", isPending && "opacity-80")
    case "active":
      return cn(baseClasses, "bg-white shadow-sm", isPending && "opacity-80")
    case "upcoming":
      return cn(baseClasses, "opacity-60 hover:opacity-80", isPending && "opacity-40")
  }
}

export const Step: React.FC<StepProps> = ({ children, __stepNumber }) => {
  const stepsContext = useContext(StepsContext)
  const stepRef = useRef<HTMLLIElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  if (!stepsContext) {
    throw new Error("Step must be used within a Steps component")
  }

  const num = __stepNumber! // We know this will be set by Steps component
  const {
    completedSteps,
    setStepCompleted,
    goToPrevious,
    activeStep,
    totalSteps,
    stepNumbers,
    isPending,
  } = stepsContext
  const isCompleted = completedSteps.has(num)
  const isActive = activeStep === num
  const wasCompleted = useRef(isCompleted)

  useEffect(() => {
    if (wasCompleted.current !== isCompleted) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 600)
      wasCompleted.current = isCompleted

      return () => clearTimeout(timer)
    }
  }, [isCompleted])

  // Focus management - focus the active step when it becomes active
  useEffect(() => {
    if (isActive && stepRef.current) {
      stepRef.current.focus()
    }
  }, [isActive])

  const { stepTitle, stepDescription, stepContent } = useMemo(() => {
    const childrenArray = React.Children.toArray(children)

    return childrenArray.reduce(
      (acc, child) => {
        if (React.isValidElement(child)) {
          if (child.type === StepTitle && !acc.stepTitle) {
            acc.stepTitle = child
          } else if (child.type === StepDescription && !acc.stepDescription) {
            acc.stepDescription = child
          } else if (child.type !== StepTitle && child.type !== StepDescription) {
            acc.stepContent.push(child)
          }
        }

        return acc
      },
      {
        stepTitle: null as React.ReactElement | null,
        stepDescription: null as React.ReactElement | null,
        stepContent: [] as React.ReactNode[],
      }
    )
  }, [children])

  const stepContextValue: StepContextValue = {
    setCompleted: (completed: boolean) => setStepCompleted(num, completed),
    goToPrevious: () => goToPrevious(num),
    isActive,
    isCompleted,
    stepNumber: num,
    totalSteps,
  }

  const stepStatus = isCompleted ? "completed" : isActive ? "current" : "upcoming"
  const ariaLabel = `Step ${num} of ${totalSteps}: ${stepStatus}`
  const hasNextStep = stepNumbers.some((stepNum) => stepNum > num)
  const status = isCompleted ? "completed" : isActive ? "active" : "upcoming"

  if (isCompleted) {
    return (
      <li
        ref={stepRef}
        className={getStepContainerClasses(status, isPending)}
        data-step={num}
        role="listitem"
        aria-label={ariaLabel}>
        {hasNextStep && <ConnectorLine status={status} />}
        <StepHeader
          num={num}
          status={status}
          stepTitle={stepTitle}
          stepDescription={stepDescription}
          isAnimating={isAnimating}
        />
      </li>
    )
  }

  if (isActive) {
    return (
      <StepContext.Provider value={stepContextValue}>
        <li
          ref={stepRef}
          className={getStepContainerClasses(status, isPending)}
          data-step={num}
          role="listitem"
          aria-label={ariaLabel}
          aria-current="step">
          {hasNextStep && <ConnectorLine status={status} />}
          <StepHeader
            num={num}
            status={status}
            stepTitle={stepTitle}
            stepDescription={stepDescription}
          />
          <div
            className="ml-11 max-h-screen translate-y-0 overflow-hidden opacity-100 transition-all duration-500 ease-in-out"
            role="region"
            aria-label={`Content for step ${num}`}>
            <div className="transition-all delay-200 duration-300">{stepContent}</div>
          </div>
        </li>
      </StepContext.Provider>
    )
  }

  return (
    <li
      ref={stepRef}
      className={getStepContainerClasses(status, isPending)}
      data-step={num}
      role="listitem"
      aria-label={ariaLabel}>
      {hasNextStep && <ConnectorLine status={status} />}
      <StepHeader
        num={num}
        status={status}
        stepTitle={stepTitle}
        stepDescription={stepDescription}
      />
    </li>
  )
}

interface StepTitleProps {
  children: ReactNode
}

export const StepTitle: React.FC<StepTitleProps> = ({ children }) => {
  return (
    <h3 className="text-base font-medium text-primary" role="heading" aria-level={3}>
      {children}
    </h3>
  )
}

interface StepDescriptionProps {
  children: ReactNode
}

export const StepDescription: React.FC<StepDescriptionProps> = ({ children }) => {
  return (
    <p className="mb-0 mt-1 text-sm text-tertiary" role="text">
      {children}
    </p>
  )
}

export const useSteps = () => {
  const stepsContext = useContext(StepsContext)
  if (!stepsContext) {
    throw new Error("useSteps must be used within a Steps component")
  }

  return stepsContext
}
