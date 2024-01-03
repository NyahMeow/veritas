// k-meansクラスタリングのスニペット
const kMeans = (data, k = 1) => {
  const centroids = data.slice(0, k);
  const distances = Array.from({ length: data.length }, () =>
    Array.from({ length: k }, () => 0)
  );
  const classes = Array.from({ length: data.length }, () => -1);
  let itr = true;
  const pointToCentroidDistances = Array(data.length).fill(0); // New array to store distances

  while (itr) {
    itr = false;

    for (let d in data) {
      for (let c = 0; c < k; c++) {
        distances[d][c] = Math.hypot(
          ...Object.keys(data[0]).map(key => data[d][key] - centroids[c][key])
        );
      }
      const m = distances[d].indexOf(Math.min(...distances[d]));
      if (classes[d] !== m) itr = true;
      classes[d] = m;
      pointToCentroidDistances[d] = distances[d][m]; // Store the distance to the closest centroid
    }

    for (let c = 0; c < k; c++) {
      centroids[c] = Array.from({ length: data[0].length }, () => 0);
      const size = data.reduce((acc, _, d) => {
        if (classes[d] === c) {
          acc++;
          for (let i in data[0]) centroids[c][i] += data[d][i];
        }
        return acc;
      }, 0);
      for (let i in data[0]) {
        centroids[c][i] = parseFloat(Number(centroids[c][i] / size).toFixed(2));
      }
    }
  }

  return { classes, pointToCentroidDistances }; // Return both classes and distances
};



// ヘルパー関数の定義

function mean(arr) {
    return arr.reduce((acc, val) => acc + val, 0) / arr.length;
}

function standardDeviation(arr) {
    const mu = mean(arr);
    return Math.sqrt(arr.reduce((acc, val) => acc + Math.pow(val - mu, 2), 0) / arr.length);
}



function standardize(data) {
    // 各列の平均と標準偏差を計算
    const means = data[0].map((_, colIndex) => {
        return mean(data.map(row => row[colIndex]));
    });
    const stdDevs = data[0].map((_, colIndex) => {
        return standardDeviation(data.map(row => row[colIndex]));
    });

    console.log("Means:", means); // Log the means
    console.log("Standard Deviations:", stdDevs); // Log the standard deviations

     // Standardize the data
    const standardizedData = data.map(row => {
        return row.map((cell, index) => {
            return (cell - means[index]) / stdDevs[index];
        });
    });

    console.log("Standardized Data:", standardizedData); // Log the standardized data

    return standardizedData;
}



function aggregateDataByCluster(data, clusters) {
    const clusterAggregates = {};

    clusters.forEach((cluster, index) => {
        if (!clusterAggregates[cluster]) {
            clusterAggregates[cluster] = {
                dataPoints: [],
                standardizedPoints: []
            };
        }
        clusterAggregates[cluster].dataPoints.push(data.rawData[index]);
        clusterAggregates[cluster].standardizedPoints.push(data.standardizedData[index]);
    });

    return clusterAggregates;
}



function calculateClusterStatistics(clusterAggregates) {
    const clusterStats = {};

    for (const cluster in clusterAggregates) {
        const dataPoints = clusterAggregates[cluster].dataPoints;
        const standardizedPoints = clusterAggregates[cluster].standardizedPoints;

        clusterStats[cluster] = {
            means: calculateMeansForEachFeature(dataPoints),
            standardizedMeans: calculateMeansForEachFeature(standardizedPoints),
            count: dataPoints.length
        };
    }

    return clusterStats;
}



function calculateMeansForEachFeature(dataPoints) {
    const means = [];
    const numberOfFeatures = dataPoints[0].length;

    for (let i = 0; i < numberOfFeatures; i++) {
        let featureMean = mean(dataPoints.map(point => point[i]));
        means.push(featureMean);
    }

    return means;
}



