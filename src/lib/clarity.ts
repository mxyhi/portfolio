type ClarityModule = typeof import("@microsoft/clarity");

const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

let clarityModulePromise: Promise<ClarityModule["default"]> | null = null;
let clarityInitializationPromise: Promise<ClarityModule["default"]> | null = null;

function loadClarity() {
  if (!clarityProjectId || typeof window === "undefined") {
    return null;
  }

  clarityModulePromise ??= import("@microsoft/clarity").then(
    (module) => module.default
  );

  return clarityModulePromise;
}

function normalizeClarityEventPart(part: string) {
  return part
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function buildClarityEventName(...parts: string[]) {
  return parts
    .map(normalizeClarityEventPart)
    .filter(Boolean)
    .join("_");
}

export function initializeClarity() {
  const projectId = clarityProjectId;

  clarityInitializationPromise ??= (() => {
    if (!projectId) {
      return null;
    }

    const clarity = loadClarity();

    if (!clarity) {
      return null;
    }

    return clarity.then((clarityClient) => {
      clarityClient.init(projectId);
      return clarityClient;
    });
  })();

  return clarityInitializationPromise;
}

export function trackClarityEvent(eventName: string) {
  const clarity = initializeClarity();

  if (!clarity || !eventName) {
    return;
  }

  void clarity.then((clarityClient) => {
    clarityClient.event(eventName);
  });
}
