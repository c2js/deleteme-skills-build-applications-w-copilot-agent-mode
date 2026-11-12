import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadWorkouts = () => getJson<{ suggestions: { title: string; reason: string }[] }>(
  `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`,
).then(({ suggestions }) => suggestions);

export default function Workouts() {
  return <CapabilityCard
    title="Workout suggestions" description="Recommend workouts from activity patterns."
    loadItems={loadWorkouts} emptyText="No workout suggestions yet."
    renderItem={(workout) => <>{workout.title}: {workout.reason}</>}
  />;
}
