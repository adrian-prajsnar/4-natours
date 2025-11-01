# Four Natours Application

## Description

The project is a tour booking application where users can browse and book exciting tours, view tour details, leave reviews, and manage their bookings and account. Full-stack application built using **Node.js**, **Express**, **MongoDB**, **Mongoose**, and **TypeScript** with server-side rendered views using **Pug** templates.

This project was built along with Jonas Schmedtmann's Node.js course but has been significantly enhanced and restructured. The original course used JavaScript, but this implementation has been fully converted to **TypeScript** with proper type definitions, improved code organization, and modern development practices.

**Features:**

- Authentication & Authorization: Users can sign up, log in, and manage their accounts with secure JWT-based authentication.
- Tour Browsing: Users can view all available tours with detailed information including locations, difficulty levels, duration, and prices.
- Advanced Filtering & Sorting: Users can filter tours by various criteria and sort results based on their preferences.
- Interactive Maps: Integration with MapBox to display tour locations and routes.
- Booking System: Secure payment processing through Stripe for tour bookings.
- Review System: Authenticated users can leave reviews and ratings for tours they've experienced.
- User Dashboard: Users can view and manage their bookings, update profile information, and change passwords.
- Email Notifications: Automated email system for welcome messages and password resets using Mailtrap/SendGrid.

## Table of Contents

- [Description](#description)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [License](#license)

## Getting Started

To get this project up and running on your local machine, follow these steps:

### Prerequisites

Make sure you have the following software installed on your system:

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository:

```
git clone https://github.com/adrian-prajsnar/4-natours.git
```

2. Navigate to the project folder:

```
cd 4-natours
```

3. Install the project dependencies:

```
npm install
```

4. Set up your environment variables (see [Environment Variables](#environment-variables) section below).

## Usage

1. To run the development server:

```
npm run dev
```

2. To build the project:

```
npm run build
```

3. To run the production server:

```
npm start
```

4. To check for ESLint errors:

```
npm run lint
```

5. To import sample data into your database:

```
npm run import-data
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file in the root directory.

`DATABASE_URL` - Your MongoDB connection string (MongoDB Atlas)

`DATABASE_URL_LOCAL` - Local MongoDB connection string (e.g., mongodb://localhost:27017/natours)

`DATABASE_PASSWORD` - Your MongoDB database password

`JWT_SECRET` - Secret key for JWT token generation

`EMAIL_USERNAME` - Mailtrap username for development email testing

`EMAIL_PASSWORD` - Mailtrap password

`EMAIL_HOST` - Email host (e.g., sandbox.smtp.mailtrap.io)

`EMAIL_PORT` - Email port (e.g., 2525)

`SENDGRID_USERNAME` - SendGrid username for production emails

`SENDGRID_PASSWORD` - SendGrid password

`STRIPE_SECRET_KEY` - Stripe secret key for payment processing

`STRIPE_WEBHOOK_SECRET` - Stripe webhook secret for secure webhooks

## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
