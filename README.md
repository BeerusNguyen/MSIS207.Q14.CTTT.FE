# Recipe Finder - Frontend 🍳

React-based frontend application for Recipe Finder and Meal Planner with user authentication.

## 🚀 Tech Stack

- **React** 18.3.1
- **React Router** 6.24.1 - Client-side routing
- **Axios** 1.7.2 - API calls
- **React Icons** 5.2.1 - Icon library
- **Context API** - State management (Auth, Modal)

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
│   └── manifest.json
├── src/
│   ├── api/             # API integration
│   │   ├── favoritesApi.js
│   │   ├── mealPlanApi.js
│   │   ├── shoppingListApi.js
│   │   ├── fetchRecipe.js
│   │   └── ...
│   ├── components/      # Reusable components
│   │   ├── Modal.jsx
│   │   └── Modal.css
│   ├── context/         # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ModalContext.jsx
│   ├── App.js           # Main app with routing
│   ├── Header.jsx       # Navigation header
│   ├── Home.jsx         # Landing page
│   ├── Login.jsx        # Login page
│   ├── Register.jsx     # Registration page
│   ├── ForgotPassword.jsx
│   ├── ResetPassword.jsx
│   ├── Explore.jsx      # Recipe exploration
│   ├── SavedRecipe.jsx  # Favorites page
│   ├── MealPlannerPage.jsx
│   ├── ShoppingListPage.jsx
│   ├── ProtectedRoute.jsx # Auth guard
│   └── index.js         # Entry point
└── package.json
```

## 🌟 Features

- 🔐 **User Authentication**
  - Register/Login with JWT
  - Forgot/Reset Password via email
  - Protected routes

- 🔍 **Recipe Search** 
  - Search recipes from MealDB & Edamam APIs
  - Filter by category, diet type

- 📖 **Recipe Details** 
  - View detailed recipe information
  - Ingredients, instructions, video

- ❤️ **Favorites** 
  - Save favorite recipes
  - Persist to user account

- 🗓️ **Meal Planner** 
  - Plan weekly meals
  - Organize by meal type (breakfast, lunch, dinner)

- 🛒 **Shopping List** 
  - Create shopping lists
  - Check off items

- 🥗 **Diet Categories** 
  - Low carb recipes
  - Weight gain recipes

## 🔌 API Integration

Frontend connects to backend API at `http://localhost:3000`

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Recipes
- `GET /recipes` - Get all recipes
- `GET /recipes/:id` - Get single recipe

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:recipeId` - Remove favorite

### Meal Planner
- `GET /api/meal-plans` - Get meal plans
- `POST /api/meal-plans` - Add meal
- `PUT /api/meal-plans/:id` - Update meal
- `DELETE /api/meal-plans/:id` - Remove meal

### Shopping List
- `GET /api/shopping-list` - Get items
- `POST /api/shopping-list` - Add item
- `PUT /api/shopping-list/:id` - Update item
- `DELETE /api/shopping-list/:id` - Delete item
- `DELETE /api/shopping-list` - Clear all

## 🎨 Pages

- **Home** (`/`) - Landing page
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration
- **Forgot Password** (`/forgot-password`) - Password reset request
- **Reset Password** (`/reset-password/:token`) - Password reset form
- **Explore** (`/explore`) - Browse recipes
- **Recipe Detail** (`/recipe/:id`) - Recipe details
- **Saved Recipes** (`/saved`) - User's favorites (🔒 Protected)
- **Meal Planner** (`/meal-planner`) - Weekly planner (🔒 Protected)
- **Shopping List** (`/shopping-list`) - Shopping list (🔒 Protected)
- **About** (`/about`) - About page

## 🔐 Authentication Flow

1. User registers or logs in
2. JWT token stored in localStorage
3. AuthContext provides user state globally
4. ProtectedRoute guards authenticated pages
5. Token sent in Authorization header for API calls

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

- Recipe Finder Team

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
