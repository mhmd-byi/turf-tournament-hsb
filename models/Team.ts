import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer {
  name: string;
  isCaptain: boolean;
}

export interface ITeam extends Document {
  teamName: string;
  captainPhone: string;
  players: IPlayer[];
  paymentScreenshot: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema({
  name: { type: String, required: true },
  isCaptain: { type: Boolean, default: false },
});

const TeamSchema = new Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Please provide a team name'],
      trim: true,
    },
    captainPhone: {
      type: String,
      required: [true, 'Please provide captain phone number'],
      validate: {
        validator: function (v: string) {
          return /^[0-9]{10}$/.test(v);
        },
        message: 'Phone number must be 10 digits',
      },
    },
    players: {
      type: [PlayerSchema],
      validate: {
        validator: function (v: IPlayer[]) {
          return v.length === 8;
        },
        message: 'A team must have exactly 8 players',
      },
    },
    paymentScreenshot: {
      type: String,
      required: [true, 'Please upload payment screenshot'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
