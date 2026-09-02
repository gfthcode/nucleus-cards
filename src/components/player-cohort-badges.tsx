import { getPlayerTags } from "@/lib/player-cohorts";
import type { Player } from "@/types/domain";

export function PlayerCohortBadges({
  player,
  compact = false,
}: {
  player: Player;
  compact?: boolean;
}) {
  return (
    <span
      className={`cohort-badges ${compact ? "compact" : ""}`}
      aria-label="球员分类与市场标签"
    >
      {getPlayerTags(player).map((tag, index) => (
        <i className={index === 0 ? `cohort-${player.cohort}` : ""} key={tag}>
          {tag}
        </i>
      ))}
    </span>
  );
}
