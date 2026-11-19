import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getDateRangeString } from "./DateRangePicker"

describe("getDateRangeString", () => {
  describe("undefined/null input handling", () => {
    it("should return 'Select date range' when dateRange is undefined", () => {
      const result = getDateRangeString(undefined)
      expect(result).toBe("Select date range")
    })

    it("should return 'Any time' when from is undefined", () => {
      const result = getDateRangeString({ from: undefined, to: new Date() })
      expect(result).toBe("Any time")
    })

    it("should return 'Any time' when to is undefined", () => {
      const result = getDateRangeString({ from: new Date(), to: undefined })
      expect(result).toBe("Any time")
    })
  })

  describe("single day detection", () => {
    let mockNow: Date

    beforeEach(() => {
      mockNow = new Date("2024-06-15T12:00:00Z")
      vi.useFakeTimers()
      vi.setSystemTime(mockNow)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("should return 'Today' for today's date", () => {
      const today = new Date("2024-06-15T10:00:00Z")
      const result = getDateRangeString({ from: today, to: today })
      expect(result).toBe("Today")
    })

    it("should return 'Yesterday' for yesterday's date", () => {
      const yesterday = new Date("2024-06-14T10:00:00Z")
      const result = getDateRangeString({ from: yesterday, to: yesterday })
      expect(result).toBe("Yesterday")
    })

    it("should return 'Tomorrow' for tomorrow's date", () => {
      const tomorrow = new Date("2024-06-16T10:00:00Z")
      const result = getDateRangeString({ from: tomorrow, to: tomorrow })
      expect(result).toBe("Tomorrow")
    })

    it("should return formatted date for other single days in current year", () => {
      const otherDay = new Date("2024-03-20T10:00:00Z")
      const result = getDateRangeString({ from: otherDay, to: otherDay })
      expect(result).toBe("Mar 20")
    })

    it("should include year for single days in different year", () => {
      const pastYear = new Date("2023-03-20T10:00:00Z")
      const result = getDateRangeString({ from: pastYear, to: pastYear })
      expect(result).toBe("Mar 20, 2023")
    })
  })

  describe("date range strings - real UI patterns", () => {
    let mockNow: Date

    beforeEach(() => {
      mockNow = new Date("2024-06-15T12:00:00Z")
      vi.useFakeTimers()
      vi.setSystemTime(mockNow)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("should return formatted range for backward ranges", () => {
      const from = new Date("2024-06-10T10:00:00Z")
      const to = new Date("2024-06-15T10:00:00Z")
      const result = getDateRangeString({ from, to })
      expect(result).toBe("Jun 10 to Today")
    })

    it("should return 'Next N days' for forward ranges starting today", () => {
      const today = new Date("2024-06-15T10:00:00Z")
      const fiveDaysLater = new Date("2024-06-20T10:00:00Z")
      const result = getDateRangeString({ from: today, to: fiveDaysLater })
      expect(result).toBe("Next 5 days")
    })

    it("should format small ranges (<=7 days) that don't end/start today", () => {
      const from = new Date("2024-06-10T10:00:00Z")
      const to = new Date("2024-06-13T10:00:00Z")
      const result = getDateRangeString({ from, to })
      expect(result).toBe("Jun 10 to Jun 13")
    })

    it("should format longer ranges (>7 days) with full date format", () => {
      const from = new Date("2024-06-01T10:00:00Z")
      const to = new Date("2024-06-20T10:00:00Z")
      const result = getDateRangeString({ from, to })
      expect(result).toBe("Jun 1 to Jun 20")
    })

    it("should use Today/Yesterday/Tomorrow in range endpoints", () => {
      const yesterday = new Date("2024-06-14T10:00:00Z")
      const today = new Date("2024-06-15T10:00:00Z")
      const result = getDateRangeString({ from: yesterday, to: today })
      expect(result).toBe("Yesterday to Today")
    })
  })

  describe("year boundary logic", () => {
    let mockNow: Date

    beforeEach(() => {
      mockNow = new Date("2024-06-15T12:00:00Z")
      vi.useFakeTimers()
      vi.setSystemTime(mockNow)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("should show year for dates in a different year in range", () => {
      const from = new Date("2023-12-20T10:00:00Z")
      const to = new Date("2024-01-05T10:00:00Z")
      const result = getDateRangeString({ from, to })
      expect(result).toContain("2023")
    })

    it("should not show year when both dates are in current year", () => {
      const from = new Date("2024-03-01T10:00:00Z")
      const to = new Date("2024-03-15T10:00:00Z")
      const result = getDateRangeString({ from, to })
      expect(result).not.toContain("2024")
    })
  })
})
