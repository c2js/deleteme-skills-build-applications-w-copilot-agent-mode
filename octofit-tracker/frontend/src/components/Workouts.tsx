import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  return <CapabilityCard<{ title: string; reason: string }>
    title="Workout suggestions" description="Recommend workouts from activity patterns."
    path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    dataKey="suggestions" emptyText="No workout suggestions yet."
    renderItem={(workout) => <>{workout.title}: {workout.reason}</>}
  />;
}
