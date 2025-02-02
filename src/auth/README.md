# 1. Sign Up

curl -X POST http://localhost:3010/auth/signup \
-H "Content-Type: application/json" \
-d '{
"email": "test@example.com",
"password": "Password123!"
}'

# 2. Sign In

curl -X POST http://localhost:3010/auth/signin \
-H "Content-Type: application/json" \
-d '{
"email": "test@example.com",
"password": "Password123!"
}'

# 3. Get Profile (using the token from signin)

curl -X GET http://localhost:3010/auth/profile \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
