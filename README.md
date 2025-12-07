# Volvera Platform

A comprehensive full-stack multilingual contract management system for content creators, built with Next.js, MongoDB, and modern web technologies.

## 🌟 Features

### Core Features
- ✅ **Multilingual Support**: English, Persian (Farsi), and Pashto with RTL support
- ✅ **User Authentication**: JWT-based auth with email verification, password reset, and OAuth (Google/Facebook)
- ✅ **Digital Contract Management**: Create, submit, and track contracts in multiple languages
- ✅ **Auto-Translation**: Automatic translation from Persian/Pashto to English (with manual review option)
- ✅ **File Upload System**: Secure file uploads with categorization and admin approval
- ✅ **PDF Generation**: Generate professional contract PDFs
- ✅ **User Dashboard**: Track contracts, files, and notifications
- ✅ **Admin Dashboard**: Manage users, contracts, files, and send notifications
- ✅ **Email Notifications**: Automated emails for verification, password reset, and contract status
- ✅ **Responsive Design**: Mobile-first, fully responsive UI
- ✅ **Dark Theme**: Modern dark UI with gradient accents
- ✅ **Animations**: Smooth transitions and micro-animations with Framer Motion

### Security Features
- 🔒 Password hashing with bcrypt
- 🔒 JWT token-based authentication
- 🔒 Email verification
- 🔒 Rate limiting on API routes
- 🔒 Input validation and sanitization
- 🔒 Role-based access control (User/Admin)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Internationalization**: i18next, react-i18next
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, NextAuth (OAuth)
- **Email**: Nodemailer
- **File Upload**: Multer
- **PDF Generation**: jsPDF
- **Validation**: Joi

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Gmail account (for email sending) or other SMTP service
- Google OAuth credentials (optional)
- Facebook OAuth credentials (optional)

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd creator-partnership
npm install
```

### 2. Environment Configuration

Copy the `env.template` file and create `.env.local`:

```bash
# On Windows
copy env.template .env.local

# On Mac/Linux
cp env.template .env.local
```

Edit `.env.local` and fill in your actual values:

**Required:**
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Another secret for refresh tokens
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: Gmail app-specific password
- `NEXTAUTH_SECRET`: Secret for NextAuth

**Optional (for OAuth):**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`

**Optional (for auto-translation):**
- `GOOGLE_TRANSLATE_API_KEY` or `DEEPL_API_KEY`

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally and start the service
mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and add it to `.env.local`

### 4. Gmail App Password (for emails)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this password in `EMAIL_PASSWORD` in `.env.local`

### 5. OAuth Setup (Optional)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

**Facebook OAuth:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and Secret to `.env.local`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
creator-partnership/
├── public/
│   ├── locales/          # Translation files
│   │   ├── en/
│   │   ├── fa/
│   │   └── ps/
│   └── uploads/          # User uploaded files
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # Authentication endpoints
│   │   │   ├── contracts/
│   │   │   ├── files/
│   │   │   ├── users/
│   │   │   └── admin/
│   │   ├── (auth)/       # Auth pages (login, register, etc.)
│   │   ├── (protected)/  # Protected routes (dashboard, admin)
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js       # Homepage
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── layout/       # Layout components (Header, Footer)
│   │   ├── forms/        # Form components
│   │   └── dashboard/    # Dashboard components
│   ├── contexts/         # React contexts
│   │   └── LanguageContext.js
│   ├── lib/              # Libraries and configurations
│   │   ├── mongodb.js
│   │   └── i18n.js
│   ├── middleware/       # Custom middleware
│   │   └── auth.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Contract.js
│   │   ├── File.js
│   │   └── Notification.js
│   └── utils/            # Utility functions
│       ├── jwt.js
│       ├── email.js
│       ├── translate.js
│       └── pdf.js
├── .gitignore
├── env.template          # Environment variables template
├── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh` - Refresh access token

### Contracts
- `GET /api/contracts` - Get user's contracts
- `POST /api/contracts` - Create new contract
- `GET /api/contracts/[id]` - Get contract details
- `PUT /api/contracts/[id]` - Update contract
- `DELETE /api/contracts/[id]` - Delete contract
- `GET /api/contracts/[id]/pdf` - Download contract PDF

### Files
- `GET /api/files` - Get user's files
- `POST /api/files/upload` - Upload file
- `GET /api/files/[id]` - Get file details
- `DELETE /api/files/[id]` - Delete file
- `GET /api/files/templates` - Get template files

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/contracts` - Get all contracts
- `PUT /api/admin/contracts/[id]` - Update contract status
- `GET /api/admin/files` - Get all files
- `POST /api/admin/notifications` - Send notification

## 🎨 Customization

### Theme Colors
Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --bg: #0a0a0f;
  --card: #1a1a2e;
  --accent: #667eea;
  /* ... more variables */
}
```

### Adding New Languages
1. Create a new JSON file in `public/locales/[language-code]/common.json`
2. Add the language to `src/lib/i18n.js`
3. Add the language option to the Header component

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 📝 Usage

### For Users
1. Register an account or login with Google/Facebook
2. Verify your email
3. Fill out the partnership contract form
4. Upload supporting documents
5. Track your contract status in the dashboard
6. Download approved contracts as PDF

### For Admins
1. Login with admin account
2. Access admin dashboard
3. Review and approve/reject contracts
4. Manage user accounts
5. Upload template files
6. Send notifications to users

## 🔧 Development

### Create Admin User

After first user registration, manually update the user in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string format
- Whitelist your IP in MongoDB Atlas

### Email Not Sending
- Verify Gmail app password
- Check EMAIL_HOST and EMAIL_PORT
- Ensure 2FA is enabled on Gmail

### OAuth Not Working
- Verify redirect URIs match exactly
- Check client ID and secret
- Ensure OAuth consent screen is configured

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@creatorpartnership.com

## 🎯 Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Multi-file upload with drag & drop
- [ ] Contract templates library
- [ ] Integration with payment gateways
- [ ] Mobile app (React Native)
- [ ] Video call integration for contract discussions
- [ ] AI-powered contract review

---

Built with ❤️ for content creators worldwide
