import { render } from "@testing-library/react";
import { RecordButton } from "../RecordButton";

// Mock functions for testing
const mockOnStart = jest.fn();
const mockOnStop = jest.fn();

describe("RecordButton Component", () => {
  beforeEach(() => {
    // Clear mock functions before each test
    mockOnStart.mockClear();
    mockOnStop.mockClear();
  });

  it("renders idle state correctly", () => {
    const { container } = render(
      <RecordButton
        isRecording={false}
        isProcessing={false}
        onStart={mockOnStart}
        onStop={mockOnStop}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders recording state correctly", () => {
    const { container } = render(
      <RecordButton
        isRecording={true}
        isProcessing={false}
        onStart={mockOnStart}
        onStop={mockOnStop}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders processing state correctly", () => {
    const { container } = render(
      <RecordButton
        isRecording={false}
        isProcessing={true}
        onStart={mockOnStart}
        onStop={mockOnStop}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
