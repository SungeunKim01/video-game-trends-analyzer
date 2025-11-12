import { useEffect } from 'react';
import Chart from 'chart.js/auto';

/**
 * A component that renders a Chart.js bar chart for View 1.
 * Receives the fetched data from its parent (time series rows and legend label)
 * , and reuses an existing chart instance on the same canvas
 * 
 * Properties:
 * rows: [{ year, percent, num_games, total_games }]
 * label: str to show in the legend
 * 
 * this own the Chart.js instance and cleans it up on update and unmount
 * 
 * I refer these specifically from Chart.js:
 * https://www.chartjs.org/docs/latest/charts/line.html
 * https://www.chartjs.org/docs/latest/configuration/responsive.html
 * https://www.chartjs.org/docs/latest/axes/
 * https://www.chartjs.org/docs/latest/configuration/tooltip.html
 * https://www.chartjs.org/docs/latest/developers/plugins.html
 * 
 * @author Sungeun
 * @param {Object} props
 * @param {Array<{year, percent, num_games, total_games}>} props.rows
 * @param {string} props.label
 * @returns React component that draws and updates Chart.js line chart
 */

export default function BarChart({rows}){
  useEffect(() => {
    const canvas = document.getElementById('view1-bar-chart');
    if (!canvas) return;

    // build points w extra fields the tooltip can read
    const points = Array.isArray(rows)
      ? rows.map(r => 
        ({ x: r.name, y: r.global_sales }))
      : [];

    let chart = Chart.getChart(canvas);

    if (!chart) {
      chart = new Chart(canvas, {
        type: 'bar',
        data: {
          // labels help render the X ticks
          labels: rows.map(r => r.name),
          datasets: [{
            label: 'Sales',
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
              //min: 0,
              //max: 100,
              //ticks: { callback: v => `${v} million` }
            }
          },
          plugins: {
            title: { display: true, text: 'Top 10 Globally Sold Games' },
            legend: { display: true },
            /*tooltip: {
              callbacks: {
                label: ctx => `${ctx.parsed.y}%`,
                afterLabel: ctx => {
                  // {x, y, num, total}
                  const raw = ctx.raw;
                  return raw ? `Games: ${raw.num} / Total games: ${raw.total}` : '';
                }
              }
            }*/
          }
        }
      });
    } else {
      // update existing chart
      chart.data.labels = rows.map(r => r.name);
      chart.data.datasets[0].data = points;
      chart.update();
    }
  }, [rows]);

  return (
    <div style={{ height: '400px', marginTop: '25px' }}>
      <canvas id="view1-bar-chart"></canvas>
    </div>
  );
}