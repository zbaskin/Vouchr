import { describe, it, expect } from "vitest";
import { filterTicketItems } from "../ticketService";

describe("filterTicketItems", () => {
  it("returns an empty array when given undefined", () => {
    expect(filterTicketItems(undefined)).toEqual([]);
  });

  it("returns an empty array when given null", () => {
    expect(filterTicketItems(null)).toEqual([]);
  });

  it("returns an empty array when given an empty array", () => {
    expect(filterTicketItems([])).toEqual([]);
  });

  it("removes null entries from the array", () => {
    const items = [{ id: "1" }, null, { id: "2" }, null];
    expect(filterTicketItems(items)).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("removes undefined entries from the array", () => {
    const items = [{ id: "1" }, undefined, { id: "2" }];
    expect(filterTicketItems(items)).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("returns all entries unchanged when none are null", () => {
    const items = [{ id: "1", name: "Dune" }, { id: "2", name: "Oppenheimer" }];
    expect(filterTicketItems(items)).toEqual(items);
  });

  it("handles an array that is entirely null values", () => {
    expect(filterTicketItems([null, null, null])).toEqual([]);
  });
});
