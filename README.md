# Travel-App
Udacity FEND capstone

A web app for travel planning where you can save trips, view destination images, and view weather forecasts or typical weather for dates in the future.

## How to run

### 1. Add Weatherbit API Key
Sign up for [Weatherbit API key](https://www.weatherbit.io/account/create). 
In `.env` replace 'YOUR_WEATHERBIT_API_KEY' w/ the your new api key.

### 2. Add PIXABAY_API_KEY API Key
Sign up for [Pixabay API key](https://pixabay.com/api/docs/). 
In `.env` replace 'YOUR_PIXABAY_API_KEY' w/ the your new api key.

### 3. Run
```
npm i
npm run build-prod
npm start
```
Open http://localhost:3000/ in browser to view.

## Run tests
Tests are run using Jest
```
npm i -D
npm test
```

## Run Dev w/ Automatic Refresh
Start prod (See 'How to run' above) and while that is running, in a separate terminal enter the following:
```
npm i -D
npm run build-dev
```
This should automatically open a tab in browser at http://localhost:9000/ 


## Dependencies
Most notable dependencies are related to Google's [MDC Library](https://material.io/develop/web)
