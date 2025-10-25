# Video Game Trends Analyzer

## Data

**Choose Data issue:** [issue:1](https://gitlab.com/dawson-cst-cohort-2026/520/section2/teams/TeamL-23-JenSungeunYanChi/520-project-huang-ng-kim/-/issues/1)

**Summary:** We will explore the relationship between public online interest and real world sales of video games by combining two open Kaggle datasets:

- Video Game Sales : a dataset of games with over 100,000 copies sold, including title, genre, platform, publisher, year, and regional/global sales.
- Google Trends Dataset : search interest data for popular queries across years and regions

- We will analyze how search popularity (Google Trends) correlates with game sales across genres, years, and platforms, ranging from 2001-2016. 

## API

- We will define three Express endpoints:

1. **GET /sales/global/:year**

   - Returns aggregated global sales for games released a certain year, with details such as genre and platform for details
   - Response: data = [{ "name" : "game1"}, {genre...}, {global_sales...}]
   - Server : Reads and filters vgsales.csv, sums sales grouped by year

2. **GET /sales/region/:region/:year**

   - Returns region specific sales for the given region. For example, NA, EU, JP
   - Params will be used: region, year
   - Response: [{ name, (region)sales, countries }]
      - This fetches the video games sold in that region in that year, as well as a list of countries in that region
      - Users select a country from that list
   **GET /sales/region/:region/:year/:country**
      - This fetches the list of categories of that country in that year
      - User selects a category
   **GET /sales/region/:region/:year/:category**
      - This fetches the top search results of that category
      - Display results
   - Server : Filters dataset by region and aggregates sales by year, as well as search results by country

3. **GET /sales/:genre or GET /sales/:platform**
   - Returns the number of games released in a certain year of a specific genre/platform as a percentage of all games released that year.
   - Params will be used: genre / platform
   - Response: [{ year, percent, num_games, total_games }]
   - Server : Reads trends.csv, filters by matching genre/platform keyword, calculate percentage of games published that year

## Visualizations

Video game sales are compared to the most common Google search terms of the same year. We want to see if public interest of the game correlates to actual sales. We also want to see when different game genres/platforms are the most popular; does world-wide trends affect game trends?

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

### View 3: Pie Chart

- Above the fold: Pie chart displaying the number of games of a certain genre/platform published in one year, compared to the total amount of games published that year.
- Hover over a specific point in the pie chart to see more details.

<img height="300" src="view3_sketch.png"/>

## Functionality

- Every view has a filter users can interact with to display different results:
   - View 1 filters game sales & Google qureies based on the year.
   - View 2 filters sale & queries based on the region & query category.
   - View 3 displays amount of games published based on game genres or platform (ex: Xbox, Switch, PC, etc.)
- Before using the filter, users must interact with the map by clicking on a specific region.
- Navigate between Views using the mini Navigation bar.

## Features and Priorities

**Top Priority: (P0)**
- Display top global video games sales as a bar chart in view 1
- Display top search terms of a certain year (in all views)
- Display top global video games sales of a certain region (NA, EU, JP, Other) in view 2
- Dropdown menu to select country based on selected region in view 2, which will display the top search terms of that country
- Display percentage of published games of a specific genre or platform as a pie chart in view 3
- Navigation bar on bottom of app to switch between views
- Adaptive mobile layout for each view

**Middle Priority: (P1)**
- World Map visualization of sales data per region in view 2
- Dropdown menu to filter each country's top search results by category in view 2

**Least Priority: (P2)** 
- Hover popup that displays game details on bar graph screen in view 1
- Clickable popup on world map screen in view 2, windows display permanently on the side to choose region/country
- Hover popup on bar chart screen in view 3, windows display permanently on the side that the most sold games of that genre/platform in that year

## Dependencies
- We will use Chart.js to display visualizations of data, as it was recommended in the project overview, and it seems easy and intuitive to use. 
- We will use a bar chart: https://www.chartjs.org/docs/latest/charts/bar.html 
- and also a pie chart: https://www.chartjs.org/docs/latest/charts/doughnut.html 

- We will also use amCharts to display the visualization of the world map, since it seems very comprehensive and there are good examples on the website that fit our needs, including hoverable popups for each country, as well as a toggle between a flat 2d map and a 3d globe: https://www.amcharts.com/demos/trumps-reciprocal-tariffs-map/
