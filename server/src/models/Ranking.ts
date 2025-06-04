import mongoose from 'mongoose';

const rankingSchema = new mongoose.Schema({
  songId: {
    type: String,
    required: true,
    index: true
  },
  wins: {
    type: Number,
    default: 0
  },
  battles: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add index for efficient querying
rankingSchema.index({ songId: 1 });

// Add virtual for win rate
rankingSchema.virtual('winRate').get(function() {
  return this.battles > 0 ? this.wins / this.battles : 0;
});

export interface IRanking extends mongoose.Document {
  songId: string;
  wins: number;
  battles: number;
  timestamp: Date;
  winRate: number;
}

export default mongoose.model<IRanking>('Ranking', rankingSchema); 