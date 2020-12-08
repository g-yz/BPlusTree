//CONSTANTS
const NEED_TO_REORDER = true;
const NO_NEED_TO_REORDER = false;
const NODE_INTERNAL = 0;
const NODE_LEAF = 1;
//******************************** BASE NODE ********************************
function insertSlice(origin, newElement, posicion){
	return origin.slice(0, posicion).concat(newElement).concat(origin.slice(posicion,origin.length));
};
function deleteSlice(origin, posicion){
	return origin.slice(0, posicion).concat(origin.slice(posicion+1,origin.length));
};
class PNode {
	constructor(keys, degree, type) {
		this.keys = keys !== null ? keys : []; 
		this.DEGREE = degree > 2 ? degree : 3;
		this.maxNumberKeys = this.DEGREE-1;
		this.minNumberKeys = Math.floor(this.maxNumberKeys/2);
		this.type = type;
	}
	isLeaf() { 
		return this.type;
	};
	numberKeys() {
		return this.keys.length;
	}; 
	isEmpty() {
		return this.numberKeys() == 0;
	};
	isUnderMinimumCapacity() {
		return this.numberKeys() < this.minNumberKeys;
	};
	isOverMaximumCapacity() {
		return this.numberKeys() > this.maxNumberKeys;
	};
	isStableCapacity() {
		return this.numberKeys() > this.minNumberKeys;
	};
	printKeys(){
		let bufer = "";
		for (let i=0; i<this.numberKeys(); i++) {
			bufer += " " + this.keys[i];
		}
		return bufer;
	} 
	printReverseKeys(){
		let bufer = "";
		for (let i=this.numberKeys()-1; i>=0; i--) {
			bufer += " " + this.keys[i];
		} 
		return bufer;
	}
	findChildSlot(K) {
		for (var i=0; i<this.numberKeys(); i++) {
			if(this.keys[i] >= K){
				return (this.keys[i] == K)? i+1: i;  // IF IS EQUAL NEXT NODE
			}
		}
		return i;
	};
	___insert(newkey) {
		let index = this.findChildSlot(newkey);
		this.keys = insertSlice(this.keys, newkey, index);
	};
};

