# Recipe Finder - Frontend 🍳

React-based frontend application for Recipe Finder and Meal Planner.

## 🚀 Tech Stack

- **React** 18.3.1
- **React Router** 6.24.1 - Client-side routing
- **Axios** 1.7.2 - API calls
- **React Icons** 5.2.1 - Icon library

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000`

## 🛠️ Installation

1. Clone repository:
```bash
git clone <your-frontend-repo-url>
cd Recipe-Finder-FE
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoint (if needed):
Update the API base URL in `src/api/` files to point to your backend.

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm start
```
Application will run at `http://localhost:3001`

### Build for Production
```bash
npm run build
```
Creates optimized production build in `build/` folder.

### Run Tests
```bash
npm test
```

## 📁 Project Structure

```
Recipe-Finder-FE/
├── public/              # Static files
│   ├── index.html
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── api/            # API integration
│   │   ├── fetchRecipe.js
│   │   ├── fetchNutrition.js
│   │   ├── fetchSaved.js
│   │   └── ...
│   ├── components/     # React components
│   │   ├── Header.jsx
│   │   ├── Home.jsx
│   │   ├── Explore.jsx
│   │   ├── SavedRecipe.jsx
│   │   └── ...
│   ├── App.js          # Main app component
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
└── package.json
```

## 🌟 Features

- 🔍 **Recipe Search** - Search recipes from multiple APIs
- 📖 **Recipe Details** - View detailed recipe information
- 💾 **Save Recipes** - Save favorite recipes to database
- 🥗 **Meal Planner** - Plan daily/weekly meals
- 📊 **Nutrition Info** - View nutritional information
- 🎯 **Diet Categories** - Low carb, weight gain, etc.

## 🔌 API Integration

Frontend connects to backend API at `http://localhost:3000`

Key endpoints used:
- `GET /recipes` - Get all recipes
- `GET /recipes/:id` - Get single recipe
- `POST /recipes` - Save new recipe
- `DELETE /recipes/:id` - Delete recipe
- `GET /recipes/:id/nutrition` - Get nutrition data

## 🎨 Pages

- **Home** (`/`) - Landing page
- **Explore** (`/explore`) - Browse recipes
- **Saved Recipes** (`/saved`) - View saved recipes
- **Meal Planner** (`/meal-planner`) - Plan meals
- **About** (`/about`) - About page

## 🌐 Environment Variables

Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:3000
```

## 📦 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload build/ folder to Netlify
```

## 👥 Authors

- Your Name
- Team Member Name (if applicable)

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: Make sure the backend API is running before starting the frontend.
