# 520-Project-Huang-Ng-Kim

**Team:** Jennifer Huang, Yan Chi Ng, Sungeun Kim  
**Course:** 420-520-DW Web Development IV  
**Section:** 02
**Semester:** Fall 2025

## Overview

- This web app aims to display data taken from two large datasets — one of global video game sales and another of Google search interest trends — we transform and load the data into MongoDB, then serve it through a Node/Express REST API and visualize it with React through data charts and forms. 
- Our goal with this project is to explore the connection between pop culture search trends and video game sales performances for a given year from 2001 - 2006 and see if there is a correlation, perhaps related to global events or something that happened in a specific region/country. 

---

## My Contributions

### Frontend Visualization & UX (Primary Focus)
- Designed and implemented the time-based **line chart view (View 3)** to visualize trends across years
- Handled dynamic state changes when switching between **genre-based** and **platform-based** filters
- Implemented percentage-based calculations and improved how values were explained to users
- Built custom tooltips showing:
  - number of matching games
  - total games for the selected year
  - clear "X out of Y" raw value context
- Refined UX where percentage values were initially confusing or unclear

### Performance & Loading Improvements
- Implemented **lazy loading** for heavy chart components using React.lazy and Suspense
- Added loading fallbacks to prevent crashes during asynchronous rendering
- Enabled **gzip compression** and applied basic caching strategies to improve load times
- Used **Lighthouse** and **WebPageTest** to measure and verify performance improvements

### Backend, Deployment & Tooling
- Contributed to backend organization and REST API structure using **Node.js and Express**
- Added **Swagger API documentation** to document endpoints and support easier testing
- Set up **CI/CD pipelines** using GitLab to automate builds and catch errors early
- Deployed the application to **AWS Lightsail** and managed the Node server using **PM2**

### Collaboration & Code Quality
- Worked with protected branches and merge requests in a team based Git workflow
- Collaborated with teammates to integrate frontend, backend, and database features

---

## Introduction UI
![UI screenshot 1](./screenshots/ui%20screenshot%201.png)
## View 1 (Bar Chart) UI
![UI screenshot 2](./screenshots/ui%20screenshot%202.png)
## View 2 (Map Chart) UI
![UI screenshot 3](./screenshots/ui%20screenshot%203.png)
## View 3 (Line Chart) UI
![UI screenshot 4](./screenshots/ui%20screenshot%204.png)

## Structure
- Planning directory (wireframes, proposal)
- Project itself, with a client directory for front-end React components and server directory for back-end express routes and mongoDB setup
- Performance directory containing evidence of the 6 performance enhancements we made
- gitlab-ci.yml file

## Technologies Used

**Backend/API** - Node.js and Express : REST API endpoints
**Database** - MongoDB Atlas : Stores aggregated sales & interest collections
**Frontend** - React (Vite build) : Interactive visualizations and filters
**Version Control/CI** - GitLab (Protected Branch workflow) : Collaboration

## Project Setup

First, clone the git repository using SSH/HTTPS

### MongoDB Setup

- Create a MongoDB account if you don't already have one and login
- Create a new database cluster: https://www.mongodb.com/resources/products/fundamentals/mongodb-cluster-setup 
- Click connect -> Drivers -> copy the connection string given

In VSCode: 
- Install the MongoDB for VS Code extension
- Connect to your cluster using the connection string, replacing it with your own password

In Video_Game_Trends_Analyzer_Project:
- cd into server and create a .env file in the following format

ATLAS_URI=<your_connection_string>
DB=Video_Game_Trends_Analyzer_Production
VG_COLLECTION=game_sales
TRENDS_COLLECTION=trends

To populate the database run:

```
node utils/seed.js
```

To install all the dependencies and build the React app run:

```
npm run build
```

## To run the app in development mode:

In Video_Game_Trends_Analyzer_Project:

```
- npm run start
- Open a new terminal and cd client && npm run dev
```

The app will be listening on `http://localhost:5173` 

## To run the app in production mode:

In Video_Game_Trends_Analyzer_Project:

```
- npm run start
```

The app will be listening on `http://localhost:3000` 

## Attributions
- Video game sales dataset: https://www.kaggle.com/code/upadorprofzs/eda-video-game-sales/notebook
- Google Trends dataset: https://www.kaggle.com/datasets/dhruvildave/google-trends-dataset

- Libraries used:
    - Chart.js (for bar chart and line chart)
        - https://www.chartjs.org/docs/latest/charts/bar.html
        - https://www.chartjs.org/docs/latest/charts/doughnut.html
    - amCharts (for world map chart)
        - https://www.amcharts.com/demos/trumps-reciprocal-tariffs-map/

## Authors and acknowledgment
- Jennifer Huang, Yan Chi Ng, Sungeun Kim