class Node extends PNode {
	constructor(keys, children, degree) {
		super(keys, degree, NODE_INTERNAL);
		this.children = children !== null ? children : []; 
	}
	/**
	 ** INSERT **
	**/
	insert(father, n, newKey) {
		let i = this.findChildSlot(newKey);
		let newRoot = this.children[i].insert(this, i, newKey);
		//THE ROOT IS OVER MAXIMUN CAPACITY => SPLIT NODE
		if(this.isOverMaximumCapacity() ){ 
			let {newNode, ascendingKey} = this.spliceNode();
			//CREATE NEW ROOT
			if(father == null){ 
				newRoot = new Node([], [], this.DEGREE); 
				newRoot.children[0] = this;
				newRoot.children[1] = newNode;
				newRoot.keys.push(ascendingKey);
			// PUSH KEY TO FATHER
			}else{ 
				father.___insert(ascendingKey);
				father.children = insertSlice(father.children, newNode, n+1);
			}
		}
		return newRoot;
	};
	spliceNode(){
		this.partSize1 = Math.floor(this.numberKeys()/2);
		
		let ascendingKey = this.keys[this.partSize1];

		this.part1 = this.keys.slice(0,this.partSize1);
		this.part2 = this.keys.slice(this.partSize1+1, this.numberKeys());
		this.keys = this.part1;
		
		this.partChildren1 = this.children.slice(0,this.partSize1+1);
		this.partChildren2 = this.children.slice(this.partSize1+1, this.children.length);
		this.children = this.partChildren1;
		
		this.newNode = new Node(this.part2, this.partChildren2, this.DEGREE);
		return {newNode: this.newNode, ascendingKey: ascendingKey};		
	}
	/**
	 ** DELETE **
	**/
	remove(father,position, K) {
		let index_child = this.findChildSlot(K);

		if(this.children[index_child].remove(this,index_child,K)){
			console.log(" >> DELETE NODE * " + this.keys[0] + " POSICION FATHER : " + position + " POSITION CHILDREN " + index_child);
			//IS ROOT
			if(father == null && this.numberKeys() == 1){
				return NEED_TO_REORDER;
			}
			//REMOVE KEYS AND CHILDREN
			this.keys = index_child == 0?  deleteSlice(this.keys, index_child): deleteSlice(this.keys, index_child-1);
			this.children = deleteSlice(this.children, index_child);

			var next = position+1;
			var prev = position-1;

			if(this.isUnderMinimumCapacity()){
				if(father!= null && father.children!= null){
					//NEXT IS STABLE THEN ROTATE LEFT
					if(father.children[next] != null && father.children[next].isStableCapacity()){
						this.rotateLeft(father.children[next]);
						father.keys[position] = father.children[next].getMimElement();
						return NO_NEED_TO_REORDER;
					//PREV IS STABLE THEN ROTATE RIGHT
					}else if(father.children[prev] != null && father.children[prev].isStableCapacity()){
						this.rotateRight(father.children[prev]);
						father.keys[prev] = this.getMimElement();
						return NO_NEED_TO_REORDER;
					//PREV IS NOT FULL THEN MERGE WITH PREV
					}else if(father.children[prev] != null){
						father.children[prev].merge(this);
						//father.children[prev] = father.children[position]; //duda actualizat
						return NEED_TO_REORDER;
					//NEXT IS NOT FULL THEN MERGE WITH NEXT
					}else if(father.children[next] != null){
						this.merge(father.children[next]);
						father.children[next] = father.children[position];
						return NEED_TO_REORDER;
					}
				}
				return NEED_TO_REORDER;
			}
			return NO_NEED_TO_REORDER;
		}
	};
	rotateLeft(next){
		this.keys = this.keys.concat(next.getMimElement());
		next.keys.shift();
		this.children = this.children.concat(next.children[0]);
		next.children.shift();
	};
	rotateRight(prev){
		this.keys = [].concat(this.getMimElement()).concat(this.keys);
		this.children = [].concat(prev.children[prev.numberKeys()]).concat(this.children);
		prev.keys.pop();
		prev.children.pop();
	};
	merge(nodeNext){
		this.keys = this.keys.concat(nodeNext.getMimElement()).concat(nodeNext.keys);
		this.children = this.children.concat(nodeNext.children);
		return true;
	}
	/**
	 ** SEARCH **
	 */
	_search(K) {
		let i = this.findChildSlot(K);
		return this.children[i]._search(K);
	};
	/**
	 ** PRINT **
	**/
	printKeysAndPointers(){
		let labelKeys = "";
		let labelPointers = "";
		for (var i=0; i<this.numberKeys(); i++) {
			labelKeys += "<f" + String(i) + ">";
			labelKeys += String(this.keys[i]);
			if(i != this.numberKeys()-1){
				labelKeys += "|";
			}
			labelPointers += "<g" + String(i) + ">*";
			labelPointers += "|";
		}
		labelPointers += "<g" + String(i) + ">*";
		return {labelKeys, labelPointers};
	}
	walk(counter, writer) {
		var nodeid = "node" + String(counter.addNode()) ;

		writer.write(nodeid + "[label = \"{{");
		let {labelKeys, labelPointers} = this.printKeysAndPointers();
		writer.writeln(labelKeys + "}|{" + labelPointers +"}}\"];");

		var childNum = -1;
		if( this.children != null){
			this.children.forEach(function(child) {
				childNum++;
				var childnodeid = child.walk(counter, writer);
				writer.writeln("\"" + nodeid + "\":g" + String(childNum) + ":s -> \"" + childnodeid + "\":n");
			});
		}
		return nodeid;
	};
	getMimElement(){
		if(this.children!=null)
		return this.children[0].getMimElement();
	}
};
//******************************** LeafNode ********************************

