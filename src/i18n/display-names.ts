import type { Locale } from "@/config/product";
import type { Player, Team } from "@/types/domain";

const teamEnglish: Record<string, string> = {
  "san-antonio-spurs": "San Antonio Spurs", "oklahoma-city-thunder": "Oklahoma City Thunder", "los-angeles-clippers": "Los Angeles Clippers", "los-angeles-lakers": "Los Angeles Lakers", "cleveland-cavaliers": "Cleveland Cavaliers", "chicago-bulls": "Chicago Bulls",
};

export function displayPlayerName(player: Player, locale: Locale) {
  return locale === "en" ? player.name : player.displayNameZh;
}

export function displayTeamName(team: Team | undefined, locale: Locale) {
  if (!team) return "";
  return locale === "en" ? teamEnglish[team.slug] ?? team.city + " " + team.abbreviation : team.name;
}

