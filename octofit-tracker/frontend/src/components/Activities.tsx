import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadActivities = () => getJson<{ activities: { type: string; minutes: number; points: number }[] }>('/api/activities')
  .then(({ activities }) => activities);

export default function Activities() {
  return <CapabilityCard
    title="Activities" description="Track student activity minutes and points."
    loadItems={loadActivities} emptyText="No activities yet."
    renderItem={(activity) => <>{activity.type}: {activity.minutes} minutes, {activity.points} points</>}
  />;
}
