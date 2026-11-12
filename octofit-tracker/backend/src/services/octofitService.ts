import { isObjectIdOrHexString } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid activity'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (typeof userId !== 'string' || !isObjectIdOrHexString(userId)
    || typeof teamId !== 'string' || !isObjectIdOrHexString(teamId)
    || typeof type !== 'string' || !type.trim()
    || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('Invalid activity'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) {
    throw Object.assign(new Error('User or team not found'), { status: 400 });
  }

  return Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid team'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()
    || typeof mascot !== 'string' || !mascot.trim()
    || !Array.isArray(members)
    || !members.every((member: unknown) => typeof member === 'string' && isObjectIdOrHexString(member))) {
    throw Object.assign(new Error('Invalid team'), { status: 400 });
  }

  return Team.create({ name, mascot, members });
}

export async function getLeaderboard() {
  const entries = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1, _id: 1 } },
    { $project: { _id: 0, teamId: '$_id', teamName: '$team.name', totalPoints: 1 } },
  ]);
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activity] = await Activity.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: '$type', totalMinutes: { $sum: '$minutes' } } },
    { $sort: { totalMinutes: -1, _id: 1 } },
    { $limit: 1 },
  ]);
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    swim: 'endurance',
    walk: 'endurance',
    strength: 'strength',
    yoga: 'flexibility',
  };
  const focus = (activity && activityFocus[activity._id]) || user.fitnessGoal;
  const workouts = await Workout.find({ focus }).lean();
  return workouts.map((workout) => ({
    ...workout,
    reason: activity
      ? `Matches your ${activity._id} activity pattern and ${focus} focus.`
      : `Matches your ${focus} fitness goal.`,
  }));
}

export { User };
