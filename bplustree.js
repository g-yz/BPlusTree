//CONSTANTS
const NEED_TO_REORDER = true;
const NO_NEED_TO_REORDER = false;

//********************************
compare = function(a, b) { return a < b ? -1 : a == b ? 0 : 1; }
//******************************** BASE NODE ********************************
function insertSlice(origin, newElement, posicion){
	return origin.slice(0, posicion).concat(newElement).concat(origin.slice(posicion,origin.length));
	//this.keys = this.keys.slice(0, i).concat(K).concat(this.keys.slice(i,this.numberKeys()));
};
function deleteSlice(origin, posicion){
	console.log(" # eliminando " + posicion);
	return origin.slice(0, posicion).concat(origin.slice(posicion+1,origin.length));
	//this.keys = this.keys.slice(0, i).concat(K).concat(this.keys.slice(i,this.numberKeys()));
};
class PNode {
	constructor(keys, degree, type) {
		this.keys = keys !== null ? keys : []; 
		this.DEGREE = degree > 2 ? degree : 3;
		this.maxNumberKeys = this.DEGREE-1;
		this.minNumberKeys = Math.floor(this.DEGREE/2);
		this.type = type;
	}
	isLeaf = function() {
		return this.type;
	};
	numberKeys = function() {
		return this.keys.length;
	}; 
	isEmpty = function() {
		return this.numberKeys() == 0;
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
	findChildSlot_remove = function(K) {
		for (var i=0; i<this.numberKeys(); i++) {
			switch (compare(this.keys[i], K)) {
				case 0:  //Igual
					console.log(" ** DERECHA " + i+1);
					return i+1;
				case 1:
					console.log(" ** IZQUIERDA " + i);
					return i;
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
		console.log(" LA CAPACIDAD ES . " + this.numberKeys() > this.minNumberKeys + " "+ this.numberKeys() );
		return this.numberKeys() > this.minNumberKeys;
		//return this.numberKeys()+1 > this.minNumberKeys;
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
	constructor(keys, children, degree) {
		super(keys, degree, 0);
		//this.children = [];
		this.children = children !== null ? children : []; 
	}
	insert = function(K) {
		let i = this.findChildSlot(K);
		//console.log(" child slot "  + i);
		//this.keys = this.keys.slice(0, i).concat(K).concat(this.keys.slice(i,this.numberKeys()));
		this.keys = insertSlice(this.keys, K, i);
	};
	delete = function(K, poisition, father){
		if(father == null){
			if(this.numberKeys() == 1){
				return true;
			} else{
				return false;
			}
		}

		console.log(" - DELETE NODE * " + this.keys[0] );
		this.keys = deleteSlice(this.keys, poisition-1);
		this.children[poisition] = null;
		this.children = deleteSlice(this.children, poisition);

		

		//try{
			if(this.isUnderMinimumCapacity()){
				console.log(" - UNDER CAPACITY " + father.keys[0] + " " + father.numberKeys());
				if(father.children[poisition-2] != null && father.children[poisition-2].isStableCapacity()){
					//merge
					console.log(" - ROTATE LEFT " + father.keys[0] + " " + father.numberKeys());
					//father.children[poisition-2].merge(this);
				}else if(father.children[poisition-1].isStableCapacity()){
					//merge
					console.log(" - ROTATE RIGHT " + father.keys[0] + " " + father.numberKeys());
					//this.merge(father.children[poisition]);
				}else if(father.children[poisition-3] != null ){
					console.log(" - BALANCEAR IZQUIERDA" + father.children[poisition-2].keys[0] + " " + father.numberKeys())
					father.children[poisition-2].merge(this);
				}else if(father.children[poisition -1] != null ){
					console.log(" - BALANCEAR DERECHA" + this.keys[0] + " " + father.children[poisition-1].keys[0] + " " +  father.numberKeys());
					this.merge(father.children[poisition-1]);
					return true;
				}
				return false;
			}
			
		//}catch(war){
			//
		//}
		return false;
		
	}
	merge = function(nodeNext){
		this.keys = this.keys.concat(nodeNext.children[0].keys[0]).concat(nodeNext.keys);
		this.children = this.children.concat(nodeNext.children);
		//nodeNext = null;
		//this.next = this.next.next;
		return true;
	}
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
		this.newNode = new Node(this.part2, this.partChildren2, this.DEGREE);
		return {newNode: this.newNode, keyUp: keyUp};		
	}
	walk = function(counter, writer) {
		var nodeid = "node" + String(counter.add()) ;
		writer.write(nodeid + "[label = \"{{");
		for (var i=0; i<this.numberKeys(); i++) {
			writer.write("<f" + String(i) + ">");
			writer.write(String(this.keys[i]));
			writer.write("|");
		}
		writer.writeln("<f" + String(i) + ">}|{<g0>*|<g1>*|<g2>*|<g3>*}}\"];");

		var childNum = -1;
		//var outer = this;
		if( this.children != null){
			this.children.forEach(function(child) {
				childNum++;
				var childnodeid = child.walk(counter, writer);
				writer.writeln("\"" + nodeid + "\":g" + String(childNum) + " -> \"" + childnodeid + "\"");
			});
		}
		return nodeid;
	};
};
//******************************** LeafNode ********************************

class LeafNode extends PNode  {
	constructor(keys, next, prev, M) {
		super(keys, M, 1);
		//this.children = [];
		this.next = next;
		this.prev = prev;
	}
	insert = function(K) {
		let i = this.findChildSlot(K);
		//console.log(" child slot "  + i);
		//this.keys = this.keys.slice(0, i).concat(K).concat(this.keys.slice(i,this.numberKeys()));
		//this.keys = deleteSlice(this.keys, K, i);
		this.keys = insertSlice(this.keys, K, i);
	};
	delete22 = function(K, index, father) {
		console.log(" - DELETE LEAF?? " + this.numberKeys());
		//let i = this.findChildSlot(K);
		var i = index;

		//console.log("delete delete " + i);
		console.log(" - BUSCANDO DELETE ?? " + this.numberKeys());
		this.keys = deleteSlice(this.keys, i);
		//Erease node

		if( this.isUnderMinimumCapacity()){
			console.log(" - DELETE ?? " + this.numberKeys());
			//RIGHT
			if( index== 0 ){
				if(this.next!=null && this.next.validateFull(this.numberKeys())){
					this.rotateLeft();
					father.keys[0] = father.children[1].keys[0];
					console.log(" - DELETE ROTATE LEFT " + K);
					return NO_NEED_TO_REORDER;
				}
			//LEFT
			}else{
				/*if(this.prev!=null){
					if(this.prev.validateFull(this.numberKeys())){
						this.rotateRight();
						//father.keys[0] = father.children[1].keys[0];
						console.log(" - DELETE ROTATE RIGHT" + K);
						return NO_NEED_TO_REORDER;
					}else{
						this.prev.merge();
						console.log(" - DELETE MERGE LEFT" + K);
						return NEED_TO_REORDER;
					}
				}*/
				if(this.prev!=null){
					if(this.prev.validateFull(this.numberKeys())){
						this.rotateRight();
						//father.keys[0] = father.children[1].keys[0];
						console.log(" - DELETE ROTATE RIGHT" + K);
						return NO_NEED_TO_REORDER;
					}else{
						this.prev.merge();
						console.log(" - DELETE MERGE LEFT" + K);
						return NEED_TO_REORDER;
					}
				}
			}
		}
		//break;
		console.log(" - DELETE NO REORDER " + K);
		return NO_NEED_TO_REORDER;
	};
	delete = function(K, index, father) {
		console.log(" - DELETE LEAF?? " + this.numberKeys());
		//let i = this.findChildSlot(K);
		//var i = index;
		for (var i=0; i<this.numberKeys(); i++) {
			console.log(" - BUSCANDO DELETE ?? " + this.keys[i]);
			if (this.keys[i] == K) {
				//console.log("delete delete " + i);
				console.log(" - BUSCANDO DELETE ?? " + this.numberKeys());
				this.keys = deleteSlice(this.keys, i);
				//Erease node

				if( this.isUnderMinimumCapacity()){
					console.log(" - DELETE ?? " + this.numberKeys());
					/*
					if(this.prev.numberKeys() <= this.prev.minNumberKeys){
						//console.log(" Estamos intentando borrar ");
						this.prev.merge();
						console.log(" - DELETE REORDER LEFT" + K);
						return NEED_TO_REORDER;
					}else if(this.prev.validateNotFull(this.numberKeys())){
						this.prev.rotate();
						console.log(" - DELETE ROTATE LEFT " + K);
						return NO_NEED_TO_REORDER;
					}else if(this.next.numberKeys() <= this.next.minNumberKeys){
						this.prev.merge();
						console.log(" - DELETE REORDER RIGHT" + K);
						return NEED_TO_REORDER;
					}else if(this.next.validateNotFull(this.numberKeys())){
						this.next.rotate();
						console.log(" - DELETE ROTATE RIGHT" + K);
						return NO_NEED_TO_REORDER;
					}*/
					//RIGHT
					if( index== 0 ){
						if(this.next!=null && this.next.validateFull(this.numberKeys())){
							this.rotateLeft();
							father.keys[0] = father.children[1].keys[0];
							console.log(" - DELETE ROTATE LEFT " + K);
							return NO_NEED_TO_REORDER;
						}
					//LEFT
					}else{
						/*if(this.prev!=null){
							if(this.prev.validateFull(this.numberKeys())){
								this.rotateRight();
								//father.keys[0] = father.children[1].keys[0];
								console.log(" - DELETE ROTATE RIGHT" + K);
								return NO_NEED_TO_REORDER;
							}else{
								this.prev.merge();
								console.log(" - DELETE MERGE LEFT" + K);
								return NEED_TO_REORDER;
							}
						}*/
						if(this.prev!=null){
							if(this.prev.isStableCapacity()){
								this.rotateRight();
								//father.keys[0] = father.children[1].keys[0];
								console.log(" - DELETE ROTATE RIGHT STABLE " + K);
								return NO_NEED_TO_REORDER;
							}else if(this.next!=null && this.next.isStableCapacity()){
								this.rotateLeft();
								//father.keys[0] = father.children[1].keys[0];
								console.log(" - DELETE ROTATE LEFT STABLE " + K);
								return NO_NEED_TO_REORDER;
							}else if(this.prev.validateFull(this.numberKeys())){
								this.rotateRight();
								//father.keys[0] = father.children[1].keys[0];
								console.log(" - DELETE ROTATE RIGHT " + K);
								return NO_NEED_TO_REORDER;
							}else{
								console.log(" - DELETE MERGE LEFT " + K);
								this.prev.merge();
								return NEED_TO_REORDER;
							}
						}
					}
				}
				//break;
				console.log(" - DELETE NO REORDER " + K);
				return NO_NEED_TO_REORDER;
			}
		}
		/*
		if( this.numberKeys() < this.minNumberKeys){
			if(this.prev.numberKeys() <= this.prev.minNumberKeys){
				console.log(" Estamos intentando borrar ");
				this.prev.merge();
			}
		}*/
		console.log(" - DELETE NO REORDER " + K);
		//this.keys = deleteSlice(this.keys, K, i);
		return NO_NEED_TO_REORDER;
	};
	rotateLeft = function(){
		console.log(" >> ROTATE LEFT");
		this.keys = this.keys.concat(this.next.keys[0]);
		this.next.keys.shift();
	};
	rotateRight = function(){
		console.log(" >> ROTATE RIGHT");
		//this.keys = this.keys.concat(this.prev.keys[this.prev.numberKeys()-1]);
		//this.keys = this.keys.concat(this.prev.keys[this.prev.numberKeys()-1]);
		this.keys = [].concat(this.prev.keys[this.prev.numberKeys()-1]).concat(this.keys);
		this.prev.keys.pop();
	};
	merge = function(){
		console.log(" MERGE " + this.next.keys[0]);
		this.keys = this.keys.concat(this.next.keys);
		if(this.next.next != null){
			this.next.next.prev = this;
		}
		this.next = this.next.next;
		return true;
	};
	spliceLeaf = function(){
		console.log(" DIVIDIR NODO " + this.keys[0]);
		var partSize1 = this.numberKeys()/2;
		var part1 = this.keys.slice(0,partSize1);
		var part2 = this.keys.slice(partSize1, this.numberKeys());
		this.keys = part1;

		//Update references
		//this.next = new LeafNode(this.part2, null, this.LeafNode, this.M);
		this.newNode = new LeafNode(part2, this.next, this, this.DEGREE);
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
	_printDirectLeaves = function(){
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
	_printReverseLeaves = function(){
		let bufer = this.printReverseKeys();
		if(this.prev != null){
			bufer += this.prev._printReverseLeaves();
		}
		return bufer;
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
};
//******************************** Tree ********************************

class BPlusTree {
	constructor(degree) {
		this.DEGREE = degree > 2 ? degree : 3;
		this.leaves = new LeafNode(null, null, null, this.DEGREE);
		this.root = this.leaves;
	}
	insert = function(K) {
		console.log(" >> INSERT " + K);
		this._insert(this.root,null, null, K);
		console.log(this)
	};	
	remove = function(K) {
		console.log(" >> DELETE " + K);
		if(this._remove(this.root,null, null, K)){
			this.root = this.root.children[0];
		} 
		if(this.root.isEmpty() && !this.root.isLeaf()){
			this.root = this.root.children[0];
		}
		console.log(this)
	};	
	search = function(K){
		console.log(" >> SEARCH " + K);
		if(this._search(this.root, K)){
			console.log(">> ENCONTRADO ! ");
		}else{
			console.log(">> NO ENCONTRADO ! ");
		}
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
					this.new = new Node([], [], this.DEGREE); 
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
				this.new = new Node([], [], this.DEGREE); 
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
	_remove = function(node, father,n, K) {
		if ( node == null){
			return false;
		}
		
		if(node.isLeaf()){
			console.log(" - DELETE LEAF " + K);
			return node.delete(K, n, father);
		}else{
			console.log(" - DELETE NODE " + K);
			let i = node.findChildSlot_remove(K);
			console.log(" - DESCENDER POR EL NODO " + i);
			//this._remove(node.children[i],node,i,K);
			if(this._remove(node.children[i],node,i,K)){
				/*node.delete(K, i, father);
				if(node == this.root){
					this.root = node.children[0];
				}*/
				return node.delete(K, i, father);
			}
			//return false;
			//return this._remove(node.children[i],node,i,K);
		}
	};

	_search = function(node, K) {
		if(node == null){
			return 0;
		}
		//Leaf
		console.log(node.keys[0] + " leng " + node.keys.length);
		if (node.isLeaf()){
			console.log(" hojasss " + K+ " "+ node.keys[0]);
			for (var i=0; i<node.numberKeys(); i++) {
				if (node.keys[i] == K) {
					return true;
				}
			}
			return false;
		}
		for (var i=0; i<node.numberKeys()-1; i++) {
			if (compare(node.keys[i], K) !== -1) {
				break;
			}
		}

		console.log(" buscando " + i+ " "+ node.keys[i]);
		if(K < node.keys[i]){
			//console.log(" buscando izquierda" + i+ " "+ node.keys[i]);
			return this._search(node.children[i], K);
		}else {
			//console.log(" buscando derecha " + i+ " "+ node.keys[i+1]);
			return this._search(node.children[i+1], K);
		}
	};
	validateReferentialIntegrityLeaves = function() {
		let bufer = "";
		bufer += this.leaves._printDirectLeaves();
		console.log(">> VALIDATE INTEGRITY : " + bufer);
		return    true;
	};
	printLeaves = function() {
		let bufer = "";
		bufer += this.leaves._printLeaves();
		console.log(">> LEAVES : " + bufer);
		return    true;
	};
	drawTree = function() {
		var writer = new Writer();
		this.root.walk(new Counter(), writer);
		//this.leaves.walk(new Counter(), writer);
		return    "digraph g {\n" +
			"node [shape = record,height=.1];\n" +
			writer.buf + "\n" +
			" { rank=same; " + writer.walkLeaves + "}\n"+
			writer.leaves + "\n"+
			"}";
	};
};

//********************************
class Writer{
	constructor(){
		this.buf = "";
		this.walkLeaves = "";
		this.leaves = "";
		this.prev = -1;
	}
	write = function(str) {
		this.buf += String(str);
	};
	writeln = function(str) {
		this.write(String(str) + "\n");
	};
	wwalkLeaves = function(str) {
		this.walkLeaves += String(str);
	};
	wleaves = function(str) {
		this.leaves += String(str)+ "\n";
	};
}

class Counter{
	constructor(){
		this.count = 0;
		this.countLeaf = 0;
	}
	add = function() {
		return this.count++;
	};
	addLeaf = function() {
		return this.countLeaf++;
	};
}