# Video Game Trends Analyzer

## Data

**Choose Data issue:** [issue:1](https://gitlab.com/dawson-cst-cohort-2026/520/section2/teams/TeamL-23-JenSungeunYanChi/520-project-huang-ng-kim/-/issues/1)
**Summary:** We will explore the relationship between public online interest and real world sales of video games by combining two open Kaggle datasets:

- Video Game Sales : a dataset of games with over 100,000 copies sold, including title, genre, platform, publisher, year, and regional/global sales.
- Google Trends Dataset : search interest data for popular queries across years and regions

- We will analyze how search popularity (Google Trends) correlates with game sales across genres, years, and platforms.

## API

- We will define three Express endpoints:

1. **GET /sales/global**

   - Returns aggregated global sales per year and genre
   - Response: [{ year, genre, global_sales }]
   - Server : Reads and filters vgsales.csv, sums sales grouped by year and genre

2. **GET /sales/region/:region**

   - Returns region specific sales for the given region. For example, NA, EU, JP
   - Params will be used: region
   - Response: [{ year, genre, sales }]
   - Server : Filters dataset by region and aggregates sales by genre and year

3. **GET /trends/:genre**
   - Returns average yearly Google Trends interest for a given game genre.
   - Params will be used: genre
   - Response: [{ year, avg_interest }]
   - Server : Reads trends.csv, filters by matching genre keyword, averages yearly interest values

## Visualizations

Video game sales are compared to the most common Google search terms of the same year. We want to see if public interest of the game correlates to actual sales. We also want to see how different game genres sell overtime; does world-wide trends affect game trends?

## Views

### View 1: Bar Chart

- Above the fold: bar chart of video games displayed and list of most searched terms on Google. Data here are all global and not pertain to a specific region/country.
- Hidden: popup windows displaying details on each video game (bar on the chart).

<img height="300" src="view1_sketch.png"/>
<img height="300" src="view1_mobile_sketch.png"/>

### View 2: Map

- Above the fold: display map of the world. Only certain regions are clickable.
- After clicking on a region: more windows will pop up with a 'Top Video Games' chart and a filter to find which search terms are trending in a specific country.

<img height="300" src="view2_sketch.png"/>
<img height="300" src="view2_mobile_sketch.png"/>

### View 3: Game Genre Trends

- Above the fold: line chart displaying sales of a game genre over time.
- Hover over a specific point in the line graph to see more details.

<img height="300" src="view3_sketch.png"/>

## Functionality

- Filters? ex, region, years

## Features and Priorities

**P0:**

- **P1:**
- **P2:**
-

## Dependencies

-
