# SmartSeason — Field Monitoring System

A full stack web application for tracking crop progress across multiple fields during a growing season. Admins coordinate field operations, agents report from the ground.

## Live
- App: https://smartseason-app-psi.vercel.app
- API: https://smartseason-api-4aeh.onrender.com

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartseason.com | Smartseason2026 |
| Agent | agent@test.com | 123456 |

## What It Does

Admins log in and get a full picture they create fields, assign them to agents, monitor progress and remove fields when needed. Agents see only their assigned fields, update the crop stage and drop observations as things develop in the field.

There is also an AI crop advisor built in agents describe what they are seeing and get structured advice back on what the issue likely is, what to do about it and how urgent it is. This uses the Gemini API. This is fully on my learning curve bit so I have had so much trouble in getting it to fully work well but I am refining on it and will definitely get it right.

## Stack
- Frontend: React (Vite), deployed on Vercel
- Backend: Node.js + Express, deployed on Render
- Database: MongoDB Atlas + Mongoose
- Auth: JWT with role based access
- AI: Google Gemini API

## Design Decisions

**MongoDB over relational DB**
The assessment suggested relational databases but I went with MongoDB because field data — notes, observations, nested updates maps naturally to documents. It also let me focus on the business logic rather than schema migrations.

**Computed status not stored**
Each field has a status that gets calculated on the fly rather than saved to the database. The logic is a virtual field on the Mongoose model:
- Completed — stage is Harvested
- At Risk — more than 90 days in ground and not yet Ready
- Active — everything else

This keeps the data clean and means status always reflects reality without needing manual updates or triggers.

**Role based access in two layers**
Two middleware functions handle access separately. `protect` checks the JWT is valid and attaches the user to the request. `adminOnly` then checks the role. Field queries filter by `assignedTo` for agents so data isolation happens at the database level not just the UI.

**Admin accounts are not self-serve**
Registration only creates agent accounts regardless of what is sent in the request body. Admin accounts are provisioned directly. This prevents anyone from escalating their own privileges through the API.

**AI advisor on the frontend**
The Gemini API call happens directly from the React client rather than routing through the backend. This keeps the backend focused on data and avoids adding API key management complexity to the server for a feature that is purely presentational.

## Assumptions
- One agent per field at a time
- Agents cannot create or delete fields
- The 90 day At Risk threshold is a starting point — in production this would be configurable per crop type
- Admin provisioning would be restricted further in a production system

## Running Locally

**Backend**
```bash
cd server
npm install
npm run dev
```

Create `server/.env`:...... my environmental details go here

then I work on the frontend bit 

**Frontend**
```bash
cd client
npm install
npm run dev
```
Create `client/.env`: ........my details fall here 

## API
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /auth/register | Public | Register agent |
| POST | /auth/login | Public | Login |
| GET | /auth/agents | Admin | List all agents |
| GET | /fields | Both | Fields filtered by role |
| POST | /fields | Admin | Create field |
| PUT | /fields/:id/assign | Admin | Assign to agent |
| PUT | /fields/:id/update | Agent | Update stage and notes |
| DELETE | /fields/:id | Admin | Delete field |
| GET | /dashboard | Both | Summary stats |


Ryan Shuma — [GitHub](https://github.com/Shumer61)