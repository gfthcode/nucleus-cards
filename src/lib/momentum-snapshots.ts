import { buildPlayerMomentum } from "@/lib/player-momentum";
import { players } from "@/lib/demo-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function generateDailyMomentumSnapshot() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  const analyses = await Promise.all(players.map((player) => buildPlayerMomentum(player)));
  const capturedAt = new Date().toISOString();
  const rows = analyses.map((analysis) => ({ player_id: analysis.playerId, momentum_score: analysis.momentumScore, performance_score: analysis.performanceScore, opportunity_score: analysis.opportunityScore, role_change_score: analysis.roleChangeScore, team_context_score: analysis.teamContextScore, development_score: analysis.developmentScore, news_score: analysis.newsMomentumScore, availability_score: analysis.availabilityScore, attention_score: analysis.attentionScore, data_quality_score: analysis.dataQualityScore, short_term_outlook: analysis.shortTermOutlook, medium_term_outlook: analysis.mediumTermOutlook, market_attention_outlook: analysis.marketAttentionOutlook, captured_at: capturedAt, source: analysis.source }));
  const { error } = await supabase.from("player_momentum_snapshots").insert(rows);
  if (error) throw error;
  return { capturedAt, playerCount: rows.length };
}
