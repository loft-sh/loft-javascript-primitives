import React, { useEffect, useState, type ReactNode } from "react"

import { ExpandableErrorDetails } from "./ExpandableErrorDetails"
import { ToastIconType, ToastVariant } from "./Toast"
import { Failed } from "@loft-enterprise/client/src/result"

// Constants
const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000000

const TOAST_DURATIONS = {
  NEVER: 0,
  SHORT: 2000,
  LONG: 120000,
} as const

// Core Types
type ToasterToast = {
  id: string
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  variant?: ToastVariant
  open?: boolean
  expanded?: boolean
  onOpenChange?: (open: boolean) => void
  iconType?: ToastIconType
  baseTitle?: ReactNode
  duration?: number
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

interface State {
  toasts: ToasterToast[]
}

// State Management
let count = 0
const genId = () => (count = (count + 1) % Number.MAX_VALUE).toString()

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    const timeoutRef = toastTimeouts.get(toastId)
    if (timeoutRef) {
      clearTimeout(timeoutRef)
    }
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.id))
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      }
    }

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: action.toastId ? state.toasts.filter((t) => t.id !== action.toastId) : [],
      }
  }
}

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

// Helper function to create consistent toast content
const createToastContent = (title: ReactNode, iconType?: ToastIconType): ReactNode => {
  if (!iconType) return title

  return <div className="flex items-center gap-2 transition-all duration-300">{title}</div>
}

// Helper function to handle error description — glue between ExpandableErrorDetails and toast state
const formatErrorDescription = (err: Failed, toastId: string): ReactNode => {
  let errMessage = err.message
  if (typeof err.message === "string") {
    errMessage = "Error: " + err.message + (err.reason ? " (" + err.reason + ")" : "")

    return errMessage.length <= 50 ? (
      errMessage
    ) : (
      <ExpandableErrorDetails
        errMessage={errMessage}
        onExpandedChange={(expanded) => {
          dispatch({ type: "UPDATE_TOAST", toast: { id: toastId, expanded } })
        }}
      />
    )
  }

  return errMessage
}

// Toast Configuration Type
type ToastConfig = {
  iconType?: ToastIconType
  title?: ReactNode
  description?: ReactNode
  variant?: ToastVariant
  duration?: number
}

// Main Toast Function — supports lazy description via (id: string) => ReactNode
export type ToastType = Omit<ToasterToast, "id" | "description"> & {
  description?: ReactNode | ((id: string) => ReactNode)
}

function toast({ duration = TOAST_DURATIONS.NEVER, ...props }: ToastType) {
  const id = genId()
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  // Resolve lazy description
  const description =
    typeof props.description === "function" ? props.description(id) : props.description

  const update = (newProps: Partial<ToasterToast>) => {
    dispatch({ type: "UPDATE_TOAST", toast: { id, ...newProps } })
  }

  const dismiss = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    dispatch({ type: "DISMISS_TOAST", toastId: id })
  }

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      description,
      id,
      duration,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
      },
    },
  })

  // Auto-dismiss after specified duration
  if (duration > 0) {
    timeoutId = setTimeout(dismiss, duration)
  }

  return { id, dismiss, update }
}

// Toast Convenience Methods
const createToastMethod =
  (config: ToastConfig) => (title: ReactNode, description?: ReactNode, duration?: number) => {
    return toast({
      ...config,
      title: createToastContent(title || config.title, config.iconType),
      baseTitle: title || config.title,
      description,
      duration: duration ?? config.duration,
    })
  }

toast.loading = createToastMethod({
  iconType: "loading",
  title: "Loading...",
  variant: "default",
  duration: TOAST_DURATIONS.NEVER,
})

toast.success = createToastMethod({
  iconType: "success",
  title: "Success",
  variant: "success",
  duration: TOAST_DURATIONS.SHORT,
})

toast.info = createToastMethod({
  iconType: "info",
  title: "Info",
  variant: "default",
  duration: TOAST_DURATIONS.SHORT,
})

toast.warning = createToastMethod({
  iconType: "warning",
  title: "Warning",
  variant: "warning",
  duration: TOAST_DURATIONS.NEVER,
})

// Error method with special Failed handling — delegates to toast() with lazy description
toast.error = (title: ReactNode, err?: Failed, description?: ReactNode, duration?: number) => {
  const errorDescription: ToastType["description"] = err
    ? (id: string) => formatErrorDescription(err, id)
    : description

  return toast({
    iconType: "error",
    title: createToastContent(title || "An Error Occurred", "error"),
    baseTitle: title || "An Error Occurred",
    description: errorDescription,
    variant: "destructive",
    duration: duration ?? TOAST_DURATIONS.LONG,
  })
}

toast.complete = (title: ReactNode, duration?: number) => {
  return toast.success(title || "Complete", undefined, duration)
}

// Hook
function useToast() {
  const [state, setState] = useState<State>(memoryState)

  useEffect(() => {
    listeners.push(setState)

    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
