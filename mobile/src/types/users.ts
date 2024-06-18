import mongoose from 'mongoose';

export interface User {
    _id: mongoose.Types.ObjectId | string;
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    city?: string;
    state?: string;
    gender?: string;
    birthday?: string;
    weight?: number;
    profilePictureUrl?: string;
    createdAt: string;
    updatedAt: string;
    savedWorkouts?: mongoose.Types.ObjectId[]; // Add saved workouts
    createdWorkouts?: mongoose.Types.ObjectId[]; // Add created workouts

}

export interface UserFullInfoModel extends User {
    followersCount: number;
    followingCount: number;
}
