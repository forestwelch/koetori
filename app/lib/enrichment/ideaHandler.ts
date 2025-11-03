import { IdeaEnrichmentPayload } from "../pipeline/types";
import { EnrichmentJobResult, IdeaItemDraft } from "./types";

const DEFAULT_TITLE = "Untitled idea";

export async function handleIdeaTask(
  payload: IdeaEnrichmentPayload
): Promise<EnrichmentJobResult> {
  const title =
    payload.title ??
    extractFromPayload(payload, ["title", "what", "idea"]) ??
    payload.transcriptExcerpt?.substring(0, 100) ??
    DEFAULT_TITLE;

  const description =
    payload.description ??
    extractFromPayload(payload, ["description", "details", "summary"]) ??
    payload.transcriptExcerpt ??
    null;

  const category =
    payload.category ??
    extractFromPayload(payload, ["category", "type"]) ??
    inferCategory(payload, title, description) ??
    null;

  // Use tags from the memo
  const tags =
    payload.tags && Array.isArray(payload.tags)
      ? payload.tags.filter((tag): tag is string => typeof tag === "string")
      : null;

  const draft: IdeaItemDraft = {
    title,
    description,
    category,
    tags: tags && tags.length > 0 ? tags : null,
  };

  return {
    status: "completed",
    type: "idea",
    draft,
    payload,
  };
}

function extractFromPayload(
  payload: IdeaEnrichmentPayload,
  keys: string[]
): string | null {
  if (payload.extracted) {
    for (const key of keys) {
      const value = payload.extracted[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }
  }

  return null;
}

function inferCategory(
  payload: IdeaEnrichmentPayload,
  title: string,
  description: string | null
): string | null {
  const allText = [
    title.toLowerCase(),
    description?.toLowerCase() || "",
    payload.transcriptExcerpt?.toLowerCase() || "",
    ...(payload.tags || []).map((tag) => tag.toLowerCase()),
  ].join(" ");

  const categoryKeywords: Record<string, string[]> = {
    product: ["product", "app", "tool", "service", "platform", "software"],
    feature: ["feature", "functionality", "capability", "add", "implement"],
    project: ["project", "build", "create", "develop", "start"],
    creative: ["art", "creative", "design", "artistic", "aesthetic", "visual"],
    business: [
      "business",
      "company",
      "startup",
      "venture",
      "revenue",
      "profit",
    ],
    technical: [
      "code",
      "algorithm",
      "technical",
      "engineering",
      "system",
      "architecture",
    ],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => allText.includes(keyword))) {
      return category;
    }
  }

  return null;
}
