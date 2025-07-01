# DeckGenie v3 - Authentication System

## Overview

This document describes the scalable authentication system implemented for the DeckGenie v3 application, which includes Next.js frontend and FastAPI backend with PostgreSQL database integration.

## Features Implemented

### 🔐 Authentication System
- **JWT-based authentication** with secure token management
- **User registration and login** with email/password
- **Password hashing** using bcrypt for security
- **Protected routes** on both frontend and backend
- **Automatic token refresh** and session management
- **Secure cookie storage** for authentication tokens

### 👤 User Management
- **User profiles** with editable information
- **User-specific file storage** and management
- **Presentation ownership** and access control
- **Account statistics** and activity tracking

### 🗄️ Database Integration
- **PostgreSQL database** with SQLModel/SQLAlchemy ORM
- **Database migrations** with Alembic
- **User, Presentation, and UserFile models**
- **Relationship management** between users and their content

### 📁 File Management System
- **User-specific file storage** in organized directories
- **File upload/download/delete** operations
- **Presentation and file ownership** tracking
- **Secure file access** with user authentication

## Architecture

### Backend (FastAPI)

#### Authentication Routes (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT token)
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update user profile

#### File Management Routes (`/files`)
- `POST /files/upload` - Upload files (protected)
- `GET /files/my-files` - Get user's files (protected)
- `GET /files/my-presentations` - Get user's presentations (protected)
- `GET /files/download/{file_id}` - Download file (protected)
- `DELETE /files/delete/{file_id}` - Delete file (protected)

#### Database Models
```python
# User model with relationships
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    presentations: List["Presentation"] = Relationship(back_populates="owner")
    files: List["UserFile"] = Relationship(back_populates="owner")

# Presentation model for user-specific storage
class Presentation(PresentationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    file_path: str
    owner: User = Relationship(back_populates="presentations")

# File management model
class UserFile(UserFileBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    file_path: str
    owner: User = Relationship(back_populates="files")
```

### Frontend (Next.js)

#### Authentication Context
- **Global authentication state** management with React Context
- **Automatic token handling** and user session management
- **Login/logout functionality** with proper state updates
- **User data persistence** across page refreshes

#### Protected Routes
- **ProtectedRoute component** for securing pages
- **Automatic redirect** to login for unauthenticated users
- **Loading states** during authentication checks

#### User Interface
- **Login/Register pages** with form validation
- **Profile page** with editable user information
- **Dashboard** with user-specific files and presentations
- **Navigation** with user menu and logout functionality

## File Structure

### Backend
```
backend/
├── auth/
│   ├── models.py          # User, Presentation, UserFile models
│   ├── utils.py           # JWT and password utilities
│   ├── middleware.py      # Authentication middleware
│   └── routes.py          # Authentication endpoints
├── routers/
│   └── files.py           # File management endpoints
├── services/
│   ├── database.py        # Database connection and session
│   └── file_manager.py    # File storage management
├── api/
│   └── main.py           # FastAPI app with routers
├── requirements.txt       # Python dependencies
└── .env.example          # Environment variables template
```

### Frontend
```
frontend/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── register/page.tsx     # Registration page
│   ├── profile/page.tsx          # User profile page
│   ├── dashboard/page.tsx        # User dashboard
│   ├── (presentation-generator)/
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Authentication context
│   │   └── components/
│   │       └── UserAccount.tsx   # User menu component
│   └── providers.tsx             # Global providers
├── components/
│   └── ProtectedRoute.tsx        # Route protection component
├── services/
│   └── auth.ts                   # API service for auth
└── package.json                  # Dependencies
```

## Setup Instructions

### 1. Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb deckgenie_v3
   
   # Run migrations
   alembic upgrade head
   ```

4. **Start the server:**
   ```bash
   uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/deckgenie_v3
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Security Features

### Password Security
- **Bcrypt hashing** with automatic salt generation
- **Password strength** validation on frontend
- **Secure password updates** with confirmation

### Token Security
- **JWT tokens** with expiration
- **Secure HTTP-only cookies** (production)
- **Automatic token refresh** before expiration
- **Token validation** on protected routes

### Route Protection
- **Backend middleware** validates tokens on protected endpoints
- **Frontend route guards** redirect unauthenticated users
- **CORS configuration** for secure cross-origin requests

## User Experience Features

### Authentication Flow
1. **Registration** with email verification
2. **Login** with remember me option
3. **Automatic session restoration** on page reload
4. **Graceful logout** with token cleanup

### Profile Management
- **Editable user information** (name, email)
- **Password change** functionality
- **Account statistics** display
- **User avatar** with initials

### File Management
- **Drag-and-drop file upload**
- **File type validation** and size limits
- **Progress indicators** during upload
- **User-specific file organization**
- **Download and delete** capabilities

## API Integration

### Authentication Headers
All protected API calls automatically include:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Error Handling
- **401 Unauthorized** - Automatic redirect to login
- **403 Forbidden** - Access denied message
- **400 Bad Request** - Form validation errors
- **500 Server Error** - Generic error handling

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Deployment Considerations

### Production Environment
- **HTTPS enforcement** for secure token transmission
- **Environment-specific configuration**
- **Database connection pooling**
- **File storage optimization**

### Security Checklist
- ✅ Password hashing with bcrypt
- ✅ JWT token expiration
- ✅ Secure cookie configuration
- ✅ CORS policy configuration
- ✅ Input validation and sanitization
- ✅ Protected route middleware
- ✅ Database query protection

## Future Enhancements

### Planned Features
- **Email verification** for new registrations
- **Password reset** functionality
- **Two-factor authentication** (2FA)
- **Social login** (Google, GitHub)
- **User roles and permissions**
- **Audit logging** for security events

### Performance Optimizations
- **Redis caching** for session data
- **Database indexing** optimization
- **File compression** and CDN integration
- **Rate limiting** for API endpoints

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check PostgreSQL service status
   - Verify database credentials in .env
   - Ensure database exists

2. **Token authentication failures**
   - Check SECRET_KEY configuration
   - Verify token expiration settings
   - Clear browser cookies and try again

3. **File upload issues**
   - Check file size limits
   - Verify directory permissions
   - Ensure disk space availability

### Logging
- **Backend logs** available in console output
- **Frontend errors** in browser developer tools
- **Database queries** logged in development mode

## Support

For issues or questions regarding the authentication system:
1. Check the troubleshooting section above
2. Review the API documentation
3. Examine error logs for specific error messages
4. Contact the development team with detailed information

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Author:** DeckGenie Development Team
