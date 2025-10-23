import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "../page";
import { UserProvider } from "../contexts/UserContext";

// Mock Supabase
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      insert: jest.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  },
}));

// Mock the voice recorder hook
jest.mock("../hooks/useVoiceRecorder", () => ({
  useVoiceRecorder: () => ({
    isRecording: false,
    isProcessing: false,
    error: null,
    transcription: null,
    category: null,
    confidence: null,
    needsReview: false,
    extracted: null,
    tags: [],
    memoId: null,
    recordingTime: 0,
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    cancelRecording: jest.fn(),
    clearTranscription: jest.fn(),
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>{children}</UserProvider>
    </QueryClientProvider>
  );
};

describe("Memo Operations", () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "testuser"),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("renders main app when user is logged in", async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("koetori")).toBeInTheDocument();
    });
  });

  test("shows username input when no user is logged in", async () => {
    // Mock no username
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome to")).toBeInTheDocument();
    });
  });

  test("handles keyboard shortcuts correctly", async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("koetori")).toBeInTheDocument();
    });

    // Test that space bar doesn't cause issues when not recording
    fireEvent.keyDown(document, { code: "Space" });
    // Should not throw any errors
  });
});
