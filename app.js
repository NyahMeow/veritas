// イベントリスナーの設定
document.getElementById('analyzeButton').addEventListener('click', processFile);


function preprocessData(data) {
    // データの前処理を実行
    const processedData = data.map(row => {
        // データの前処理を行います
        // 実際には数値データの抽出、正規化、変換などを行う必要があります
        // 都道府県名を除外し、数値データのみの配列を作成
        const values = Object.values(row);
        return values.slice(1).map(value => parseFloat(value) || 0);
    });

    // 処理されたデータをコンソールに出力
    console.log(processedData);
    return processedData;
}



function performClusterAnalysis(data) {
    const processedData = preprocessData(data);

    // ユーザー入力からkの値を取得
    const kInput = document.getElementById('kValue');
    let k = parseInt(kInput.value, 10);

    console.log("ユーザーが入力したkの値:", k);

    // 処理されたデータの長さを出力
    console.log("処理されたデータの長さ:", processedData.length);

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


// ... その他の関数（preprocessData, displayResults）...


function displayResults(clusters) {
    // 結果を表示します
    // ここではクラスタの配列をJSON形式で表示します
    document.getElementById('results').innerHTML = JSON.stringify(clusters);
}
