/*!
 * rspamd-D3Pie 0.0.1 (https://github.com/moisseev/rspamd-D3Pie)
 * Copyright (c) 2022, Alexander Moisseev, BSD 2-Clause
 */

/* exported D3Pie */
/* eslint-disable-next-line max-statements, no-implicit-globals */
function D3Pie (id, options) {
    "use strict";

    const opts = $.extend(true, {
        canvasPadding: 5,
        cornerRadius: 3,
        duration: 1250,
        gradient: {
            enabled: true,
            percentage: 100
        },
        labels: {
            inner: {
                hideWhenLessThanPercentage: 4,
                offset: 0.15
            },
            outer: {
                collideHeight: 13,
                format: "label",
                pieDistance: 30
            }
        },
        padAngle: 0.01,
        pieCenterOffset: {
            x: 0,
            y: 0
        },
        size: {
            canvasHeight: 400,
            canvasWidth: 600,
            pieInnerRadius: "20%",
            pieOuterRadius: "85%"
        },
        title: ""
    }, options);

    this.destroy = function () {
        d3.selectAll("#" + id + " svg, #" + id + "-tooltip").remove();
    };
    this.destroy();

    const svg = d3.select("#" + id).append("svg")
        .attr("class", "d3pie")
        .attr("width", opts.size.canvasWidth)
        .attr("height", opts.size.canvasHeight);

    let titleHeight = 0;
    if (opts.title !== "") {
        const title = svg.append("svg:text")
            .attr("class", "chart-title")
            .attr("x", (opts.size.canvasWidth / 2));
        title.append("tspan")
            .text(opts.title + " ");
        titleHeight = title.node().getBBox().height;
        title.attr("y", titleHeight + opts.canvasPadding);
    }

    const g = svg.append("g")
        .attr("transform", "translate(" + ((opts.size.canvasWidth / 2) + opts.pieCenterOffset.x) + "," +
          ((opts.size.canvasHeight / 2) + (titleHeight / 2) + opts.pieCenterOffset.y + ")"));

    const currentData = {};
    const outerLabel = {};

    const {outerRadius, innerRadius} = (function () {
        function pieRadius (r, whole) {
            if (!(/%/u).test(r)) return parseInt(r, 10);
            const decimal = Math.max(0, Math.min(99, parseInt(r.replace(/[\D]/u, ""), 10))) / 100;
            return Math.floor(whole * decimal);
        }

        const width = opts.size.canvasWidth - (2 * opts.canvasPadding);
        const height = opts.size.canvasHeight - (2 * opts.canvasPadding) - titleHeight;
        let overallRadius = Math.min(width, height) / 2;
        if (opts.labels.outer.format !== "none") {
            const pieDistance = parseInt(opts.labels.outer.pieDistance, 10);
            if (overallRadius > pieDistance) overallRadius -= pieDistance;
        }
        const oR = pieRadius(opts.size.pieOuterRadius, overallRadius);
        const iR = pieRadius(opts.size.pieInnerRadius, oR);
        return {outerRadius: oR, innerRadius: iR};
    }());

    const labelRadius = outerRadius + opts.labels.outer.pieDistance;

    const lineGenerator = d3.line()
        .curve(d3.curveCatmullRomOpen);

    const tooltip = d3.select("body").append("div")
        .attr("id", id + "-tooltip")
        .attr("class", "d3pie-tooltip");
    const tooltipText = tooltip
        .append("span")
        .attr("id", id + "-tooltip-text");

    const defs = svg.append("defs");

    this.data = function (arg) {
        let data = $.extend(true, [], arg);

        const nodes = [];

        const total = data.reduce(function (a, b) {
            return a + (b.value || 0);
        }, 0);
        tooltip.datum({total});

        // Add placeholder path for empty pie chart
        data.unshift({
            label: "undefined",
            color: opts.gradient.enabled ? "steelblue" : "#ecf1f5",
            value: (total === 0) ? 1 : 0
        });

        const colorScale = d3.scaleOrdinal(d3.schemeSet1);
        function pathColor (d, i) {
            return (typeof d !== "undefined" &&
                    typeof d.color !== "undefined")
                ? d.color
                : colorScale(i);
        }

        function midpoint (args, innerR, outerR = innerR) {
            return d3.arc().innerRadius(innerR).outerRadius(outerR).centroid(args);
        }

        function interpolate (d) { return d3.interpolate(currentData[d.data.label], d); }

        function arcTweenSlice (d) {
            return function (t) {
                return d3.arc().padAngle(opts.padAngle).cornerRadius(opts.cornerRadius)
                    .innerRadius(innerRadius).outerRadius(outerRadius)(interpolate(d)(t));
            };
        }

        function arcTweenInnerlabel (d) {
            return function (t) {
                return "translate(" + midpoint(
                    interpolate(d)(t),
                    innerRadius * (1 - opts.labels.inner.offset),
                    outerRadius * (1 + opts.labels.inner.offset)
                ) + ")";
            };
        }

        function limit (y) {
            // Avoid 0 and pi positions to prevent changing half-plane
            const boundary = labelRadius - 0.1;
            return Math.max(-boundary, Math.min(boundary, y));
        }

        function arcTweenOuterlabel (d, i) {
            function newAngle () {
                // Node Y may be slightly outside of the circle as the bounding force is not a hard limit.
                const y = limit(nodes[i].y);
                // Calculate the actual X-position with an equation of a circle centered at the origin (0, 0).
                let ax = Math.sqrt(Math.pow((labelRadius), 2) - Math.pow(y, 2));
                if ((d.endAngle + d.startAngle) / 2 > Math.PI) ax *= -1;

                let angle = (Math.PI / 2) - Math.atan2(-y, ax);
                if (angle < 0) angle += 2 * Math.PI;

                return {startAngle: angle, endAngle: angle};
            }

            outerLabel[d.data.label].newAngle = newAngle();
            const interpolateOuterLabel = d3.interpolate(
                outerLabel[d.data.label].currentAngle,
                outerLabel[d.data.label].newAngle
            );

            return function (t) {
                const  position = midpoint(interpolateOuterLabel(t), labelRadius);
                const  [ax, y] = position;

                const linkDistance = 5;
                const label = (ax > 0)
                    ? {dx: linkDistance, textAnchor: "start"}
                    : {dx: -linkDistance, textAnchor: "end"};

                d3.select(g.selectAll(".link").nodes()[i])
                    .datum([
                        midpoint(interpolate(d)(t), outerRadius),
                        midpoint(interpolate(d)(t), outerRadius + linkDistance),
                        [ax, y],
                        [ax + label.dx, y]
                    ])
                    .attr("d", lineGenerator);

                d3.select(g.selectAll(".outer-label").nodes()[i])
                    .attr("dx", label.dx)
                    .style("text-anchor", label.textAnchor);

                return "translate(" + position + ")";
            };
        }

        const transition = d3.transition().duration(opts.duration);

        if (opts.gradient.enabled) {
            const gradient = defs.selectAll("radialGradient").data(data, function (d) { return d.label; });

            const gradientEnter = gradient.enter().append("radialGradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", "120%")
                .attr("id", function (d, i) { return id + "-grad" + i; });
            gradientEnter.append("stop")
                .attr("class", "grad-stop-0")
                .style("stop-color", function (d, i) { return pathColor(d, i); });
            gradientEnter.append("stop")
                .attr("class", "grad-stop-1")
                .attr("offset", opts.gradient.percentage + "%");

            defs.selectAll("radialGradient").select(".grad-stop-0")
                .transition(transition)
                .style("stop-color", function (d, i) { return pathColor(d, i); });
        }

        function key (d) { return d.data.label; }

        const pie = d3.pie()
            .sort(null)
            .value(function (d) { return d.value; });

        const sliceG = g.selectAll(".slice-g").data(pie(data), key);

        const sliceGEnter = sliceG.enter().append("g")
            .attr("class", "slice-g")
            .on("mouseover", function (d) {
                const tot = tooltip.datum().total;
                const percentage = (tot) ? Math.round(100 * d.data.value / tot) : NaN;
                if (d.data.value) {
                    tooltip
                        .transition().duration(300)
                        .style("opacity", 1);
                    tooltipText
                        .text(d.data.label + ((tot) ? ": " + d.data.value + " (" + percentage + "%)" : ""));
                } else {
                    tooltip.transition().duration(300).style("opacity", 0);
                }
                // eslint-disable-next-line no-invalid-this
                tooltip.each(function (datum) { datum.height = this.getBoundingClientRect().height; });
            })
            .on("mouseout", function () {
                tooltip.transition().duration(300).style("opacity", 0);
            })
            .on("mousemove", function () {
                const {pageX, pageY} = d3.event;
                tooltip
                    .style("left", (pageX) + "px")
                    .style("top", function (d) { return (pageY - d.height - 2) + "px"; });
            });

        sliceGEnter
            .append("path")
            .attr("id", function (d, i) { return id + "-slice" + i; })
            .attr("class", "slice")
            .attr("fill", function (d, i) {
                return opts.gradient.enabled
                    ? "url(#" + id + "-grad" + i + ")"
                    : pathColor(d.data, i);
            });

        sliceG
            .exit()
            .each(function (d, i) { data[i] = {value: 0, label: d.data.label}; });

        pie(data).forEach(function (d, i) {
            if (typeof currentData[d.data.label] === "undefined") {
                const a = (i) ? currentData[pie(data)[i - 1].data.label].endAngle : 0;
                currentData[d.data.label] = {startAngle: a, endAngle: a};
            }
        });

        g.selectAll(".slice")
            .data(pie(data), key)
            .transition(transition)
            .attrTween("d", arcTweenSlice)
            .end()
            .then(function () {
                data = data.filter(function (d, i) { return (i === 0 || d.value); });

                defs.selectAll("radialGradient").data(data, function (d) { return d.label; }).exit().remove();
                g.selectAll(".slice-g").data(pie(data), key).exit()
                    .each(function (d) {
                        delete currentData[d.data.label];
                        delete outerLabel[d.data.label];
                    })
                    .remove();

                for (const d of pie(data)) {
                    currentData[d.data.label] = d;
                    if (opts.labels.outer.format !== "none") {
                        outerLabel[d.data.label].currentAngle = outerLabel[d.data.label].newAngle;
                    }
                }
            })
            .catch(function (error) { console.warn(error); });  // eslint-disable-line no-console


        sliceGEnter.append("text")
            .attr("class", "inner-label")
            .attr("dy", ".35em");

        function opacityTweenInnerlabels (d) {
            if (!d.data.value) return function () { return 0; };
            return function (t) {
                const o = interpolate(d)(t);
                const percentage = 100 * (o.endAngle - o.startAngle) / (2 * Math.PI);
                return percentage < opts.labels.inner.hideWhenLessThanPercentage ? 0 : 1;
            };
        }

        g.selectAll(".inner-label").data(pie(data), key)
            .text(function (d) {
                return (d.data.label === "undefined")
                    ? "undefined"
                    : Math.round(100 * d.data.value / total) + "%";
            })
            .transition(transition)
            .attrTween("opacity", opacityTweenInnerlabels)
            .attrTween("transform", arcTweenInnerlabel);


        if (opts.labels.outer.format !== "none") {
            pie(data).forEach(function (d, i) {
                if (typeof outerLabel[d.data.label] === "undefined") {
                    const a = (i) ? currentData[pie(data)[i - 1].data.label].endAngle : 0;
                    outerLabel[d.data.label] = {
                        currentAngle: {startAngle: a, endAngle: a},
                        newAngle: {startAngle: a, endAngle: a}
                    };
                }

                let fx = 0;
                const [x, y] = midpoint(d, labelRadius);
                if (d.data.value) {
                    fx = (x >= 0) ? opts.labels.outer.collideHeight : -opts.labels.outer.collideHeight;
                }
                nodes.push({fx, y});
            });
            d3.forceSimulation(nodes).alphaMin(0.5)
                .force("collide", d3.forceCollide(opts.labels.outer.collideHeight / 2))
                // Custom force to keep all nodes on a circle.
                .force("boundY", function () {
                    for (const node of nodes) {
                        // Constrain the Y-position of the node to keep it on a circle.
                        node.y = limit(node.y);
                    }
                })
                .tick(30);

            const outerLabelsGEnter = sliceGEnter
                .append("g")
                .attr("class", "outer-label-g");

            outerLabelsGEnter.append("text")
                .attr("class", "outer-label")
                .attr("dy", ".35em")
                .text(key);

            outerLabelsGEnter.append("path")
                .attr("class", "link");

            g.selectAll(".outer-label-g").data(pie(data), key)
                .transition(transition)
                .style("opacity", function (d, i) { return (i && d.value) ? 1 : 0; })
                // eslint-disable-next-line no-invalid-this
                .each(function (d, i) { $(this).children(".link").attr("stroke", pathColor(d.data, i)); });

            g.selectAll(".outer-label").data(pie(data), key)
                .transition(transition)
                .attrTween("transform", arcTweenOuterlabel);
        }
    };
}
