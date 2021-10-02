var indIds;
var indMetaData;
var indSamples


d3.select('#individual-select')
  .on('change', function() {
    
    var selectValue = d3.select(this).property('value');
    loadViz(selectValue);
});

d3.json("data/samples.json")
    .then(function(data){
        
        indMetaData = data.metadata;
        indSamples = data.samples;

        
        indDropDown(data.names);
    });

function indDropDown(names){
    
    
    var indSelectOptions = d3.select("#individual-select")
        .selectAll('individuals')
            .data(names)
        .enter()
            .append('option')
        .text((id) => "Individual - " + id)
        .attr("value", (id) => id);

        
        var counter = 0;
        indSelectOptions.property("selected", function(d) {
            if (counter === 0){
                loadViz(d);
            }
            counter ++;
            return counter === 1;          
        });
}

function loadViz(indIdString){

    var indId = parseInt(indIdString)||0;

    loadMD(indId);
    top10CultureChart(indId);
    bubbleChart(indId);
    washFrequencyGauge(indId);
}

function loadMD(indId){

    
    var mdEntries = d3.select("#demographic-entries")
    mdEntries.html("");

    
    var filteredMD = indMetaData.find(function(metaData) {
        return metaData.id === indId;
    });

   
    d3.entries(filteredMD).forEach(entry => {
        mdEntries.append("dt")
            .attr("class", "col-sm-3 text-nowrap text-capitalize")
            .text(entry.key)

        mdEntries.append("dd")
        .attr("class", "col-sm-9")
        .text(entry.value)
    });
}

function top10CultureChart(indId){
    
    var filteredSamples = indSamples.find(function(sample){
        return (parseInt(sample.id)||0) === indId;
    });

    
    var trace = [{
        type: 'bar',
        x: filteredSamples.sample_values.slice(0,10).reverse(), //first ten desc
        y: filteredSamples.otu_ids.slice(0,10).reverse().map(d => {return "OTU " + d;}), //first ten desc - Map reversed
        text: filteredSamples.otu_labels.slice(0,10).reverse(), //first ten desc
        orientation: 'h',
        width: 0.8
      }];

    
    var layout = {
        title: "Top 10 Bacteria Cultures Found"
    }

    var config = {responsive: true}
    Plotly.newPlot("top-10-cultures", trace, layout, config)
}

function bubbleChart(indId){

    var filteredSamples = indSamples.find(function(sample){
        return (parseInt(sample.id)||0) === indId;
    });

    var marker_size = 60;

     
     var trace = [{
        x: filteredSamples.otu_ids,
        y: filteredSamples.sample_values,
        mode: 'markers',
        marker: {
            size: filteredSamples.sample_values,
            sizeref: 2.0 * Math.max(...filteredSamples.sample_values) / (marker_size**2),    
            sizemode: 'area',
            color: filteredSamples.otu_ids,
            colorscale: 'Earth'
        },
        text: filteredSamples.otu_labels       
      }];

    var layout = {
        title: "Bacteria Cultures Per Sample",
        xaxis: {
            title: {
                text: 'OTU ID',
                font: {
                    family: 'Oxygen , sans-serif',
                    size: 12                
                }
            },
        }         
    }

    var config = {responsive: true}

    //plot
    Plotly.newPlot("samples-bubble-chart", trace, layout, config)
}

function washFrequencyGauge(indId){
    
    
    var filteredMD = indMetaData.find(function(metaData) {
        return metaData.id === indId;
    });

    var trace = [{
          domain: { x: [0, 1], y: [0, 1] },
          value: filteredMD.wfreq,
          title: { text: "Scrubs per week" },
          type: "indicator",
          mode: "gauge",
          gauge: {
            axis: { range: [null, 9], dtick:1 },
            threshold: {
                line: { color: "#800080", width: 4 },
                thickness: 0.8,
                value: filteredMD.wfreq
            },
            steps: [
                { range: [0, 1], color: "#d0e1e1" },
                { range: [1, 2], color: "#b8d2d2" },
                { range: [2, 3], color: "#adc3c3" },
                { range: [3, 4], color: "#88b3b3" },
                { range: [4, 5], color: "#70a4a4" },
                { range: [5, 6], color: "#5c9191" },
                { range: [6, 7], color: "#4d7979" },
                { range: [7, 8], color: "#3e6161" },
                { range: [8, 9], color: "#2e4949" }
              ]                     
          }
    }];
    
        
    var layout = {
        title: "Belly Button Washing Frequency"             
    }

    var config = {responsive: true}

    
    Plotly.newPlot("wash-freq-gauge", trace, layout, config)

}