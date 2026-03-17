# API summary

## Auth
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/refresh`
- `GET /auth/profile/:userId`

## Transit
- `GET /routes`
- `GET /buses`
- `GET /buses/nearby?lat=&lng=`
- `GET /buses/live`
- `GET /eta/:busId`

## Ticketing
- `POST /tickets/quote`
- `POST /tickets/purchase`
- `GET /tickets/:ticketId`
- `POST /tickets/scan`

## Occupancy and alerts
- `GET /occupancy/:busId`
- `POST /occupancy/update`
- `GET /predictions/seats`
- `POST /alerts/subscribe`

## Parcels
- `POST /parcels/book`
- `GET /parcels`
- `GET /parcels/:parcelId`
- `POST /parcels/fit`
- `POST /parcels/scan`
- `POST /parcels/health`

## Admin
- `GET /dashboard/admin`
- `GET /notifications/:userId`
