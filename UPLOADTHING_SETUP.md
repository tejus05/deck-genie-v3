# UploadThing Integration Setup Guide

This document outlines the steps to complete the UploadThing integration after Phase 1 setup.

## Phase 1 Completed ✅

The following files have been created/modified:

### Backend
- ✅ `backend/requirements.txt` - Added UploadThing dependency
- ✅ `backend/services/uploadthing.py` - UploadThing service
- ✅ `backend/.env.example` - Environment variable template

### Frontend
- ✅ `frontend/package.json` - Added UploadThing React packages
- ✅ `frontend/lib/uploadthing.ts` - Client configuration (placeholder)
- ✅ `frontend/lib/uploadthing-types.ts` - Type definitions
- ✅ `frontend/lib/uploadthing-core.ts` - Core configuration (placeholder)
- ✅ `frontend/app/api/uploadthing/route.ts` - API route (placeholder)
- ✅ `frontend/.env.example` - Environment variable template

## Next Steps

### 1. Install Dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 2. Set Up UploadThing Account
1. Go to https://uploadthing.com/dashboard
2. Create a new app
3. Get your API keys

### 3. Configure Environment Variables

**Backend (.env):**
```bash
# Add to your existing .env file
UPLOADTHING_SECRET=your_uploadthing_secret_key_here
```

**Frontend (.env.local):**
```bash
# Create this file
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_UPLOADTHING_APP_ID=your_uploadthing_app_id_here
```

### 4. Update Configuration Files

After installing packages, uncomment and modify:
- `frontend/lib/uploadthing.ts`
- `frontend/lib/uploadthing-core.ts` 
- `frontend/app/api/uploadthing/route.ts`

## Ready for Phase 2

Once dependencies are installed and environment variables are set, you can proceed to:
- **Phase 2**: Database Schema Updates
- **Phase 3**: Backend Service Layer Updates

## Files to Modify in Next Phases

### Phase 2 - Database Updates
- `backend/auth/models.py` - Add UploadThing fields to Presentation model
- Database migration files

### Phase 3 - Backend Integration
- `backend/services/file_manager.py` - Integrate UploadThing uploads
- `backend/api/routers/presentation/handlers/export_as_pptx.py` - Use UploadThing
- `backend/api/routers/presentation/handlers/download_pptx.py` - Serve from UploadThing
- `backend/routers/files.py` - Update file management endpoints

## Testing

After setup, test with:
1. Create a new presentation
2. Verify it uploads to UploadThing
3. Check user-specific presentation listing
4. Test download functionality
