import { render, screen, fireEvent } from "@testing-library/react";
import { MemoItem } from "../components/MemoItem";
import { Memo } from "../types/memo";

const mockMemo: Memo = {
  id: "1",
  transcript: "Test memo transcript",
  category: "journal",
  confidence: 0.8,
  needs_review: false,
  extracted: {
    title: "Test Title",
    what: "Test summary",
    who: ["John Doe"],
    when: "Today",
    where: "Home",
    actionable: false,
  },
  tags: ["test", "memo"],
  starred: false,
  size: "M",
  timestamp: new Date("2024-01-01"),
  deleted_at: null,
};

const defaultProps = {
  memo: mockMemo,
  isNew: false,
  filter: "all" as const,
  editingId: null,
  editText: "",
  setEditText: jest.fn(),
  startEdit: jest.fn(),
  cancelEdit: jest.fn(),
  saveEdit: jest.fn(),
  softDelete: jest.fn(),
  toggleStar: jest.fn(),
  restoreMemo: jest.fn(),
  hardDelete: jest.fn(),
  onCategoryChange: jest.fn(),
};

describe("MemoItem", () => {
  test("renders memo content correctly", () => {
    render(<MemoItem {...defaultProps} />);

    expect(screen.getByText("Test summary")).toBeInTheDocument();
    // The category is shown as a badge with an icon, not text
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  test("shows confidence indicator when expanded", () => {
    render(<MemoItem {...defaultProps} />);

    // Click to expand the memo
    const memoCard = screen.getByText("Test summary").closest("div");
    fireEvent.click(memoCard!);

    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  test("handles star toggle", () => {
    const toggleStar = jest.fn();
    render(<MemoItem {...defaultProps} toggleStar={toggleStar} />);

    // Find the star button (it's the last button in the actions)
    const buttons = screen.getAllByRole("button");
    const starButton = buttons[buttons.length - 1]; // Last button is the star
    fireEvent.click(starButton);

    expect(toggleStar).toHaveBeenCalledWith("1", false);
  });

  test("expands when clicked", () => {
    render(<MemoItem {...defaultProps} />);

    const memoCard = screen.getByText("Test summary").closest("div");
    fireEvent.click(memoCard!);

    // Should show full transcript when expanded
    expect(screen.getByText("Test memo transcript")).toBeInTheDocument();
  });

  test("shows extracted data when expanded", () => {
    render(<MemoItem {...defaultProps} />);

    const memoCard = screen.getByText("Test summary").closest("div");
    fireEvent.click(memoCard!);

    expect(screen.getByText("Title:")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("People:")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
