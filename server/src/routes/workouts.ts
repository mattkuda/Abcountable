/* eslint-disable import/no-relative-packages */
/* eslint-disable import/no-unresolved */
import express, { Request, Response } from 'express';
import { MongoClient, Collection, ObjectId } from 'mongodb';
import authenticate, { AuthRequest } from '../middleware/authenticate';
import { TabataWorkout, TabataWorkoutWithUserInfo } from '../../../mobile/src/types/workouts';
import { User } from '../../../mobile/src/types/users';

const router = express.Router();
const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  throw new Error('MONGODB_URI environment variable is not set.');
}

// Connect to MongoDB
const client = new MongoClient(connectionString);

let workoutsCollection: Collection<TabataWorkout>;
let usersCollection: Collection<User>;

(async () => {
  try {
    await client.connect();
    workoutsCollection = client.db('AbcountableDB').collection<TabataWorkout>('workouts');
    usersCollection = client.db('AbcountableDB').collection<User>('users');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
})();

const addUserInfoToWorkouts = async (workouts: TabataWorkout[]):
 Promise<TabataWorkoutWithUserInfo[]> => Promise.all(workouts.map(async (workout) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(workout.userId) });

    if (!user) {
      return {
        ...workout,
        user: {
          username: 'Unknown',
          firstName: 'N/A',
          lastName: 'N/A',
          profilePictureUrl: 'default_image_url', // Replace with actual default image URL if applicable
        },
      };
    }

    return {
      ...workout,
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePictureUrl: user.profilePictureUrl,
      },
    };
  } catch (error) {
    console.error('Error fetching user info for workout', error);
    return {
      ...workout,
      user: {
        username: 'Error',
        firstName: 'N/A',
        lastName: 'N/A',
        profilePictureUrl: 'error_image_url', // Replace with actual error image URL if applicable
      },
    };
  }
}));

router.get('/', async (req: Request, res: Response) => {
  try {
    const offset = parseInt(req.query.offset as string, 10);
    const limit = parseInt(req.query.limit as string, 10);
    const workouts = await workoutsCollection.find({ isDiscoverable: true })
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    const workoutsWithUserInfo = await addUserInfoToWorkouts(workouts);
    res.send(workoutsWithUserInfo);
  } catch (err) {
    console.error('Failed to fetch workouts', err);
    res.status(500).send({ message: 'Failed to fetch workouts' });
  }
});

router.get('/workout/:workoutId', async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;
    const workout = await workoutsCollection.findOne({ _id: new ObjectId(workoutId) });

    if (!workout) {
      res.status(404).send({ message: 'Workout not found.' });
      return;
    }

    const workoutWithUserInfo = await addUserInfoToWorkouts([workout]);
    res.send(workoutWithUserInfo[0]);
  } catch (err) {
    console.error('Failed to fetch workout', err);
    res.status(500).send({ message: 'Failed to fetch workout' });
  }
});
// Gets a user's saved workouts
router.get('/my-saved', authenticate, async (req: AuthRequest, res: Response) => {
  const requestingUserId = req.userId;
  const offset = parseInt(req.query.offset as string, 10);
  const limit = parseInt(req.query.limit as string, 10);

  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(requestingUserId) });
    if (!user) {
      res.status(404).send({ message: 'User not found.' });
      return;
    }

    console.log('user.savedWorkouts', user.savedWorkouts);

    const workouts = await workoutsCollection.find({ _id: { $in: user.savedWorkouts ?? [] } })
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    const savedWorkoutsWithUserInfo = await addUserInfoToWorkouts(workouts);
    res.send(savedWorkoutsWithUserInfo);
  } catch (err) {
    console.error('Failed to fetch saved workouts', err);
    res.status(500).send({ message: 'Failed to fetch saved workouts' });
  }
});

const SUGGESTED_WORKOUT_IDS = ['6584d7972b6663ce1eb2cce8', '6584d7a12b6663ce1eb2cce9'];

// Endpoint to get suggested workouts
router.get('/suggested', async (req: Request, res: Response) => {
  try {
    // Convert string IDs to ObjectId instances for MongoDB querying
    const idsToFetch = SUGGESTED_WORKOUT_IDS.map((id: string) => new ObjectId(id));

    // Fetch workouts with the specified IDs
    const suggestedWorkouts = await workoutsCollection.find({
      _id: { $in: idsToFetch },
    }).toArray();

    // Optionally, add user info to these workouts if needed
    const suggestedWorkoutsWithUserInfo = await addUserInfoToWorkouts(suggestedWorkouts);

    res.send(suggestedWorkoutsWithUserInfo);
  } catch (err) {
    console.error('Failed to fetch suggested workouts', err);
    res.status(500).send({ message: 'Failed to fetch suggested workouts' });
  }
});

