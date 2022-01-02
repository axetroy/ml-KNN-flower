const KNN = require("ml-knn");
const csv = require("csvtojson");
const prompt = require("prompt");
const _ = require("lodash");

var knn;

const csvFilePath = "iris.csv"; // 数据集

const names = ["花萼长度", "花萼宽度", "花瓣长度", "花瓣宽度", "类型"];

const separationSize = 0.7; // 数据取样比例

let dataSet = []; // 数据集

/**
 * 训练集
 * @type {Array<Array<number>>}
 */
let trainingSetX = [];
/**
 * 训练集 - 结果
 * @type {Array<string>}
 */
let trainingSetY = [];

/**
 * 测试集
 * @type {Array<Array<number>>}
 */
let testSetX = [];
/**
 * 测试集 - 结果
 * @type {Array<string>}
 */
let testSetY = [];

csv({
    noheader: true,
    headers: names,
})
    .fromFile(csvFilePath)
    .on("json", (jsonObj) => {
        dataSet.push(jsonObj); // 将数据集转换为 js 对象数组
    })
    .on("done", (error) => {
        dataSet = shuffleArray(dataSet); // 打乱顺序
        dressData();
    });

function dressData() {
    // 所有类型集合
    const typesArray = _.uniq(dataSet.map((row) => row["类型"]));

    console.log(typesArray);

    /**
     * @type {Array<Array<number>>}
     */
    const X = [];
    /**
     * @type {Array<string>}
     */
    const Y = [];

    dataSet.forEach((row) => {
        // 排除类型，取其他值，并且转换成 float64
        const rowArray = Object.keys(row)
            .map((key) => parseFloat(row[key]))
            .slice(0, 4);

        const typeNumber = typesArray.indexOf(row["类型"]); // 转换 type(String) to type(Number)

        X.push(rowArray);
        Y.push(typeNumber);
    });

    // 取样大小
    const len = parseInt(separationSize * dataSet.length);

    // 训练数据
    trainingSetX = X.slice(0, len);
    trainingSetY = Y.slice(0, len);

    // 剩下未训练的，用来测试
    testSetX = X.slice(len);
    testSetY = Y.slice(len);

    train();
}

// 使用 KNN 算法训练数据
function train() {
    knn = new KNN(trainingSetX, trainingSetY, {
        k: 7,
    });
    test();
}

// 测试训练的模型
function test() {
    const result = knn.predict(testSetX);
    const testSetLength = testSetX.length;
    const predictionError = error(result, testSetY);
    console.log(
        `Test Set Size = ${testSetLength} and number of Misclassifications = ${predictionError}`
    );
    predict();
}

// 计算出错个数
function error(predicted, expected) {
    let misclassifications = 0;
    for (var index = 0; index < predicted.length; index++) {
        if (predicted[index] !== expected[index]) {
            misclassifications++;
        }
    }
    return misclassifications;
}

// 根据输入预测结果
function predict() {
    let temp = [];
    prompt.start();
    prompt.get(
        ["花萼长度", "花萼宽度", "花瓣长度", "花瓣宽度"],
        function (err, result) {
            if (!err) {
                for (var key in result) {
                    temp.push(parseFloat(result[key]));
                }
                console.log(`With ${temp} -- type =  ${knn.predict(temp)}`);
            }
        }
    );
}
