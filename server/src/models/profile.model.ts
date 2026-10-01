import mongoose, { Schema, Document } from 'mongoose';
import type { Profile } from '../types/profile.js';

const ProfileSchema = new Schema({
  basics: {
    name: { type: String, required: true },
    label: { type: String, default: '' },
    image: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    url: { type: String, default: '' },
    summary: { type: String, default: '' },
    location: {
      address: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      city: { type: String, default: '' },
      countryCode: { type: String, default: '' },
      region: { type: String, default: '' },
    },
    profiles: [{
      network: { type: String, default: '' },
      username: { type: String, default: '' },
      url: { type: String, default: '' },
    }],
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
  volunteer: [{
    organization: { type: String, required: true },
    position: { type: String, default: '' },
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
  awards: [{
    title: { type: String, required: true },
    date: { type: String, default: '' },
    awarder: { type: String, default: '' },
    summary: { type: String, default: '' },
  }],
  certificates: [{
    name: { type: String, required: true },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    url: { type: String, default: '' }
  }],
  publications: [{
    name: { type: String, required: true },
    publisher: { type: String, default: '' },
    releaseDate: { type: String, default: '' },
    url: { type: String, default: '' },
    summary: { type: String, default: '' },
  }],
  skills: [{
    name: { type: String, required: true },
    level: { type: String, default: '' },
    keywords: [{ type: String }]
  }],
  languages: [{
    language: { type: String, required: true },
    fluency: { type: String, default: '' },
  }],
  interests: [{
    name: { type: String, required: true },
    keywords: [{ type: String }]
  }],
  references: [{
    name: { type: String, required: true },
    reference: { type: String, default: '' },
  }],
  projects: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    url: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    highlights: [{ type: String }],
    roles: [{ type: String }],
    type: { type: String, default: '' },
  }],
});

ProfileSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
    for (const section of ['work', 'volunteer', 'education', 'awards',
      'certificates', 'publications', 'skills', 'languages', 'interests',
      'references', 'projects']) {
      ret[section]?.forEach((item: any) => delete item._id);
    }
    ret.basics?.profiles?.forEach((item: any) => delete item._id);
    return ret;
  }
});

export const ProfileModel = mongoose.model<Profile & Document>('Profile', ProfileSchema);
