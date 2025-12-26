# 🐘 Elephant Puzzle

A multiplayer creativity game where players sort quotes and titles into the phases of the creative process. Built with Next.js, TypeScript, and Supabase for realtime multiplayer functionality.

## 🎮 Game Features

- **Multiplayer Gameplay**: Real-time synchronization between players
- **Creative Process Phases**: Sort content into Preparation, Incubation, Illumination, and Verification
- **Game Master & Player Roles**: Separate experiences for teachers/facilitators and students
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Score Tracking**: Leaderboard with persistent scores via Supabase
- **Custom Creative Moments**: Players can add their own puzzle pieces

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/elephant-puzzle.git
   cd elephant-puzzle/webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase** (see `SUPABASE_SETUP.md` for detailed instructions)
   - Create a new Supabase project
   - Run the database migration
   - Copy your API keys to `.env.local`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Game Master: `http://localhost:3000/gm`
   - Players: `http://localhost:3000/player`

## 🎯 How to Play

### Game Master
1. Go to `/gm` and enter your name and room ID
2. Copy the shareable player link
3. Share the link with players to join your room
4. Monitor progress and reset rounds if needed

### Players
1. Click the shared link from Game Master or go to `/player`
2. Enter your name and join the room
3. Add your "creative moment" (optional)
4. Drag titles first, then quotes to correct phases
5. Race against the timer!

## 🏗️ Project Structure

```
webapp/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── gm/             # Game Master page (/gm)
│   │   ├── player/         # Player page (/player)
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main game page (/)
│   ├── components/         # React components
│   ├── data/              # Game data (quotes, piece styles)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities (Supabase client)
│   └── types/             # TypeScript type definitions
├── supabase/
│   └── migrations/        # Database schema
└── public/                # Static assets
```

## 🗄️ Database Schema

The app uses Supabase with the following tables:
- `games` - Game rooms/sessions
- `players` - Players in each game
- `placements` - Where players placed pieces
- `scores` - Leaderboard scores
- `puzzle_pieces` - Available puzzle pieces

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Add Environment Variables**
   In Vercel dashboard → Project Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. Build the app: `npm run build`
2. Deploy the `.next` folder to your hosting provider
3. Set environment variables as above

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Creative process model inspired by Graham Wallas
- Built with Next.js, Supabase, and Tailwind CSS
- Icons from Heroicons

---

**Happy puzzling! 🎨**
