# 520-Project-Huang-Ng-Kim

**Team:** Jennifer Huang, Yan Chi Ng, Sungeun Kim  
**Course:** 420-520-DW Web Development IV  
**Section:** 02
**Semester:** Fall 2025

## Overview

- This explores the connection between online search interest and video game sales performance.
- Using two large datasets — one of global video game sales and another of Google search interest trends — we transform and load the data into MongoDB, then serve it through a Node/Express REST API and visualize it with React "(chart, etc)"
- Our Project theme: ""

## Requirements

## Structure

- main: Contains only this README.md
- staging: Contains Proposal.md, wireframes, TeamPolicy.md

## Technologies Used

**Backend/API** - Node.js and Express : REST API endpoints
**Database** - MongoDB Atlas : Stores aggregated sales & interest collections
**Frontend** - React (Vite build) : Interactive visualizations and filters
**Version Control/CI** - GitLab (Protected Branch workflow) : Collaboration

## Features

## Project Setup

To install all the dependencies and build the React app run:

```
npm run build
```

## To run the app

### Just the client

```
cd metro-client
npm run dev
```

### Just the server

```
cd server
node --watch api.mjs
```

### Client and Server

```
cd metro-client/
npm run build
cd ../server/
node --watch api.mjs
```
The app will be listening on `http://localhost:3000`

## Authors and acknowledgment

- Jennifer Huang, Yan Chi Ng, Sungeun Kim

## License

## Project status

- donig Proposal & Setup
