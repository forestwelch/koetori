import { createRequestId } from "../pipeline/pipeline";
import { CaptureService } from "../pipeline/interfaces";
import { CaptureReceipt, CaptureRequest } from "../pipeline/types";

export class DefaultCaptureService implements CaptureService {
  async receive(request: CaptureRequest): Promise<CaptureReceipt> {
    if (!request.metadata.username) {
      throw new Error("Username is required for capture requests");
    }

    const normalizedUsername = request.metadata.username.trim().toLowerCase();
    const requestId = request.metadata.requestId ?? createRequestId();

    return {
      normalizedUsername,
      requestId,
      receivedAt: new Date(),
    };
  }
}