router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  const { workout } = req.body;
  const { userId } = req;

  delete workout._id;
  workout.userId = userId;

  try {
    // Insert the new workout
    const result = await workoutsCollection.insertOne(workout);

    // Add the created workout to the user's createdWorkouts
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { createdWorkouts: new ObjectId(result.insertedId) } },
    );

    res.status(201).send({ message: 'TabataWorkout created successfully' });
  } catch (err) {
    console.error('Failed to create workout', err);
    res.status(500).send({ message: 'Failed to create workout' });
  }
});

router.post('/save', authenticate, async (req: AuthRequest, res: Response) => {
  const { workoutId } = req.body;
  const { userId } = req;

  try {
    // Add the workout to the user's savedWorkouts
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { savedWorkouts: new ObjectId(workoutId) } },
    );

    res.status(201).send({ message: 'Workout saved successfully' });
  } catch (err) {
    console.error('Failed to save workout', err);
    res.status(500).send({ message: 'Failed to save workout' });
  }
});

router.delete('/:workoutId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { workoutId } = req.params;
    const requestingUserId = req.userId;
    const { userId } = req;
    const workoutToDelete = await workoutsCollection.findOne(
      {
        _id: new ObjectId(workoutId),
        userId: requestingUserId,
      },
    );

    if (!workoutToDelete) {
      res.status(404).send({ message: 'Workout not found or you do not have permission to delete it.' });
      return;
    }

    if (workoutToDelete?.userId !== userId) {
      res.status(403).send({ message: 'You do not have permission to delete this workout.' });
      return;
    }

    await workoutsCollection.deleteOne({ _id: new ObjectId(workoutId) });
    res.status(200).send({ message: 'Workout deleted successfully.' });
  } catch (err) {
    console.error('Failed to delete workout', err);
    res.status(500).send({ message: 'Failed to delete workout' });
  }
});

router.post('/:workoutId', authenticate, async (req: AuthRequest, res: Response) => {
  const { workoutId } = req.params;
  const newWorkoutData = req.body;
  const { userId } = req;
  delete newWorkoutData._id;

  try {
    // First, find the existing workout to check ownership
    const existingWorkout = await workoutsCollection.findOne({ _id: new ObjectId(workoutId) });
    if (!existingWorkout) {
      res.status(404).send({ message: 'Workout not found' });
      return;
    }

    // Check if the authenticated user is the owner of the workout
    if (existingWorkout.userId.toString() !== userId) {
      res.status(403).send({ message: 'Not authorized to update this workout' });
      return;
    }

    // Mark the old workout as non-discoverable
    await workoutsCollection.updateOne(
      { _id: new ObjectId(workoutId) },
      { $set: { isDiscoverable: false } },
    );

    // Create a new workout version with updated data
    const newWorkout = {
      ...newWorkoutData,
      userId: new ObjectId(userId),
      originalWorkout: new ObjectId(workoutId), // Reference to the original workout
      createdAt: new Date().toISOString(),
      isDiscoverable: true, // New workout is discoverable
    };

    await workoutsCollection.insertOne(newWorkout);

    // Return the new workout
    res.status(201).send({ message: 'TabataWorkout saved successfully' });
  } catch (err) {
    console.error('Failed to update workout', err);
    res.status(500).send({ message: 'Failed to update workout' });
  }
});

router.post('/saveAllSuggested', authenticate, async (req: AuthRequest, res: Response) => {
  const { userId } = req;

  try {
    // Here, map each workoutId to a save operation
    const saveOperations = SUGGESTED_WORKOUT_IDS.map((id) => ({
      userId: new ObjectId(userId),
      workoutId: new ObjectId(id),
      savedDate: new Date(), // Example field, adjust based on your schema
    }));

    // Assuming you have a collection for saved workouts
    await client.db('AbcountableDB').collection('savedWorkouts').insertMany(saveOperations);

    res.status(201).send({ message: 'Workouts saved successfully' });
  } catch (err) {
    console.error('Failed to save multiple workouts', err);
    res.status(500).send({ message: 'Failed to save multiple workouts' });
  }
});

export default router;
