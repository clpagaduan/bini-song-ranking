import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ranking from './models/Ranking';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bini-rankings';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/rankings/batch', async (req, res) => {
  try {
    const { results } = req.body;
    
    // Process each battle result
    for (const result of results) {
      // Update winner
      await Ranking.findOneAndUpdate(
        { songId: result.winner.id },
        { $inc: { wins: 1, battles: 1 } },
        { upsert: true }
      );
      
      // Update loser (only battles count)
      await Ranking.findOneAndUpdate(
        { songId: result.loser.id },
        { $inc: { battles: 1 } },
        { upsert: true }
      );
    }
    
    res.status(200).json({ message: 'Rankings updated successfully' });
  } catch (error) {
    console.error('Error updating rankings:', error);
    res.status(500).json({ error: 'Failed to update rankings' });
  }
});

app.get('/api/rankings', async (req, res) => {
  try {
    const rankings = await Ranking.find()
      .sort({ winRate: -1, battles: -1 })
      .limit(25);
    
    res.json(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 