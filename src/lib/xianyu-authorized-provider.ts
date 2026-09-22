export const xianyuAuthorizedProvider = {
  id: "xianyu-authorized",
  status: "DISABLED" as const,
  message: "Xianyu authorized source not configured.",
  allowedFutureInputs: ["official-api", "partner-feed", "authorized-csv", "manual-authorized-export"] as const,
};
