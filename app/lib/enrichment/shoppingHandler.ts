import { ShoppingEnrichmentPayload } from "../pipeline/types";
import { EnrichmentJobResult, ShoppingListItemDraft } from "./types";

const DEFAULT_ITEM = "Untitled item";

export async function handleShoppingTask(
  payload: ShoppingEnrichmentPayload
): Promise<EnrichmentJobResult> {
  const itemName =
    payload.itemNameGuess ??
    extractFromPayload(payload, ["title", "item", "product", "what"]);

  const draft: ShoppingListItemDraft = {
    itemName: itemName ?? DEFAULT_ITEM,
    quantity:
      payload.quantityGuess ??
      extractFromPayload(payload, ["quantity", "count", "amount"]),
    category:
      payload.categoryGuess ??
      extractFromPayload(payload, ["category", "type"]),
    urgencyScore: payload.urgencyScore ?? null,
  };

  return {
    status: "completed",
    type: "shopping",
    draft,
    payload,
  };
}

function extractFromPayload(
  payload: ShoppingEnrichmentPayload,
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

  if (payload.tags) {
    const match = payload.tags.find((tag) => keys.includes(tag.toLowerCase()));
    if (match) {
      return match;
    }
  }

  return null;
}
