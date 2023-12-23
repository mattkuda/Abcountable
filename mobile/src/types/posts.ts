import mongoose from 'mongoose';
import { TabataWorkout } from './workouts';

export interface PostComment {
    _id?: mongoose.Types.ObjectId | string;
    userId: string;
    body: string;
    createdAt: string;
}

export interface PostSchema {
    _id: mongoose.Types.ObjectId | string;
    userId: mongoose.Types.ObjectId | string;
    workout: TabataWorkout;
    createdAt: string;
    updatedAt: string;
    title: string;
    description: string;
    likes: mongoose.Types.ObjectId[];
    comments: PostComment[];
}

export interface UserPostInfo {
    username: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
}

export interface PostModel {
    _id: mongoose.Types.ObjectId | string;
    userId: mongoose.Types.ObjectId | string;
    user: UserPostInfo;
    workout: TabataWorkout;
    createdAt: string;
    updatedAt: string;
    title: string;
    description: string;
    likes: mongoose.Types.ObjectId[];
    comments: PostComment[];
}
