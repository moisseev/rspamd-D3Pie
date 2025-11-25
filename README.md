# rspamd-D3Pie
D3 pie/donut chart for Rspamd

Live demo is available at https://moisseev.github.io/rspamd-D3Pie/demo/

## Requirements

In your page, include the `D3` and `jQuery` libraries. These can be placed anywhere:
```html
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.1.min.js"></script>
```

### Browser Compatibility

This library requires browser support for ES2018 features.

## Installing

You can download files or load files directly from a CDN.

### Using jsDelivr CDN (Recommended)

**Latest release version:**
```html
<script src="https://cdn.jsdelivr.net/gh/moisseev/rspamd-D3Pie@latest/d3pie.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moisseev/rspamd-D3Pie@latest/d3pie.css">
```

**Specific version (recommended for production):**
```html
<script src="https://cdn.jsdelivr.net/gh/moisseev/rspamd-D3Pie@2.0.3/d3pie.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moisseev/rspamd-D3Pie@2.0.3/d3pie.css">
```

**Specific commit hash:**
```html
<script src="https://cdn.jsdelivr.net/gh/moisseev/rspamd-D3Pie@6264f53/d3pie.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moisseev/rspamd-D3Pie@6264f53/d3pie.css">
```

**Latest from master branch (for development):**
```html
<script src="https://cdn.jsdelivr.net/gh/moisseev/rspamd-D3Pie@master/d3pie.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moisseev/rspamd-D3Pie@master/d3pie.css">
```

### Using GitHub Raw URLs (Alternative)

For direct access to files from the repository:
```html
<script src="https://raw.githubusercontent.com/moisseev/rspamd-D3Pie/master/d3pie.js"></script>
<link rel="stylesheet" type="text/css" href="https://raw.githubusercontent.com/moisseev/rspamd-D3Pie/master/d3pie.css">
```

**Note:** GitHub Raw URLs are not intended for production use as a CDN. Use jsDelivr for better performance and reliability.

## Building

To generate a minified version of the library:

```sh
npm run build
```

This creates `d3pie.min.js` in the project root directory. The minified file is excluded from version control.

## API

The API functions are accessible like so:
```javascript
var pie = new D3Pie("id", options);
pie.destroy();
```

**D3Pie**(_id_[, _options_])    
is the chart constructor, which takes two parameters. 

The first parameter is the **ID string** - must match an existing HTML element's `id` attribute. The ID must start with a letter, underscore, or hyphen, and contain only alphanumeric characters, hyphens (`-`), and underscores (`_`). Special characters and leading digits are not allowed as they cause issues with CSS selectors.

The second parameter is an _options_ hash object.

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
    title: "",
    total: {
        enabled: false
    }
}
```

Options details:

Option | Type | Default | Valid Range | Description
---| --- | --- | --- | ---
**canvasPadding** | `number` | 5 | ≥ 0 | Padding of the `svg` container in pixels.
**cornerRadius** | `number` | 3 | ≥ 0 | Corner radius of a slice.
**duration**    | `number` | 1250 | ≥ 0 | Transition effects duration in milliseconds.
**gradient**      | `hash` | | | The `gradient` hash object.
gradient.enabled | `boolean` | true | | Add a gradient effect to the pie chart segments. 
gradient.percentage | `number` | 100 | 0-100 | Gradient stop offset percentage.
**labels**     | `hash` | | | The `labels` hash object.
labels.inner.hideWhenLessThanPercentage | `number` | 4 | 0-100 | Hide the inner label when the percentage is less than a certain amount. If set to `null`, never hide the labels. 
labels.inner.offset | `number` | 0.15 | -1 to 1 | Offset of the inner labels from the center mass of the segment. The value is specified as a fraction of the distance between an arc and the segment center. Positive - to the outer arc, negative - to the inner arc.
labels.outer.collideHeight | `number` | 13 | ≥ 1 | Pixel height. Used by a collision detection, that prevents outer labels from overlapping.
labels.outer.format | `string` | label | "none" or "label" | `none` - hide outer labels, `label` - show segment labels. 
labels.outer.pieDistance | `number` | 30 | ≥ 0 | The distance in pixels from the outside of the pie to the outer label. This also governs the length of the label links.
**padAngle** | `number` | 0.01 | 0 to 2π | Angle of the pad between adjacent slices in radians. Note: When a slice is larger than 50% and `padAngle` ≥ 1.0, the inner arc may wrap > 180° causing visual artifacts in donut charts. A mask prevents artifacts from showing through the center, but they may still be visible through gaps between other slices with extreme `padAngle` values.
**pieCenterOffset** | `hash` | see description | | Fine-tune the position of the pie chart on the canvas. The default is `{x: 0, y: 0}`
pieCenterOffset.x | `number` | 0 | any | Horizontal offset in pixels.
pieCenterOffset.y | `number` | 0 | any | Vertical offset in pixels.
**size**        | `hash` | | | The pie `size` hash object.
size.canvasHeight | `number` | 400 | ≥ 50 | Height of the chart in pixels.
size.canvasWidth | `number` | 600 | ≥ 50 | Width of the chart in pixels.
size.pieOuterRadius | `string`, `number` | 85% | 0-99% or ≥ 0 | Outer radius of the pie. Can be specified as a percentage of available space (a string like "50%") or a pixel value (a number like 200).
size.pieInnerRadius | `string`, `number` | 20% | 0-99% or ≥ 0 | Inner radius of the pie. Can be specified as a percentage of the outer radius (a string like "50%") or a pixel value (a number like 200).
**title**       | `string` | empty | | Title of the chart.
**total** | `hash` | | | The `total` hash object.
total.enabled | `boolean` | false | | Put the total value in the center of the chart. 
total.label | `string` | Total | | Total label.

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
