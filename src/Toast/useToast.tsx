import * as React from "react"

import { Button } from "../Button"
import { ModalDialog, ModalDialogInstance } from "../ModalDialog"
import { ToastVariant } from "./Toast"
import { Failed } from "@loft-enterprise/client/src/result"
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  InfoCircleFilled,
  Loading3QuartersOutlined,
} from "@loft-enterprise/icons"

// Types and Constants
type ToastIconType = "loading" | "success" | "error" | "info" | "warning"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000000

const TOAST_DURATIONS = {
  NEVER: 0,
  SHORT: 2000,
  LONG: 120000,
} as const

// Icon mapping
const ICON_MAP: Record<ToastIconType, React.ReactNode> = {
  loading: <Loading3QuartersOutlined className="animate-spin text-primaryColor-main" />,
  success: <CheckCircleFilled className="text-success-main" />,
  error: <CloseCircleFilled className="text-danger-main" />,
  info: <InfoCircleFilled className="text-primaryColor-main" />,
  warning: <InfoCircleFilled className="text-warning-main" />,
}

// Toast Icon Component
export const ToastIcon: React.FC<{
  type: ToastIconType | undefined
  className?: string
}> = ({ type, className = "size-4" }) => {
  const [currentIcon, setCurrentIcon] = React.useState(type)
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  React.useEffect(() => {
    if (type !== currentIcon) {
      setIsTransitioning(true)
      let enterTimeout: ReturnType<typeof setTimeout>

      const exitTimeout = setTimeout(() => {
        setCurrentIcon(type)
        enterTimeout = setTimeout(() => {
          setIsTransitioning(false)
        }, 150)
      }, 150)

      return () => {
        clearTimeout(exitTimeout)
        clearTimeout(enterTimeout)
      }
    }
  }, [type, currentIcon])

  const icon = currentIcon ? ICON_MAP[currentIcon] : null

  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
          isTransitioning ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}>
        {icon}
      </div>
    </div>
  )
}

// Core Types
type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: ToastVariant
  open?: boolean
  onOpenChange?: (open: boolean) => void
  iconType?: ToastIconType
  baseTitle?: React.ReactNode
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
const createToastContent = (title: React.ReactNode, iconType?: ToastIconType): React.ReactNode => {
  if (!iconType) return title

  return <div className="flex items-center gap-2 transition-all duration-300">{title}</div>
}

// Helper function to handle error description
const formatErrorDescription = (err: Failed): React.ReactNode => {
  let errMessage = err.message
  if (typeof err.message === "string") {
    errMessage = "Error: " + err.message + (err.reason ? " (" + err.reason + ")" : "")

    return errMessage.length <= 128 ? (
      errMessage
    ) : (
      <div className="flex flex-col gap-2">
        <div className="max-h-24">
          <pre className="mb-0 whitespace-pre-wrap break-all text-sm">
            {errMessage.slice(0, 128)}...
          </pre>
        </div>
        <div className="flex flex-row gap-2">
          <Button
            variant="outlined"
            onClick={() => {
              navigator.clipboard.writeText(errMessage)
            }}>
            <CopyOutlined /> Copy
          </Button>
          <ErrorDetailsModal errMessage={errMessage} />
        </div>
      </div>
    )
  }

  return errMessage
}

// Component for showing full error details in a modal
const ErrorDetailsModal: React.FC<{ errMessage: string }> = ({ errMessage }) => {
  const modalRef = React.useRef<ModalDialogInstance>(null)

  const handleShowMore = () => {
    modalRef.current?.show()
  }

  return (
    <>
      <Button variant="ghost" onClick={handleShowMore}>
        Show more
      </Button>
      <ModalDialog
        ref={modalRef}
        title="Error Details"
        primaryAction={{
          label: "Close",
          onClick: () => modalRef.current?.hide(),
        }}>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all text-sm">
          {errMessage}
        </pre>
      </ModalDialog>
    </>
  )
}

// Toast Configuration Type
type ToastConfig = {
  iconType?: ToastIconType
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  duration?: number
}

// Main Toast Function
export type ToastType = Omit<ToasterToast, "id">

function toast({ duration = TOAST_DURATIONS.NEVER, ...props }: ToastType) {
  const id = genId()
  let timeoutId: ReturnType<typeof setTimeout> | null = null

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
  (config: ToastConfig) =>
  (title: React.ReactNode, description?: React.ReactNode, duration?: number) => {
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

// Error method with special Failed handling
toast.error = (
  title: React.ReactNode,
  err?: Failed,
  description?: React.ReactNode,
  duration?: number
) => {
  let errorDescription = description

  if (err) {
    errorDescription = formatErrorDescription(err)
  }

  return toast({
    iconType: "error",
    title: createToastContent(title || "An Error Occurred", "error"),
    baseTitle: title || "An Error Occurred",
    description: errorDescription,
    variant: "destructive",
    duration: duration ?? TOAST_DURATIONS.LONG,
  })
}

toast.complete = (title: React.ReactNode, duration?: number) => {
  return toast.success(title || "Complete", undefined, duration)
}

// Hook
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
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
