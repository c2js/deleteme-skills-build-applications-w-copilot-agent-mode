import { CapabilityCard } from './CapabilityCard.js';
export default function Leaderboard() {
  return <CapabilityCard<{ teamName: string; totalPoints: number; rank: number }>
    title="Leaderboard" description="Compare team point totals."
    path="/api/leaderboard" dataKey="leaderboard" emptyText="No rankings yet."
    renderItem={(entry) => <>{entry.rank}. {entry.teamName}: {entry.totalPoints} points</>}
  />;
}
