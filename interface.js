/***** ***** Main functions ***** *****/

function init(degree) {
	initTree(degree);
    draw();
}
function initTree(m) {
	var b_plus_tree = window.b_plus_tree = new BPlusTree(m);
}
function draw() {
    var dot = document.getElementById("out").value = window.b_plus_tree.drawTree();  
    document.getElementById("tree_view").innerHTML = Viz(dot, "svg");
}
function insert(keys, degree) {
    checkTreeIsInited(degree);
    window.b_plus_tree.insert(keys);
    draw();
}
function remove(keys, degree) {
    checkTreeIsInited(degree);
    window.b_plus_tree.remove(keys);
    draw();
}
function find(keys, degree) {
    checkTreeIsInited(degree);
    window.b_plus_tree.search(keys);
    draw();
}
function random3(degree){
    //clear();
    checkTreeIsInited(degree);
    let numberKeys = Math.floor(Math.random() * 30);
    for (let i=0; i<numberKeys; i++) {
        window.b_plus_tree.insert(Math.floor(Math.random() * 1000)); 
    }
    draw();
}
function clear(degree){
    init(degree);
    draw();
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
        tryInitialize(degree);
    }
}
function tryInitialize(degree) {
    var text = "Tree uninitalized! Do you want to initialize it? Enter tree grade";
    var newDegree = prompt(text, degree);
    if(newDegree > 1){
        init(newDegree);
        document.getElementById("degree").value = newDegree;
        text = "Tree initalized!. Degree " + newDegree;
    }else{
        text = "The tree has not been initialized..";
    }
    window.alert(text);
}

/***** ***** Test ... ***** *****/

function insert2(keys) {
    //checkTreeIsInited();
    //keys.forEach(function(9) {window.b_plus_tree.root.insert(9); });
    //window.b_plus_tree.insert(1);
    //window.b_plus_tree.insert(random());
    random();
    
    window.b_plus_tree.delete(8);
    window.b_plus_tree.delete(5);
    window.b_plus_tree.delete(7);
    window.b_plus_tree.delete(10);
    window.b_plus_tree.printLeaves();
    window.b_plus_tree.validateReferentialIntegrityLeaves();
    draw();
    window.b_plus_tree.search(79);
}
function random(degree){
    checkTreeIsInited(degree);
    window.b_plus_tree.insert(0);
    window.b_plus_tree.insert(1);
    window.b_plus_tree.insert(2);
    window.b_plus_tree.insert(4);

    window.b_plus_tree.insert(5);
    window.b_plus_tree.insert(5);
    window.b_plus_tree.insert(8);
    window.b_plus_tree.insert(8);
    window.b_plus_tree.insert(8);

    window.b_plus_tree.insert(9);
    window.b_plus_tree.insert(10);
    window.b_plus_tree.insert(13);

    //window.b_plus_tree.insert(10);
    //window.b_plus_tree.insert(10);
    /*window.b_plus_tree.insert(10);
    window.b_plus_tree.insert(22);
    window.b_plus_tree.insert(16);
    window.b_plus_tree.insert(19);
    window.b_plus_tree.insert(18);

    window.b_plus_tree.insert(1);
    window.b_plus_tree.insert(2);
    window.b_plus_tree.insert(6);
    window.b_plus_tree.insert(9);
    window.b_plus_tree.insert(8);

    window.b_plus_tree.insert(3);
    window.b_plus_tree.insert(4);
    window.b_plus_tree.insert(5);
    window.b_plus_tree.insert(7);
    window.b_plus_tree.insert(15);
    window.b_plus_tree.insert(12);
    window.b_plus_tree.insert(16);
    window.b_plus_tree.insert(17);
    window.b_plus_tree.insert(14);
    window.b_plus_tree.insert(13);
    window.b_plus_tree.insert(21);
    window.b_plus_tree.insert(29);
    window.b_plus_tree.insert(31);
    window.b_plus_tree.insert(32);
    window.b_plus_tree.insert(33);
    window.b_plus_tree.insert(34);

    window.b_plus_tree.insert(41);
    window.b_plus_tree.insert(42);
    window.b_plus_tree.insert(46);
    window.b_plus_tree.insert(49);
    window.b_plus_tree.insert(48);

    window.b_plus_tree.insert(51);
    window.b_plus_tree.insert(52);
    window.b_plus_tree.insert(56);
    window.b_plus_tree.insert(59);
    window.b_plus_tree.insert(58); */
    draw();
}  