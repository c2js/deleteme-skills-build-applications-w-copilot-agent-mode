import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadTeams = () => getJson<{ teams: { name: string; members: string[] }[] }>('/api/teams')
  .then(({ teams }) => teams);

export default function Teams() {
  return <CapabilityCard
    title="Teams" description="Manage teams and members."
    loadItems={loadTeams} emptyText="No teams yet."
    renderItem={(team) => <>{team.name}: {team.members.length} members</>}
  />;
}
