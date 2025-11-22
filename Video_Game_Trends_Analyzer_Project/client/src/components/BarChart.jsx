import { useEffect } from 'react';
import Chart from 'chart.js/auto';

/**
 * A component that renders a Chart.js bar chart for View 1.
 * Receives the fetched data from its parent (rows representing game sales)
 * and reuses an existing chart instance on the same canvas
 * 
 * Properties:
 * rows: [{ year, name, global_sales }]
 * 
 * this own the Chart.js instance and cleans it up on update and unmount
 * 
 * References:
 * https://www.geeksforgeeks.org/javascript/chart-js-bar-chart/ 
 * https://www.chartjs.org/docs/latest/charts/bar.html 
 * https://www.chartjs.org/docs/latest/configuration/responsive.html
 * https://www.chartjs.org/docs/latest/axes/
 * https://www.chartjs.org/docs/latest/developers/plugins.html
 * 
 * @author Yan Chi
 * @param {Object} props
 * @param {Array<{year, name, global_sales}>} props.rows
 * @returns React component that draws and updates Chart.js bar chart
 */

export default function BarChart({rows}){
  useEffect(() => {
    const canvas = document.getElementById('view1-bar-chart');
    if (!canvas) return;

    //get sales data for y-axis
    const points = Array.isArray(rows) 
      ? rows.map(r => 
        ({ x: r.name, y: r.global_sales, genre: r.genre, publisher: r.publisher })) 
      : [];

    let chart = Chart.getChart(canvas);

    if (!chart) {
      chart = new Chart(canvas, {
        type: 'bar',
        data: {
          // game names = x-axis labels
          //labels: rows.map(r => r.name),
          datasets: [{
            label: 'Sales',
            //y-axis values uses points
            data: points, 
            backgroundColor: 'skyblue',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { type: 'category', title: { display: true, text: 'Games' } },
            y: {
              title: { display: true, text: 'Global Sales of Games (in millions)' },
              beginAtZero: true
            }
          },
          plugins: {
            title: { display: true, text: 'Top 10 Globally Sold Games' },
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.parsed.y} Million `,
                afterLabel: ctx => {
                  // {x, y, genre, publisher}
                  const raw = ctx.raw;
                  return raw ? `Genre: ${raw.genre} / Publisher: ${raw.publisher}` : '';
                }
              }
            }
          }
        }
      });
    } else {
      // update existing chart
      //chart.data.labels = rows.map(r => r.name);
      chart.data.datasets[0].data = points;
      chart.update();
    }
  }, [rows]);

  return (
    <div style={{ width: '99%', height: '50vh', marginTop: '25px' }}>
      <canvas id="view1-bar-chart"></canvas>
    </div>
  );
}