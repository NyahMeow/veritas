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
    const k = Math.max(1, Math.min(parseInt(kInput.value, 10) || 3, processedData.length - 1));

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
    // データの前処理を行います
    // この例では単純化のために、データをそのまま返します
    // 実際には数値データの抽出、正規化、変換などを行う必要があります
    return data.map(row => {
        // ここで行ごとの前処理を行う
        return row;
    });
}

function displayResults(clusters) {
    // 結果を表示します
    // ここではクラスタの配列をJSON形式で表示します
    document.getElementById('results').innerHTML = JSON.stringify(clusters);
}
