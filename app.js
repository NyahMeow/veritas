document.getElementById('analyzeButton').addEventListener('click', processFile);

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

        performClusterAnalysis(json);
    };

    reader.readAsBinaryString(file);
}


function performClusterAnalysis(data) {
    const processedData = preprocessData(data);

    // ユーザー入力からkの値を取得
    const kInput = document.getElementById('kValue');
    let k = parseInt(kInput.value, 10);

    // kが正の整数で、データポイント数より小さいことを確認
    if (isNaN(k) || k <= 0 || k >= processedData.length) {
        k = Math.min(3, processedData.length - 1); // 適切なデフォルト値を設定
        alert(`Invalid k value. Using default value of ${k}.`);
    }

    const kmeans = new ML.KMeans({
        k: k,
        initialization: 'mostDistant',
        seed: Math.random(),
    });

    const clusters = kmeans.predict(processedData);
    displayResults(clusters);
}

// ... その他の関数（preprocessData, displayResults）...


function preprocessData(data) {
    return data.map(row => {
        // データの前処理を行います
        // 実際には数値データの抽出、正規化、変換などを行う必要があります
        // 都道府県名を除外し、数値データのみの配列を作成
        const values = Object.values(row);
        return values.slice(1).map(value => parseFloat(value) || 0);
    });
}

function displayResults(clusters) {
    // 結果を表示します
    // ここではクラスタの配列をJSON形式で表示します
    document.getElementById('results').innerHTML = JSON.stringify(clusters);
}
