import EllipsisOutlined from "@ant-design/icons/EllipsisOutlined"
import React from "react"

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  IconButton,
} from "@loft-enterprise/primitives"

type TItem = { name: string; onClick: () => void }

type Props = {
  children: React.ReactNode
  onClick?: () => void
  items: TItem[]
}

export const DropdownButton = ({ children, items, onClick }: Props) => {
  return (
    <div className="flex flex-row items-center gap-0.5">
      <Button onClick={onClick} className="rounded-e-none">
        {children}
      </Button>
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton className="rounded-e-md rounded-s-none p-[0.5rem]">
              <EllipsisOutlined />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-fit">
            <div className="flex flex-col p-1">
              {items.map((item, index) => {
                return (
                  <Button className="justify-start" variant="ghost" key={index} {...item}>
                    {item.name}
                  </Button>
                )
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