function displayClusterStatistics(clusterStats, features) {
    let meansTableHtml = "<table><tr><th>Cluster</th>";
    let zScoreMeansTableHtml = "<table><tr><th>Cluster</th>";
    let countTableHtml = "<table><tr><th>Cluster</th><th>Count</th></tr>";

    // Assuming the number of features is the same for all clusters
    const numberOfFeatures = clusterStats[Object.keys(clusterStats)[0]].means.length;

    // Headers for means and z-score means tables
    // Use feature names for table headers
    features.forEach(feature => {
         meansTableHtml += `<th>Mean of ${feature}</th>`;
        zScoreMeansTableHtml += `<th>Z-Score Mean of ${feature}</th>`;
    });

    meansTableHtml += "</tr>";
    zScoreMeansTableHtml += "</tr>";

  
    // Fill tables with data
    for (const cluster in clusterStats) {
        const stats = clusterStats[cluster];
      
        meansTableHtml += `<tr><td>${cluster}</td>`;
        zScoreMeansTableHtml += `<tr><td>${cluster}</td>`;
        countTableHtml += `<tr><td>${cluster}</td><td>${stats.count}</td></tr>`;

       stats.means.forEach(mean => {
            meansTableHtml += `<td>${mean.toFixed(2)}</td>`;
        });
        stats.standardizedMeans.forEach(standardizedMean => {
            zScoreMeansTableHtml += `<td>${standardizedMean.toFixed(2)}</td>`;
        });

        meansTableHtml += "</tr>";
        zScoreMeansTableHtml += "</tr>";
    }

    meansTableHtml += "</table>";
    zScoreMeansTableHtml += "</table>";
    countTableHtml += "</table>";

    // Display the tables
    document.getElementById('clusterMeans').innerHTML = meansTableHtml;
    document.getElementById('clusterZScoreMeans').innerHTML = zScoreMeansTableHtml;
    document.getElementById('clusterCounts').innerHTML = countTableHtml;
}


function preprocessData(data) {
    const names = []; // To store ID names
    const features = Object.keys(data[0]).slice(1); // Extract feature names, assuming they are in the first row
    const processedData = data.map(row => {
        names.push(row['names']); // ID names
        return features.map(feature => parseFloat(row[feature]) || 0);
    });

    console.log(processedData, names, features);
    return { processedData, names, features }; // Return processed data, names, and feature names
}


function performClusterAnalysis(data) {
    // preprocessDataから処理されたデータとID名を取得
    const { processedData, names, features } = preprocessData(data);
    const standardizedData = standardize(processedData);
  
    // ユーザー入力からkの値を取得
    const kInput = document.getElementById('kValue');
    let k = parseInt(kInput.value, 10);

    console.log("ユーザーが入力したkの値:", k);
    console.log("処理されたデータの長さ:", processedData.length);

    // kが正の整数で、データポイント数より小さいことを確認
    if (isNaN(k) || k <= 0 || k >= processedData.length) {
        k = Math.min(3, processedData.length - 1);
        alert(`Invalid k value. Using default value of ${k}.`);
    }

    // kMeansクラスタリング関数を使用してクラスタリングを実行
    const clusters = kMeans(standardizedData, k);

    // Retrieve classes and distances
    const { classes, pointToCentroidDistances } = kMeans(standardizedData, k);
  
　  const clusterAggregates = aggregateDataByCluster({ rawData: processedData, standardizedData }, clusters);
    const clusterStats = calculateClusterStatistics(clusterAggregates);
    
    displayClusterStatistics(clusterStats, features);// Pass feature names
    displayResults(clusters, names, pointToCentroidDistances); // ID名も渡す// Pass distances to display function
}



function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // 読み込まれたデータをコンソールに出力
        console.log(json);

        performClusterAnalysis(json);
    };

    reader.onerror = function(e) {
        console.error("ファイルの読み込み中にエラーが発生しました:", e);
    };

    reader.readAsBinaryString(file);
}


// イベントリスナーの設定
document.getElementById('analyzeButton').addEventListener('click', processFile);




// 結果を表示します
function displayResults(clusters, names, distances) {
    let resultsHtml = "<table><tr><th>ID名</th><th>クラスタ</th><th>Distance to Centroid</th></tr>";

    clusters.forEach((cluster, index) => {
        resultsHtml += `<tr><td>${names[index]}</td><td>${cluster}</td><td>${distances[index].toFixed(2)}</td></tr>`;
    });

    resultsHtml += "</table>";

    document.getElementById('clusterResults').innerHTML = resultsHtml;
}
