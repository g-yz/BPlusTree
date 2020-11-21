const NEED_TO_REORDER = true;
const NO_NEED_TO_REORDER = false;
//********************************
//********************************
compare = function(a, b) { return a < b ? -1 : a === b ? 0 : 1; }
//******************************** Node ********************************
function insertSlice(origin, newElement, posicion){
	return origin.slice(0, posicion).concat(newElement).concat(origin.slice(posicion,origin.length));
	//this.keys = this.keys.slice(0, i).concat(K).concat(this.keys.slice(i,this.numberKeys()));
};

class PNode {
	constructor(keys, M, T) {
		this.keys = keys !== null ? keys : []; 
		this.M = M;
		this.maxNumberKeys = M-1;//2*M-1;
		this.minNumberKeys = Math.floor(M/2);//M-1;
		this.T = T;
	}
	isLeaf = function() {
		return this.T
	};
	numberKeys = function() {
		return this.keys.length;
	}; 
	isEmpty = function() {
		return this.numberKeys() === this.minNumberKeys;
	};
	isFull = function() {
		return this.numberKeys() >= this.maxNumberKeys;
	};
	validateNotFull = function(newKeys) {
		return this.numberKeys() + newKeys <= this.maxNumberKeys;
	};
	validateFull = function(newKeys) {
		return this.numberKeys() + newKeys > this.maxNumberKeys;
	};
	findChildSlot = function(K) {
		for (var i=0; i<this.numberKeys(); i++) {
			if (compare(this.keys[i], K) !== -1) {
				break;
			}
		}
		return i;
	};
	isUnderMinimumCapacity = function() {
		return this.numberKeys() < this.minNumberKeys;
	};
	isOverMaximumCapacity = function() {
		return this.numberKeys() > this.maxNumberKeys;
	};
	isStableCapacity = function() {
		return this.numberKeys()+1 > this.minNumberKeys;
	};
	printKeys = function(){
		let bufer = "";
		for (let i=0; i<this.numberKeys(); i++) {
			bufer += " " + this.keys[i];
		}
		return bufer;
	} 
	printReverseKeys = function(){
		let bufer = "";
		for (let i=this.numberKeys()-1; i>=0; i--) {
			bufer += " " + this.keys[i];
		} 
		return bufer;
	}
};

class Node extends PNode {
	constructor(keys, children, M) {
		super(keys, M, 0);
		//this.children = [];
		this.children = children !== null ? children : []; 
	}
	insert = function(K) {
		let i = this.findChildSlot(K);
		//console.log(" child slot "  + i);
		//this.keys = this.keys.slice(0, i).concat(K).concat(this.keys.slice(i,this.numberKeys()));
		this.keys = insertSlice(this.keys, K, i);
	};

	spliceNode(){
		this.partSize1 = Math.floor(this.numberKeys()/2);
		//console.log(" parte " + this.partSize1 + " " + this.numberKeys());
		let keyUp = this.keys[this.partSize1];

		this.part1 = this.keys.slice(0,this.partSize1);
		this.part2 = this.keys.slice(this.partSize1+1, this.numberKeys());
		this.keys = this.part1;
		
		this.partChildren1 = this.children.slice(0,this.partSize1+1);
		this.partChildren2 = this.children.slice(this.partSize1+1, this.children.length);
		this.children = this.partChildren1;
		//this.newNode.children = this.partChildren2;
		this.newNode = new Node(this.part2, this.partChildren2, this.M);
		return {newNode: this.newNode, keyUp: keyUp};		
	}
};
//******************************** LeafNode ********************************

class LeafNode extends PNode  {
	constructor(keys, next, prev, M) {
		super(keys, M, 1);
		//this.children = [];
		this.next = next;
		this.prev = prev;
	}
  	walk = function(counter, writer) {
		var count = counter.addLeaf();
		var nodeid = "nodeLeaf" + String(count);
		
		writer.write(nodeid + "[label = \"");
		for (var i=0; i<this.numberKeys(); i++) {
			writer.write("<f" + String(i) + ">");
			writer.write(String(this.keys[i]));
			writer.write("|");
		}
		writer.writeln("<f" + String(i) + ">|<fx>*\"];");
		//fecha horizontal
		
		//writer.writeln("\"" + nodeid + "\" -> \"" + nodeidNext + "\"");
		if (writer.prev > -1){
			var nodeidPrev = "nodeLeaf" + String(count-1) ; //borrar
			writer.wleaves("\n" + "\"" + nodeidPrev + "\" -> \"" + nodeid + "\"");
			//writer.wleaves("\n" + "\"" + nodeid + "\" -> \"" + nodeidPrev + "\"");
		}
		writer.prev = count;
		writer.wwalkLeaves (nodeid + "; ");

		return nodeid;
	};

