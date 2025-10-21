import { render } from "@testing-library/react";
import { StatusMessage } from "../StatusMessage";

describe("StatusMessage Component", () => {
  it("renders idle state correctly", () => {
    const { container } = render(
      <StatusMessage
        isRecording={false}
        isProcessing={false}
        recordingTime={0}
      />
    );

    // Snapshot test - captures the entire rendered output
    // If anything changes, Jest will show you the diff
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders recording state correctly", () => {
    const { container } = render(
      <StatusMessage
        isRecording={true}
        isProcessing={false}
        recordingTime={15}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders processing state correctly", () => {
    const { container } = render(
      <StatusMessage
        isRecording={false}
        isProcessing={true}
        recordingTime={0}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  // Behavior test - checks that the component works correctly
  it("formats recording time correctly", () => {
    const { getByText } = render(
      <StatusMessage
        isRecording={true}
        isProcessing={false}
        recordingTime={75} // 1 minute 15 seconds
      />
    );

    // Check that "1:15" appears in the document
    expect(getByText(/1:15/)).toBeInTheDocument();
  });
});
