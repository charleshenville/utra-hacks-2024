import styles from './vis.module.css';
import { React, useState, useEffect, useRef } from "react";
import axios from 'axios';
import * as d3 from 'd3';

function MoistureVis() {

    const chartRef = useRef(null);
    const [soilData, setSoilData] = useState([]);
    const [ctime, setCtime] = useState("0");

    const fetchData = () => {
        axios.get(`http://100.67.82.145:80/get_moisture`)
            .then((response) => {
                setSoilData(response.data); // Assuming the API returns a success flag
                console.log(soilData)
            })
            .catch((error) => {
                console.error(error);
            });
    };

    // Use useEffect to run the fetchData function on mount and every 10 seconds
    useEffect(() => {
        fetchData(); // Initial API call

        const intervalId = setInterval(() => {
            fetchData(); // API call every 10 seconds
        }, 10000);

        // Cleanup function to clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, []); // The empty dependency array ensures that the effect runs only on mount and unmount


    useEffect(() => {
        // Check if an element with ID 'moist' already exists and remove it
        const existingSvg = d3.select('#moist');
        if (!existingSvg.empty()) {
            existingSvg.remove();
        }

        const width = 928;
        const height = 500;
        const marginTop = 20;
        const marginRight = 30;
        const marginBottom = 30;
        const marginLeft = 40;

        // Sample data
        const data = [{ time: 1, value: 0 }, { time: 2, value: 2 }, { time: 3, value: 5 }, { time: 4, value: 5 }, { time: 5, value: 7 }, { time: 6, value: 8 }, { time: 7, value: 12 }];

        // Set up the SVG container
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            .attr('id', 'moist'); // Set the ID of the new SVG


        const x = d3.scaleLinear([0, d3.max(soilData, d => d.time)], [marginLeft, width - marginRight]);
        const y = d3.scaleLinear([d3.min(soilData, d => d.value)-10, d3.max(soilData, d => d.value)+10], [height - marginBottom, marginTop]);

        const line = d3.line()
            .x(d => x(d.time))
            .y(d => y(d.value));

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
            .call(g => g.append("text")
                .attr("x", (width - marginRight) / 2)
                .attr("y", marginBottom)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("Minutes Since\n" + ctime));

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).ticks(height / 40))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("Soil Moisture %"));

        // Append the line to the SVG
        svg.append('path')
            //.data([data])
            .attr('d', line(soilData))
            .attr('stroke', 'blue')
            .attr('fill', 'none');
    }, [chartRef, soilData, ctime]);


    return (
        <div className={styles.moistcont}>
            <div>Moisture</div>
            <div ref={chartRef} className={styles.msctn}>

            </div>
        </div>

    );
}

export default MoistureVis;
