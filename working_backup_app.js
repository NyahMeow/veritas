// k-meansクラスタリングのスニペット
const kMeans = (data, k = 1) => {
  const centroids = data.slice(0, k);
  const distances = Array.from({ length: data.length }, () =>
    Array.from({ length: k }, () => 0)
  );
  const classes = Array.from({ length: data.length }, () => -1);
  let itr = true;

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

  return classes;
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

    // データを標準化
    return data.map(row => {
        return row.map((cell, index) => {
            return (cell - means[index]) / stdDevs[index];
        });
    });
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
            mean: mean(dataPoints.flat()),
            standardizedMean: mean(standardizedPoints.flat()),
            count: dataPoints.length
        };
    }

    return clusterStats;
}



function displayClusterStatistics(clusterStats) {
    let tableHtml = "<table><tr><th>クラスタ</th><th>平均値</th><th>標準化平均値</th><th>カウント</th></tr>";

    for (const cluster in clusterStats) {
        const stats = clusterStats[cluster];
        tableHtml += `<tr><td>${cluster}</td><td>${stats.mean}</td><td>${stats.standardizedMean}</td><td>${stats.count}</td></tr>`;
    }

    tableHtml += "</table>";

    document.getElementById('clusterStatistics').innerHTML = tableHtml;
}



function preprocessData(data) {
    const names = []; // ID名を保持する配列
    const processedData = data.map(row => {
        names.push(row['names']); // ID名を追加
        const values = Object.values(row);
        return values.slice(1).map(value => parseFloat(value) || 0);
    });

    // 処理されたデータとID名をコンソールに出力
    console.log(processedData, names);
    return { processedData, names }; // 処理されたデータとID名を返す
}



function performClusterAnalysis(data) {
    // preprocessDataから処理されたデータとID名を取得
    const { processedData, names } = preprocessData(data);
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
　  const clusterAggregates = aggregateDataByCluster({ rawData: processedData, standardizedData }, clusters);
    const clusterStats = calculateClusterStatistics(clusterAggregates);
    
    displayClusterStatistics(clusterStats);
    displayResults(clusters, names); // ID名も渡す
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
function displayResults(clusters, names) {
    let tableHtml = "<table><tr><th>ID名</th><th>クラスタ</th></tr>";

    clusters.forEach((cluster, index) => {
        tableHtml += `<tr><td>${names[index]}</td><td>${cluster}</td></tr>`;
    });

    tableHtml += "</table>";

    document.getElementById('clusterResults').innerHTML = tableHtml;
}
