import EllipsisOutlined from "@ant-design/icons/EllipsisOutlined"
import React from "react"

import cn from "../clsx"
import { Button, ButtonProps } from "./Button"
import { Chip } from "./Chip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu"
import { IconButton, IconButtonProps } from "./IconButton"

type TItem = { name: string; onClick: () => void; tag?: string }

type Props = {
  children: React.ReactNode
  onClick?: () => void
  items: TItem[]
  containerClassName?: string
  customTriggerIcon?: React.ReactNode
  buttonProps?: ButtonProps
  buttonClassName?: string
  iconButtonProps?: IconButtonProps
  iconButtonClassName?: string
  itemsClassName?: string
}

export const DropdownButton = ({
  children,
  items,
  onClick,
  containerClassName,
  customTriggerIcon,
  buttonProps,
  buttonClassName,
  iconButtonProps,
  iconButtonClassName,
  itemsClassName,
}: Props) => {
  return (
    <div className={cn("flex flex-row items-center gap-0.5", containerClassName)}>
      <Button onClick={onClick} className={cn("rounded-e-none", buttonClassName)} {...buttonProps}>
        {children}
      </Button>
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              className={cn("rounded-e-md rounded-s-none p-[0.5rem]", iconButtonClassName)}
              {...iconButtonProps}>
              {customTriggerIcon || <EllipsisOutlined />}
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-fit">
            {items.map((item, index) => {
              return (
                <DropdownMenuItem
                  className={cn("cursor-pointer justify-start gap-2", itemsClassName)}
                  key={index}
                  onSelect={item.onClick}>
                  {item.name}{" "}
                  {item.tag && (
                    <Chip size="small" appearance="primary" className="py-0">
                      {item.tag}
                    </Chip>
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
