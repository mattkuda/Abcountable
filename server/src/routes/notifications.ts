import express, { Response } from 'express';
import { MongoClient, Collection, ObjectId } from 'mongodb';
// eslint-disable-next-line import/no-relative-packages
import { NotificationSchema } from '../../../mobile/src/types/notifications';

import authenticate, { AuthRequest } from '../middleware/authenticate';

const router = express.Router();
const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  throw new Error('MONGODB_URI environment variable is not set.');
}

const client = new MongoClient(connectionString);

let notificationsCollection: Collection<NotificationSchema>;

(async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    notificationsCollection = client.db('AbcountableDB').collection<NotificationSchema>('notifications');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
})();

// Fetch notifications for a user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { userId } = req;

  try {
    const notifications = await notificationsCollection.find(
      { recipientUserId: new ObjectId(userId) },
    )
      .sort({ createdAt: -1 }).toArray();
    res.send(notifications);
  } catch (err) {
    console.error('Failed to fetch notifications', err);
    res.status(500).send({ message: 'Failed to fetch notifications' });
  }
});

// Create a notification
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { type, targetId, initiatorUserId } = req.body;
  const recipientUserId = req.userId;

  const newNotification = {
    type,
    targetId,
    initiatorUserId: new ObjectId(initiatorUserId),
    recipientUserId: new ObjectId(recipientUserId),
    createdAt: new Date(),
    read: false,
  } as NotificationSchema;

  try {
    await notificationsCollection.insertOne(newNotification);
    res.status(201).send({ message: 'Notification created successfully' });
  } catch (err) {
    console.error('Failed to create notification', err);
    res.status(500).send({ message: 'Failed to create notification' });
  }
});

export default router;