class LeafNode extends PNode  {
	constructor(keys, next, prev, M) {
		super(keys, M, NODE_LEAF);
		this.next = next;
		this.prev = prev;
	}
	/**
	 ** INSERT **
	**/
	insert(father, n, newKey) {
		this.___insert(newKey);
		//THE LEAF IS OVER MAXIMUN CAPACITY => SPLIT NODE
		if(this.isOverMaximumCapacity()){
			this.spliceLeaf();
			//CREATE NEW ROOT
			if(father == null){
				let newRoot= new Node([], [], this.DEGREE); 
				newRoot.children[0] = this;
				newRoot.children[1] = this.next;
				newRoot.keys.push(this.next.keys[0])
				return newRoot;
			}else{ //PUSH KEY TO FATHER					
				father.keys = insertSlice(father.keys, this.next.keys[0], n);
				father.children = insertSlice(father.children, this.next, n+1);
			}
		}
	};
	spliceLeaf(){
		//DIVIDE
		var partSize1 = this.numberKeys()/2;
		var part1 = this.keys.slice(0,partSize1);
		var part2 = this.keys.slice(partSize1, this.numberKeys());
		this.keys = part1;
		//CREATE NEW NODE
		let newNode = new LeafNode(part2, this.next, this, this.DEGREE);
		//UPDATE REFERENCES
		if(this.next != null && this.next.prev != null){
			this.next.prev = newNode;
		}
		this.next = newNode;
	}
	/**
	 ** DELETE **
	**/
	remove(father,index, K){
		//Buscar donde esta la clave
		for (var i=0; i<this.numberKeys(); i++) {
			if (this.keys[i] == K) { //FOUND
				this.keys = deleteSlice(this.keys, i);
				//NODE IS UNDER MINIMUM CAPACITY
				if( this.isUnderMinimumCapacity()){ 
					console.log("LEAF IS UNDER MINIMUM CAPACITY");
					//NEXT IS STABLE THEN ROTATE LEFT
					if(this.next!=null && this.next.isStableCapacity() && index != father.numberKeys()){
						this.rotateLeft();
						father.keys[index] = this.next.keys[0];
						return NO_NEED_TO_REORDER;
					//PREV IS STABLE THEN ROTATE RIGHT
					}else if(this.prev!=null && this.prev.isStableCapacity() && index != 0 ){
						this.rotateRight();
						father.keys[index-1] = father.children[index].keys[0];
						return NO_NEED_TO_REORDER;
					//NEXT IS NOT FULL THEN MERGE WITH NEXT
					}else if(this.next!=null && index != father.numberKeys() ){ 
						this.merge();
						father.keys[index] = this.keys[0];
						father.children[index+1] = this;
						return NEED_TO_REORDER;
					//PREV IS NOT FULL THEN MERGE WITH PREV
					}else if(this.prev!=null ){ 
						this.prev.merge();
						return NEED_TO_REORDER;
					}
				}
				//NODE IS STABLE
				return NO_NEED_TO_REORDER;
			}
		}
		return NO_NEED_TO_REORDER;
	};
	rotateLeft(){
		this.keys = this.keys.concat(this.next.keys[0]);
		this.next.keys.shift();
	};
	rotateRight(){
		this.keys = [].concat(this.prev.keys[this.prev.numberKeys()-1]).concat(this.keys);
		this.prev.keys.pop();
	};
	merge(){
		this.keys = this.keys.concat(this.next.keys);
		if(this.next.next != null){
			this.next.next.prev = this;
		}
		this.next = this.next.next;
		return true;
	};
	/**
	 ** SEARCH **
	 */
	_search(K) {
		for (var i=0; i<this.numberKeys(); i++) {
			if (this.keys[i] == K) {
				return true;
			}
		}
		return false;
	};
	/**
	 ** PRINT **
	**/
	_printLeaves(){
		let bufer = this.printKeys();
		if(this.next != null){
			bufer += " " + this.next._printLeaves();
		}
		return bufer;
	}
	_printDirectLeaves(){
		let bufer = this.printKeys();
		if(this.next != null){
			bufer += " - " +  this.next._printDirectLeaves();
		}
		if(this.next == null){
			bufer += "\n REVERSE : ";
			bufer += this._printReverseLeaves();
		}
		return bufer;
	}
	_printReverseLeaves(){
		let bufer = this.printReverseKeys();
		if(this.prev != null){
			bufer += this.prev._printReverseLeaves();
		}
		return bufer;
	}
	printLabelKeys(){
		let labelKeys = "";
		for (var i=0; i<this.numberKeys(); i++) {
			labelKeys += "<f" + String(i) + ">";
			labelKeys += String(this.keys[i]);
			labelKeys += "|";
		}
		labelKeys += "<fx>*";
		return labelKeys;
	}
	walk(counter, writer) {
		var count = counter.addLeaf();
		var nodeid = "nodeLeaf" + String(count);
		
		writer.write(nodeid + "[label = \"");
		let labelKeys = this.printLabelKeys();
		writer.writeln(labelKeys + "\"];");

		if (writer.prev > -1){
			var nodeidPrev = "nodeLeaf" + String(count-1) ; //borrar
			writer.writeRefLeaves("\"" + nodeidPrev + "\" -> \"" + nodeid + "\"");
			//writer.writeRefLeaves("\n" + "\"" + nodeid + "\" -> \"" + nodeidPrev + "\"");
		}
		writer.prev = count;
		writer.writeLeaves (nodeid + "; ");

		return nodeid;
	};
	getMimElement(){
		if(this.keys!=null)
		return this.keys[0];
	}
};
//******************************** Tree ********************************

