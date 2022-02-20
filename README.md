# rspamd-D3Pie
D3 pie/donut chart for Rspamd

Live demo is available at https://moisseev.github.io/rspamd-D3Pie/demo/

## Requirements

In your page, include the `D3` and `jQuery` libraries. These can be placed anywhere:
```html
<script src="https://d3js.org/d3.v5.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

## Installing

You can download files or load files directly using [RawGit](https://rawgit.com/).

For production usage link a specific tag or commit. For example:
```html
<script src="//cdn.rawgit.com/moisseev/rspamd-D3Pie/14673e0e85ad656313f76f0071f1dee33b521606/d3pie.js"></script>
<link rel="stylesheet" type="text/css" href="//cdn.rawgit.com/moisseev/rspamd-D3Pie/14673e0e85ad656313f76f0071f1dee33b521606/d3pie.css">
```
For development you can also use links to the latest version. Do not use these links in production, excessive traffic will be throttled and blacklisted by RawGit. For example:
```html
<script src="//cdn.rawgit.com/moisseev/rspamd-D3Pie/main/d3pie.js"></script>
<link rel="stylesheet" type="text/css" href="//cdn.rawgit.com/moisseev/rspamd-D3Pie/main/d3pie.css">
```

## API

The API functions are accessible like so:
```javascript
var pie = new D3Pie("id", options);
pie.destroy();
```

**D3Pie**(_id_[, _options_])    
is the chart constructor, which takes two parameters. The first parameter is the ID string. The second one is an _options_ hash object. 

### The options object

Default settings:
```javascript
{
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
}
```

Options details:

Option | Type | Default | Description
---| --- | --- | ---
**canvasPadding** | `number` | 5 | Padding of the `svg` container in pixels.
**cornerRadius** | `number` | 3 | Corner radius of a slice.
**duration**    | `number` | 1250 | Transition effects duration in milliseconds.
**gradient**      | `hash` || The `gradient` hash object.
gradient.enabled | `boolean` | true | Add a gradient effect to the pie chart segments. 
gradient.percentage | `number` | 100 |
**labels**     | `hash` | | The `labels` hash object.
labels.inner.hideWhenLessThanPercentage | `number` | 4 | Hide the inner label when the percentage is less than a certain amount. If set to `null`, never hide the labels. 
labels.inner.offset | `number` | 0.15 | Offset of the inner labels from the center mass of the segment. The value is specified as a fraction of the distance between an arc and the segment center. Positive - to the outer arc, negative - to the inner arc.
labels.outer.collideHeight | `number` | 13 | Pixel height. Used by a collision detection, that prevents outer labels from overlapping.
labels.outer.format | `string` | label | `none` - hide outer labels, `label` - show segment labels. 
labels.outer.pieDistance | `number` | 30 | The distance in pixels from the outside of the pie to the outer label. This also governs the length of the label links.
**padAngle** | `number` | 0.01 | Angle of the pad between adjacent slices.
**pieCenterOffset** | `hash` | see description | Fine-tune the position of the pie chart on the canvas. The default is `{x: 0, y: 0}`
**size**        | `hash` | | The pie `size` hash object.
size.canvasHeight | `number` | 400 | Height of the chart in pixels.
size.canvasWidth | `number` | 600 | Width of the chart in pixels.
size.pieOuterRadius | `string`, `number` | 85% | Outer radius of the pie. Can be specified as a percentage of available space (a string like "50%") or a pixel value (a number like 200).
size.pieInnerRadius | `string`, `number` | 20% | Inner radius of the pie. Can be specified as a percentage of the outer radius (a string like "50%") or a pixel value (a number like 200).
**title**       | `string` | empty | Title of the chart.

### Methods
Method | Default | Description
---| :---: | ---
**data**(_dataset_)     | -        | Reads _dataset_. See [Reading data](#reading-data).
**destroy**()           | -        | Removes a chart instance from the page.

## Reading data

JSON dataset format:
```json
[
  {
    "label": "no action",
    "value": 1850,
    "color": "#66CC00"
  },
...
  {
    "label": "reject",
    "value": 718,
    "color": "#FF0000"
  }
]
```
Each array element is represented as a pie chart segment.

Loading dataset with d3.json:
```javascript
function getJSON (uri) {
    d3.json(uri, function (error, json) {
        if (error) return console.warn("d3.json error: " + error);
        pie.data(json);
    });
}
```
