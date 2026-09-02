import type { Player, PlayerCohort } from "@/types/domain";

export const cohortLabels: Record<PlayerCohort, string> = {
  core_rookie: "核心新秀",
  recent_rookie: "2020—2024 近年新秀",
  young_core: "年轻核心",
  prime: "当打之年",
  veteran: "老将",
  retired_legend: "退役传奇",
};

export function getPlayerCohortLabel(player: Player) {
  if (player.cohort === "core_rookie" && player.draftYear >= 2025)
    return `${player.draftYear} 核心新秀`;
  return cohortLabels[player.cohort];
}

export function isRecentDraftClass(player: Player) {
  return player.draftYear >= 2020 && player.draftYear <= 2024;
}

export function getPlayerTags(player: Player) {
  return [
    getPlayerCohortLabel(player),
    player.isCoreRookie ? "核心新秀" : null,
    player.isRolePlayer ? "角色球员" : null,
    player.isTradeHot ? "交易热门" : null,
    player.isSigningHot ? "签约热门" : null,
    player.injuryStatus !== "healthy" ? "伤病观察" : null,
  ].filter((tag, index, tags): tag is string =>
    Boolean(tag && tags.indexOf(tag) === index),
  );
}
