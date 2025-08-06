🛡️ Node.js Authentication App
A full-featured authentication system built with Node.js, Express, MongoDB, and JWT. It includes user sign up, login, logout, email verification, forgot/reset password, protected routes, and a responsive frontend using Pug and Parcel.

🚀 Features
✅ Sign up with email verification (code-based)

✅ Login / Logout

✅ JWT-based authentication (HTTP-only cookie)

✅ Forgot password (via email)

✅ Password reset via token

✅ Responsive forms (signup, login, verify, reset)

✅ Frontend built with Pug, styled simply with CSS

✅ Bundled using Parcel v1

🛠️ Tech Stack
Backend: Node.js, Express, MongoDB, Mongoose

Security: JWT, bcrypt, cookie-parser, helmet

Email: Nodemailer

Frontend: Pug, Parcel (bundler)

Environment: dotenv, nodemon


🧪 API Endpoints
Auth
POST /api/v1/users/signup

POST /api/v1/users/login

GET /api/v1/users/logout

POST /api/v1/users/forgotPassword

PATCH /api/v1/users/resetPassword/:token

GET /api/v1/users/verifyCode

PATCH /api/v1/users/verifyCode



