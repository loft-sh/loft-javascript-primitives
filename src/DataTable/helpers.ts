import { TSelectOptionType } from "../Select/types"

type NameAndStatusFilter = {
  name: string
  status: TSelectOptionType[]
}

export type FilterValue = string | number | boolean | NameAndStatusFilter | unknown[]

export function isFilterSet(value: FilterValue): boolean {
  if (value === undefined || value === null) {
    return false
  }

  if (typeof value === "string") {
    return value.trim() !== ""
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  // Check NameAndStatusFilter / BareMetalNameFilter
  // TODO: Revamp filters to be more dynamic.
  if (typeof value === "object") {
    let hasKnownFilterField = false

    if ("name" in value) {
      hasKnownFilterField = true
      const name = (value as { name: unknown }).name
      if (typeof name === "string" && name.trim() !== "") {
        return true
      }
    }

    if ("status" in value) {
      hasKnownFilterField = true
      const status = (value as { status: unknown }).status
      if (Array.isArray(status) && status.length > 0) {
        return true
      }
    }

    if ("labels" in value) {
      hasKnownFilterField = true
      const labels = (value as { labels: unknown }).labels
      if (Array.isArray(labels) && labels.length > 0) {
        return true
      }
      if (
        labels != null &&
        typeof labels === "object" &&
        !Array.isArray(labels) &&
        Object.values(labels).some((values) => Array.isArray(values) && values.length > 0)
      ) {
        return true
      }
    }

    if ("assignment" in value && value.assignment !== undefined) {
      return true
    }
    if ("provider" in value && typeof value.provider === "string" && value.provider !== "") {
      return true
    }

    if (hasKnownFilterField) {
      return false
    }
  }

  return true
}
