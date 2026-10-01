import mongoose, { Schema, Document } from 'mongoose';
import type { Profile } from '../types/profile.js';

const ProfileSchema = new Schema({
  basics: {
    name: { type: String, required: true },
    label: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    url: { type: String, default: '' },
    summary: { type: String, default: '' },
  },
  work: [{
    name: { type: String, required: true },
    position: { type: String, required: true },
    url: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    summary: { type: String, default: '' },
    highlights: [{ type: String }]
  }],
  education: [{
    institution: { type: String, required: true },
    area: { type: String, default: '' },
    studyType: { type: String, default: '' },
    url: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    score: { type: String, default: '' },
    courses: [{ type: String }]
  }],
  skills: [{
    name: { type: String, required: true },
    level: { type: String, default: '' },
    keywords: [{ type: String }]
  }],
  projects: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    url: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    highlights: [{ type: String }]
  }],
  certificates: [{
    name: { type: String, required: true },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    url: { type: String, default: '' }
  }]
});

ProfileSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
    ret.work?.forEach((item: any) => delete item._id);
    ret.education?.forEach((item: any) => delete item._id);
    ret.skills?.forEach((item: any) => delete item._id);
    ret.projects?.forEach((item: any) => delete item._id);
    ret.certificates?.forEach((item: any) => delete item._id);
    return ret;
  }
});

export const ProfileModel = mongoose.model<Profile & Document>('Profile', ProfileSchema);
