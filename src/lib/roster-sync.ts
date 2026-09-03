import type {
  MembershipVerification,
  Player,
  PlayerTeamMembership,
  RosterType,
  Team,
} from "@/types/domain";
import {
  getCurrentTeamPlayers,
  getTeam,
  playerTeamMemberships,
  players,
} from "@/lib/demo-data";

export type RosterProvider = "demo" | "sportradar";

export interface RosterSourceStatus {
  provider: RosterProvider;
  label: string;
  authorization: "official-api" | "demo";
  configured: boolean;
  endpoint: string;
  message: string;
}

export interface NormalizedRosterPlayer {
  sourcePlayerId: string;
  officialReferenceId?: string;
  fullName: string;
  jerseyNumber?: string;
  position?: string;
  rookieYear?: number;
  rosterType: RosterType;
  sourceStatus: string;
  sourceUpdatedAt?: string;
}

export interface NormalizedRoster {
  provider: RosterProvider;
  teamExternalId: string;
  fetchedAt: string;
  players: NormalizedRosterPlayer[];
  sourceUpdatedAt?: string;
}

export interface MembershipSyncPlan {
  generatedAt: string;
  teamId: string;
  provider: RosterProvider;
  upserts: PlayerTeamMembership[];
  closures: PlayerTeamMembership[];
  unmatched: NormalizedRosterPlayer[];
}

const SPORTRADAR_BASE_URL = "https://api.sportradar.com/nba";

function configuredProvider(): RosterProvider {
  return process.env.NBA_ROSTER_PROVIDER === "sportradar" &&
    Boolean(process.env.SPORTRADAR_API_KEY?.trim())
    ? "sportradar"
    : "demo";
}

export function getRosterSourceStatus(): RosterSourceStatus {
  const requestedProvider = process.env.NBA_ROSTER_PROVIDER;
  const hasKey = Boolean(process.env.SPORTRADAR_API_KEY?.trim());
  const configured = configuredProvider() === "sportradar";

  if (configured) {
    return {
      provider: "sportradar",
      label: "Sportradar NBA 官方数据",
      authorization: "official-api",
      configured: true,
      endpoint: `${SPORTRADAR_BASE_URL}/{access_level}/v8/{language_code}/teams/{team_id}/profile.json`,
      message: "阵容由授权 NBA API 提供；仅在服务器端读取密钥。",
    };
  }

  return {
    provider: "demo",
    label: "演示 Membership 投影",
    authorization: "demo",
    configured: false,
    endpoint: `${SPORTRADAR_BASE_URL}/{access_level}/v8/{language_code}/teams/{team_id}/profile.json`,
    message:
      requestedProvider === "sportradar" && !hasKey
        ? "已选择 Sportradar，但尚未配置 SPORTRADAR_API_KEY；当前安全回退到演示数据。"
        : "尚未选择授权阵容源；当前使用演示 Membership。",
  };
}

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function rosterTypeFromStatus(status: string): RosterType {
  switch (status.toUpperCase()) {
    case "TWO-WAY":
      return "two_way";
    case "IR":
      return "injured";
    case "SUS":
      return "inactive";
    case "M-LEAGUE":
      return "g_league_assignment";
    case "TEN-DAY":
      return "10_day";
    case "EXHIBIT-10":
      return "exhibit_10";
    case "NWT":
      return "waived";
    case "FA":
      return "free_agent";
    default:
      return "active";
  }
}

function findPlayerArray(value: unknown): Record<string, unknown>[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    const records = value.filter(
      (item): item is Record<string, unknown> =>
        Boolean(item && typeof item === "object" && !Array.isArray(item)),
    );
    if (
      records.some(
        (record) =>
          typeof record.full_name === "string" ||
          typeof record.first_name === "string",
      )
    ) {
      return records;
    }
    return records.flatMap(findPlayerArray);
  }
  return Object.values(value).flatMap(findPlayerArray);
}

function findTeamRecords(value: unknown): Record<string, unknown>[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(findTeamRecords);
  const record = value as Record<string, unknown>;
  const own =
    (typeof record.alias === "string" || typeof record.name === "string") &&
    (typeof record.id === "string" || typeof record.sr_id === "string")
      ? [record]
      : [];
  return [...own, ...Object.values(record).flatMap(findTeamRecords)];
}

function findExternalTeamId(payload: unknown, team: Team) {
  const target = team.abbreviation.toLowerCase();
  const targetName = team.name.toLowerCase();
  const match = findTeamRecords(payload).find((record) => {
    const alias = String(record.alias ?? "").toLowerCase();
    const name = String(record.name ?? "").toLowerCase();
    return alias === target || name === targetName || name.includes(targetName);
  });
  return match ? String(match.id ?? match.sr_id) : undefined;
}

function normalizeRoster(payload: unknown, teamExternalId: string): NormalizedRoster {
  const rawPlayers = findPlayerArray(payload);
  const seen = new Set<string>();
  const normalized = rawPlayers.flatMap((record) => {
    const fullName = String(
      record.full_name ??
        [record.first_name, record.last_name, record.name_suffix]
          .filter(Boolean)
          .join(" "),
    ).trim();
    const sourcePlayerId = String(
      record.id ?? record.sr_id ?? record.reference ?? "",
    );
    if (!fullName || !sourcePlayerId || seen.has(sourcePlayerId)) return [];
    seen.add(sourcePlayerId);
    const sourceStatus = String(record.status ?? "ACT");
    const rookieYear = Number(record.rookie_year);
    return [
      {
        sourcePlayerId,
        officialReferenceId: record.reference
          ? String(record.reference)
          : undefined,
        fullName,
        jerseyNumber: record.jersey_number
          ? String(record.jersey_number)
          : undefined,
        position: record.primary_position
          ? String(record.primary_position)
          : record.position
            ? String(record.position)
            : undefined,
        rookieYear: Number.isFinite(rookieYear) ? rookieYear : undefined,
        rosterType: rosterTypeFromStatus(sourceStatus),
        sourceStatus,
        sourceUpdatedAt: record.updated ? String(record.updated) : undefined,
      },
    ];
  });

  return {
    provider: "sportradar",
    teamExternalId,
    fetchedAt: new Date().toISOString(),
    players: normalized,
  };
}

