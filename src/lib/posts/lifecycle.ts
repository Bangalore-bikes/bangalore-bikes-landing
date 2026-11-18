export type TrustLevel = 0 | 1 | 2;

export const TRUST_RULES = {
  promoteAt: 3,
  veteranAt: 10,
  demoteAt: 2,
} as const;

/** Trust decides who reviews a submission, never whether it is safe to render. */
export function decideSubmitStatus(
  trustLevel: TrustLevel,
): "pending" | "published" {
  return trustLevel >= 1 ? "published" : "pending";
}

export type TrustInput = {
  approvedCount: number;
  rejectedCount: number;
  isModerator: boolean;
};

/**
 * Mirrored by the SQL in the repository and enforced by a test, so a promotion
 * cannot depend on which layer happened to run.
 */
export function decideTrust({
  approvedCount,
  rejectedCount,
  isModerator,
}: TrustInput): TrustLevel {
  if (isModerator) return 2;
  if (rejectedCount >= TRUST_RULES.demoteAt) return 0;
  if (approvedCount >= TRUST_RULES.veteranAt) return 2;
  if (approvedCount >= TRUST_RULES.promoteAt) return 1;
  return 0;
}
