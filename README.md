# Identity Reconciliation Service

## Deployment
**Hosted URL:** [https://bitespeed-1-a7e7.onrender.com/identify](https://bitespeed-1-a7e7.onrender.com/identify)

## Project Overview
A backend service for **Bitespeed** that consolidates customer contact information across multiple interactions.

## Features
- Unique customer identity tracking
- Contact information consolidation
- Handles multiple email and phone number scenarios
- Primary and secondary contact management

## Technology Stack
- **Language:** TypeScript
- **Framework:** Express.js
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Hosting & Deployment:** Render.com, Docker
- **Logging:** Morgan
- **Environment Management:** Dotenv

## API Endpoint

### `/identify` Endpoint

#### Request (POST)
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

#### Response
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

### Sample GET Response
```json
[
  {
    "id": 1,
    "phoneNumber": "123456",
    "email": "mcfly@hillvalley.edu",
    "linkedId": null,
    "linkPrecedence": "primary",
    "createdAt": "2025-02-09T09:53:33.666Z",
    "updatedAt": "2025-02-09T09:53:33.666Z",
    "deletedAt": null
  },
  {
    "id": 2,
    "phoneNumber": "123456",
    "email": "lorraine@hillvalley.edu",
    "linkedId": 1,
    "linkPrecedence": "secondary",
    "createdAt": "2025-02-09T10:25:50.812Z",
    "updatedAt": "2025-02-09T10:25:50.812Z",
    "deletedAt": null
  }
]
```

## Installation
```bash
# Clone the repository
git clone git@github.com:aravindgopan-dev/BiteSpeed.git

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start the server
npm run dev
```

## Additional Features
- Input validation
- Error handling
- Logging with Winston & Morgan
- Performance optimization

## Dependencies
```json
{
  "devDependencies": {
    "@types/morgan": "^1.9.9",
    "@types/node": "^22.13.1",
    "@types/nodemon": "^1.19.6",
    "nodemon": "^3.1.9",
    "prisma": "^6.3.1",
    "rimraf": "^6.0.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.7.3"
  },
  "dependencies": {
    "@prisma/client": "^6.3.1",
    "@types/body-parser": "^1.19.5",
    "@types/express": "^5.0.0",
    "body-parser": "^1.20.3",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "morgan": "^1.10.0"
  }
}
```

## Scripts
```json
{
  "scripts": {
    "build": "rimraf dist && tsc",
    "start": "npm run build && node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts"
  }
}
```

## License
MIT License

