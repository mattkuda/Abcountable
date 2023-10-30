import mongoose from 'mongoose';

export interface User {
    _id: mongoose.Types.ObjectId | string;
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    createdAt: string;
    updatedAt: string;
}