async function sportradarJson(path: string) {
  const apiKey = process.env.SPORTRADAR_API_KEY?.trim();
  if (!apiKey) throw new Error("SPORTRADAR_API_KEY 未配置");
  const response = await fetch(`${SPORTRADAR_BASE_URL}${path}`, {
    headers: { accept: "application/json", "x-api-key": apiKey },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Sportradar 请求失败（HTTP ${response.status}）`);
  }
  return response.json() as Promise<unknown>;
}

async function fetchSportradarRoster(team: Team): Promise<NormalizedRoster> {
  const accessLevel = process.env.SPORTRADAR_ACCESS_LEVEL === "production" ? "production" : "trial";
  const language = process.env.SPORTRADAR_LANGUAGE || "zh";
  let externalTeamId = team.nbaTeamId;
  if (!externalTeamId) {
    const hierarchy = await sportradarJson(
      `/${accessLevel}/v8/${language}/league/hierarchy.json`,
    );
    externalTeamId = findExternalTeamId(hierarchy, team);
  }
  if (!externalTeamId) {
    throw new Error(`无法在 Sportradar League Hierarchy 中匹配 ${team.abbreviation}`);
  }
  const payload = await sportradarJson(
    `/${accessLevel}/v8/${language}/teams/${encodeURIComponent(externalTeamId)}/profile.json`,
  );
  return normalizeRoster(payload, externalTeamId);
}

function matchedPlayer(rosterPlayer: NormalizedRosterPlayer): Player | undefined {
  const normalized = normalizeName(rosterPlayer.fullName);
  return players.find((player) => normalizeName(player.name) === normalized);
}

function isCurrentRosterType(rosterType: RosterType) {
  return [
    "active",
    "two_way",
    "injured",
    "inactive",
    "g_league_assignment",
    "10_day",
    "exhibit_10",
  ].includes(rosterType);
}

export function buildMembershipSyncPlan({
  teamId,
  roster,
  existing = playerTeamMemberships,
  now = new Date().toISOString(),
}: {
  teamId: string;
  roster: NormalizedRoster;
  existing?: PlayerTeamMembership[];
  now?: string;
}): MembershipSyncPlan {
  const matched = roster.players
    .map((rosterPlayer) => ({ rosterPlayer, player: matchedPlayer(rosterPlayer) }))
    .filter(
      (entry): entry is { rosterPlayer: NormalizedRosterPlayer; player: Player } =>
        Boolean(entry.player),
    );
  const unmatched = roster.players.filter(
    (rosterPlayer) => !matched.some((entry) => entry.rosterPlayer.sourcePlayerId === rosterPlayer.sourcePlayerId),
  );
  const incomingIds = new Set(matched.map((entry) => entry.player.id));
  const current = existing.filter(
    (membership) =>
      membership.teamId === teamId &&
      membership.status === "active" &&
      isCurrentRosterType(membership.rosterType),
  );
  const closures = current
    .filter((membership) => !incomingIds.has(membership.playerId))
    .map((membership) => ({
      ...membership,
      status: "ended" as const,
      endDate: now,
      lastVerifiedAt: now,
      verificationStatus: "verified" as MembershipVerification,
    }));
  const upserts = matched.map(({ rosterPlayer, player }) => {
    const previous = current.find((membership) => membership.playerId === player.id);
    return {
      id: previous?.id ?? `membership-${player.id}-${teamId}`,
      playerId: player.id,
      teamId,
      status: "active" as const,
      startDate: previous?.startDate ?? now,
      endDate: undefined,
      jerseyNumber: rosterPlayer.jerseyNumber,
      rosterType: rosterPlayer.rosterType,
      source: "sportradar",
      lastVerifiedAt: now,
      verificationStatus: "verified" as MembershipVerification,
    };
  });
  return {
    generatedAt: now,
    teamId,
    provider: roster.provider,
    upserts,
    closures,
    unmatched,
  };
}

export async function getTeamRosterSnapshot(team: Team) {
  const source = getRosterSourceStatus();
  if (source.configured && source.provider === "sportradar") {
    try {
      const roster = await fetchSportradarRoster(team);
      const plan = buildMembershipSyncPlan({ teamId: team.id, roster });
      const playerIds = new Set(plan.upserts.map((membership) => membership.playerId));
      return {
        source,
        roster,
        plan,
        players: players.filter((player) => playerIds.has(player.id)),
        error: undefined,
      };
    } catch (error) {
      return {
        source: { ...source, message: error instanceof Error ? error.message : source.message },
        roster: undefined,
        plan: undefined,
        players: getCurrentTeamPlayers(team.id),
        error: error instanceof Error ? error.message : "授权阵容源暂时不可用",
      };
    }
  }
  return {
    source,
    roster: undefined,
    plan: undefined,
    players: getCurrentTeamPlayers(team.id),
    error: undefined,
  };
}

export function getTeamByParam(value: string) {
  return getTeam(value);
}
