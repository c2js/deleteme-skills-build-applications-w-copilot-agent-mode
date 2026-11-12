import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadLeaderboard = () => getJson<{ leaderboard: { teamName: string; totalPoints: number; rank: number }[] }>('/api/leaderboard')
  .then(({ leaderboard }) => leaderboard);

export default function Leaderboard() {
  return <CapabilityCard
    title="Leaderboard" description="Compare team point totals."
    loadItems={loadLeaderboard} emptyText="No rankings yet."
    renderItem={(entry) => <>{entry.rank}. {entry.teamName}: {entry.totalPoints} points</>}
  />;
}
