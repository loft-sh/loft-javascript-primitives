import { twMerge } from "tailwind-merge"

type ClassValue = ClassArray | ClassDictionary | string | number | null | boolean | undefined
type ClassDictionary = Record<string, any>
type ClassArray = ClassValue[]

function toVal(mix: any) {
  let k,
    y,
    str = ""

  if (typeof mix === "string" || typeof mix === "number") {
    str += mix
  } else if (typeof mix === "object") {
    if (Array.isArray(mix)) {
      const len = mix.length
      for (k = 0; k < len; k++) {
        if (mix[k]) {
          if ((y = toVal(mix[k]))) {
            str && (str += " ")
            str += y
          }
        }
      }
    } else {
      for (y in mix) {
        if (mix[y]) {
          str && (str += " ")
          str += y
        }
      }
    }
  }

  return str
}

export function cx(...inputs: ClassValue[]): string
export function cx() {
  let i = 0,
    tmp,
    x,
    str = "",
    // eslint-disable-next-line prefer-const
    len = arguments.length
  for (; i < len; i++) {
    // eslint-disable-next-line prefer-rest-params
    if ((tmp = arguments[i])) {
      if ((x = toVal(tmp))) {
        str && (str += " ")
        str += x
      }
    }
  }

  return str
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(cx(inputs))
}

export default cn
