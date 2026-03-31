# Job Portal Backend (Node + Express + MySQL)

Backend-only project for:
- Job posting
- Resume upload
- Job search filters
- Apply to jobs
- Application tracking
- Saved jobs
- Recruiter dashboard
- Email notification + in-app notification
- Authorization with roles (`admin`, `recruiter`, `job_seeker`)

## 1) Setup

1. Copy environment file:
   - `cp .env.example .env` (or create `.env` manually on Windows)
2. Update `.env` values:
   - MySQL credentials
   - `JWT_SECRET`
   - Gmail `EMAIL_USER` + App Password (`EMAIL_PASS`) for email sending
3. Create DB tables:
   - Run `sql/schema.sql` in MySQL
4. Install + run:
   - `npm install`
   - `npm start`

Server starts at: `http://localhost:5000`

## 2) Authentication

### Register
`POST /api/auth/register`
```json
{
  "name": "Recruiter One",
  "email": "recruiter1@mail.com",
  "password": "123456",
  "role": "recruiter"
}
```

### Login
`POST /api/auth/login`
```json
{
  "email": "recruiter1@mail.com",
  "password": "123456"
}
```
Use returned token as:
`Authorization: Bearer <token>`

## 3) Main APIs (Postman)

### Public
- `GET /api/health`
- `GET /api/jobs?keyword=node&location=delhi&minSalary=10000&maxSalary=100000&employmentType=full-time`

### Recruiter
- `POST /api/jobs`
- `GET /api/jobs/recruiter/my-jobs`
- `PATCH /api/jobs/applications/:applicationId/status` with body:
```json
{ "status": "shortlisted" }
```
- `GET /api/dashboard/recruiter`

### Job Seeker
- `POST /api/resumes` (form-data key: `resume`, file: PDF/DOC/DOCX)
- `POST /api/applications` body:
```json
{ "jobId": 1, "cover_letter": "I am interested in this role." }
```
- `GET /api/applications/me`
- `POST /api/saved-jobs` body:
```json
{ "jobId": 1 }
```
- `GET /api/saved-jobs/me`
- `GET /api/notifications/me`

### Admin
- `GET /api/dashboard/admin`

## 4) Notes
- Resume files are stored in `uploads/`.
- Notifications are saved in `notifications` table.
- Email notifications trigger when:
  - A seeker applies to a job (to recruiter)
  - Recruiter updates application status (to seeker)
- If email credentials are not configured, API still works but skips sending email.