	insert = function(K) {
		let i = this.findChildSlot(K);
		//console.log(" child slot "  + i);
		//this.keys = this.keys.slice(0, i).concat(K).concat(this.keys.slice(i,this.numberKeys()));
		//this.keys = deleteSlice(this.keys, K, i);
		this.keys = insertSlice(this.keys, K, i);
	};

	spliceLeaf = function(){
		console.log(" DIVIDIR NODO " + this.keys[0]);
		var partSize1 = this.numberKeys()/2;
		var part1 = this.keys.slice(0,partSize1);
		var part2 = this.keys.slice(partSize1, this.numberKeys());
		this.keys = part1;

		//Update references
		//this.next = new LeafNode(this.part2, null, this.LeafNode, this.M);
		this.newNode = new LeafNode(part2, this.next, this, this.M);
		console.log(" DIVIDIR NODO " + this.newNode.keys[0]);
		//if(this.next != null && this.next.next != null){
		//	this.next.next = this.newNode;
		//}	
		if(this.next != null && this.next.prev != null){
			this.next.prev = this.newNode;
		}
		this.next = this.newNode;
		
		//this.next = this.nextp;
		
	}
	_printLeaves = function(){
		let bufer = this.printKeys();
		if(this.next != null){
			bufer += " " + this.next._printLeaves();
		}
		return bufer;
	}
};
//******************************** Tree ********************************

class BPlusTree {
	constructor(M) {
		this.M = M;
		this.leaves = new LeafNode(null, null, null, M);
		this.root = this.leaves;
	}

	_insert = function(node, father,n, K) {
		if ( node == null){
			return;
		}
		if(node.isLeaf()){
			if(node.isFull()){
				// Es hoja y raiz a la vez
				if(father == null){
					//this.root.insert(K);
					node.insert(K);
					node.spliceLeaf();
					this.new = new Node([], [], this.M); 
					this.new.children[0] = node;
					this.new.children[1] = node.next;
					this.new.keys.push(node.next.keys[0])
					this.root = this.new
				}else{
					node.insert(K);					
					node.spliceLeaf();
					
					//father.keys = father.keys.slice(0, n).concat(node.next.keys[0]).concat(father.keys.slice(n,father.numberKeys()));
					father.keys = insertSlice(father.keys, node.next.keys[0], n);
					console.log(n + " ***" + father.numberKeys());
					//father.children = father.children.slice(0, n+1).concat(node.next).concat(father.children.slice(n+1,father.numberKeys()));
					father.children = insertSlice(father.children, node.next, n+1);
				}
			}else{
				node.insert(K);
			}
		}else{
			let i = node.findChildSlot(K);
			//console.log(i)
			this._insert(node.children[i],node,i,K);

			if(this.root.maxNumberKeys +1 <= this.root.keys.length ){
				//console.log(node.numberKeys() + "%%%")
				let {newNode, keyUp} = node.spliceNode();
				this.new = new Node([], [], this.M); 
				this.new.children[0] = node;
				this.new.children[1] = newNode;
				this.new.keys.push(keyUp);
				this.root = this.new;
			}else{
				if(node.maxNumberKeys +1 <= node.keys.length ){
					let {newNode, keyUp} = node.spliceNode();
					father.insert(keyUp);
					//father.children = father.children.slice(0, n+1).concat(newNode).concat(father.children.slice(n+1,father.numberKeys()));
					father.children = insertSlice(father.children, newNode, n+1);
				}
			}
		}
	};
	drawTree = function() {
		return    "To do";
	};
	insert = function(K) {
		this._insert(this.root,null, null, K);
		console.log(this)
	};	
	printLeaves = function() {
		let bufer = "";
		bufer += this.leaves._printLeaves();
		console.log(">> LEAVES : " + bufer);
		return    true;
	};
};