class BPlusTree {
	constructor(degree) {
		this.DEGREE = degree > 2 ? degree : 3;
		this.leaves = new LeafNode(null, null, null, this.DEGREE);
		this.root = this.leaves;
	}
	/**
	 ** INSERT **
	**/
	insert(newKey) {
		console.log(" >> INSERT " + newKey);

		var newRoot = this.root.insert(null, null, newKey);
		if(newRoot!= null){
			this.root = newRoot;
		}
		//console.log(this);
	};
	/**
	 ** DELETE **
	**/	
	remove(K) {
		console.log(" >> DELETE " + K);
		//UPDATE ROOT IF ONE CHILDREN IS EMPTY
		if(this.root.remove(null, null, K) && this.root.children != null){
			this.root = (this.root.children[0].numberKeys()>0)? this.root.children[0] : this.root.children[1];
		} 
		//UPDATE ROOT IF EMPTY
		if(this.root.isEmpty() && !this.root.isLeaf()){
			this.root = this.root.children[0];
		}
		//UPDATE LEAF REFERENCES
		if(this.leaves.isEmpty() && this.leaves.next!=null){
			this.leaves = this.leaves.next;
		}
		//console.log(this)
	};	
	/**
	 ** SEARCH **
	**/
	search(K){
		console.log(" >> SEARCH " + K);
		if(this.root._search(K)){
			console.log(">> ENCONTRADO ! ");
		}else{
			console.log(">> NO ENCONTRADO ! ");
		}
	}
	/**
	 ** INTEGRITY **
	**/
	validateReferentialIntegrityLeaves() {
		let bufer = "";
		bufer += this.leaves._printDirectLeaves();
		console.log(">> VALIDATE INTEGRITY : " + bufer);
		return    true;
	};
	/**
	 ** PRINT **
	**/
	printLeaves() {
		let bufer = "";
		bufer += this.leaves._printLeaves();
		//console.log(">> LEAVES : " + bufer);
		return    true;
	};
	drawTree() {
		var writer = new Writer();
		this.root.walk(new Counter(), writer);
		//this.leaves.walk(new Counter(), writer);
		let color = "style=filled, fillcolor=2, color=9 colorscheme=blues9";
		return    "digraph g {\n" +
			//"labelloc=\"t\";" +
			//"edge [arrowhead=vee, arrowtail=dot, dir=both, style=dashed, fillcolor=9, color=9, colorscheme=blues9];\n" +
			"graph [label=\""+ this.getInformation() + "\", fontcolor = midnightblue, splines=line]\n" + 
			"edge [arrowhead=vee, style=dashed];\n" +
			"node [shape = record,height=.1 " + color + " ];\n" +
			writer.buf + "\n" +
			"{ rank=same; " + writer.levelLeaves + "}\n"+
			writer.referencesLeaves + "\n"+
			"}";
	};
	getInformation(){
		return "Degree : " + this.root.DEGREE 
		+ " * Maximum Degree : " + this.root.maxNumberKeys
		+ " * Minimum Degree : " + this.root.minNumberKeys;
	};
};

//********************************
class Writer{
	constructor(){
		this.buf = "";
		this.levelLeaves = "";
		this.referencesLeaves = "";
		this.prev = -1;
	}
	write(str) {
		this.buf += String(str);
	};
	writeln(str) {
		this.write(String(str) + "\n");
	};
	writeLeaves(str) {
		this.levelLeaves += String(str);
	};
	writeRefLeaves(str) {
		this.referencesLeaves += String(str)+ "\n";
	};
}

class Counter{
	constructor(){
		this.countNode = 0;
		this.countLeaf = 0;
	}
	addNode() {
		return this.countNode++;
	};
	addLeaf() {
		return this.countLeaf++;
	};
}