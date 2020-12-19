/***** ***** Main functions ***** *****/

function init(degree) {
	initTree(degree);
    draw();
}
function initTree(m) {
	var b_plus_tree = window.b_plus_tree = new BPlusTree(m);
}
function draw() {
    let dot = window.b_plus_tree.drawTree(); //let dot = document.getElementById("out").value = window.b_plus_tree.drawTree();  
    document.getElementById("tree_view").innerHTML = Viz(dot, "svg");
}
function insert(keys, degree) {
    if(checkEmpty(keys)){ return; }
    if(checkTreeIsInited(degree)){
        window.b_plus_tree.insert(keys);
        draw();
    }
}
function remove(keys, degree) {
    if(checkEmpty(keys)){ return; }
    if(checkTreeIsInited(degree)){
        window.b_plus_tree.remove(keys);
        window.b_plus_tree.validateReferentialIntegrityLeaves();
        draw();
    } 
}
function find(keys, degree) {
    if(checkEmpty(keys)){ return; }
    if(checkTreeIsInited(degree)){
        checkTreeIsInited(degree);
        window.b_plus_tree.search(keys);
        draw();
    }
}
function random(degree){
    clear_tree(degree);
    if(checkTreeIsInited(degree)){
        let numberKeys = Math.floor(Math.random() * 30);
        for (let i=0; i<numberKeys; i++) {
            window.b_plus_tree.insert(Math.floor(Math.random() * 1000)); 
        }
        draw();
    }
}
function clear_tree(degree){
    init(degree);
}

/***** ***** Auxiliary functions ***** *****/

function readInput(input) {
    return (isNumber(document.getElementById(input).value)
        ? [parseFloat(document.getElementById(input).value)]
        : document.getElementById(input).value.split(",").map(function(v){ return isNumber(v) ? parseFloat(v) : v; }));
}
function readInput10(input) {
    return parseInt(document.getElementById(input).value, 10);
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function checkTreeIsInited(degree) {
    if (typeof(window.b_plus_tree) === "undefined") {
        alert("Tree uninitalized!");
        return tryInitialize(degree);
    }
    return true;
}
function tryInitialize(degree) {
    let text = "Tree uninitalized! Do you want to initialize it? Enter tree grade";
    let newDegree = prompt(text, degree);
    let status = false;
    if(newDegree > 1){
        init(newDegree);
        document.getElementById("degree").value = newDegree;
        text = "Tree initalized!. Degree " + newDegree;
        status = true;
    }else{
        text = "The tree has not been initialized..";
        status = false;
    }
    window.alert(text);
    return status;
}
function checkEmpty(strValue){
    return (strValue == "") ? true: false;
}