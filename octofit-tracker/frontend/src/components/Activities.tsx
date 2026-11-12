import { CapabilityCard } from './CapabilityCard.js';
export default function Activities() {
  return <CapabilityCard<{ type: string; minutes: number; points: number }>
    title="Activities" description="Track student activity minutes and points."
    path="/api/activities" dataKey="activities" emptyText="No activities yet."
    renderItem={(activity) => <>{activity.type}: {activity.minutes} minutes, {activity.points} points</>}
  />;
}
