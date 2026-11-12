import { CapabilityCard } from './CapabilityCard.js';
export default function Teams() {
  return <CapabilityCard<{ name: string; members: string[] }>
    title="Teams" description="Manage teams and members."
    path="/api/teams" dataKey="teams" emptyText="No teams yet."
    renderItem={(team) => <>{team.name}: {team.members.length} members</>}
  />;
}
