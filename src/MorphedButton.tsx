import { AnimatePresence, motion, Variants } from "framer-motion"
import React, { useEffect, useState } from "react"

import { Button, ButtonProps } from "./Button"
import { Tooltip } from "./Tooltip"

type Props = {
  from: React.ReactNode
  to: React.ReactNode
  tooltip?: React.ReactNode
} & ButtonProps

const variants = {
  hidden: { opacity: 0, scale: 0.5, transition: { duration: 0.1, ease: "easeInOut" } },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.1, ease: "easeInOut" } },
} as Variants

function MorphedButton({ from, to, tooltip, ...props }: Props) {
  const [morphed, setMorphed] = useState(false)

  useEffect(() => {
    if (morphed) {
      const timeout = setTimeout(() => {
        setMorphed(false)
      }, 750)

      return () => clearTimeout(timeout)
    }
  }, [morphed])

  function handleClick(e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) {
    setMorphed(true)
    props.onClick?.(e as React.MouseEvent<HTMLButtonElement>)
  }

  const hasChildren = React.Children.count(props.children) > 0

  const button = (
    <Button className="self-stretch rounded-l-none rounded-r" {...props} onClick={handleClick}>
      <AnimatePresence mode="wait" initial={false}>
        {morphed ? (
          <motion.span
            key="to"
            className="flex items-center"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden">
            {to}
          </motion.span>
        ) : (
          <motion.span
            key="from"
            className="flex items-center"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden">
            {from}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )

  if (hasChildren) {
    return (
      <div
        className="flex flex-row gap-1"
        onClick={(e) => {
          e.stopPropagation()
          handleClick(e)
        }}>
        {React.Children.only(props.children)}
        {tooltip ? <Tooltip content={tooltip}>{button}</Tooltip> : button}
      </div>
    )
  }

  return tooltip ? <Tooltip content={tooltip}>{button}</Tooltip> : button
}

export { MorphedButton }
