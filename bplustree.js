//CONSTANTS
const NEED_TO_REORDER = true;
const NO_NEED_TO_REORDER = false;
const NODE_INTERNAL = 0;
const NODE_LEAF = 1;
//********************************
function compare(a, b) { return a < b ? -1 : a == b ? 0 : 1; }
//******************************** BASE NODE ********************************
function insertSlice(origin, newElement, posicion){
	return origin.slice(0, posicion).concat(newElement).concat(origin.slice(posicion,origin.length));
};
function deleteSlice(origin, posicion){
	console.log(" # eliminando " + posicion);
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
	isFull() {
		return this.numberKeys() >= this.maxNumberKeys;
	};
	validateNotFull(newKeys) {
		return this.numberKeys() + newKeys <= this.maxNumberKeys;
	};
	validateFull(newKeys) {
		return this.numberKeys() + newKeys > this.maxNumberKeys;
	};
	findChildSlot(K) {
		for (var i=0; i<this.numberKeys(); i++) {
			if (compare(this.keys[i], K) !== -1) {
				break;
			}
		}
		return i;
	};
	findChildSlot_remove(K) {
		for (var i=0; i<this.numberKeys(); i++) {
			switch (compare(this.keys[i], K)) {
				case 0:  //Igual
					//console.log(" ** DERECHA " + i+1);
					return i+1;
				case 1:
					//console.log(" ** IZQUIERDA " + i);
					return i;
			}
		}
		return i;
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
	___insert(newkey) {
		console.log(" insertando " + newkey);
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
	insert(root, father, n, newKey) {
		let i = this.findChildSlot_remove(newKey);
		let newRoot = this.children[i].insert(root, this, i, newKey);
		//THE ROOT IS OVER MAXIMUN CAPACITY => SPLIT NODE
		if(this.isOverMaximumCapacity() ){ 
			let {newNode, keyUp} = this.spliceNode();
			if(this == root){ //CREATE NEW ROOT
				newRoot = new Node([], [], this.DEGREE); 
				newRoot.children[0] = this;
				newRoot.children[1] = newNode;
				newRoot.keys.push(keyUp);
			}else{ // PUSH KEY TO FATHER
				father.___insert(keyUp);
				father.children = insertSlice(father.children, newNode, n+1);
			}
		}
		return newRoot;
	};
	/**
	 ** DELETE **
	**/
	delete(K, index_child, poisition, father){
		console.log(" >> DELETE NODE * " + this.keys[0] + " POSICION FATHER : " + poisition + " POSITION CHILDREN " + index_child);
		if(father == null){
			if(this.numberKeys() == 1){
				console.log(" SOLO HAY UNO EN EL ROOT");
				/*if(this.children.length > 1){
					return false;
				}else{
					return true;
				}*/
				return true;
			} else{
				console.log(" TERMINAR DELTE CON EL BORRADO EN EL ROOT " + index_child + " " +this.keys[0]);
				
				//this.children[index_child] = null;
				if(this.keys[index_child-1] <= K){  // DERECHA
					this.keys = deleteSlice(this.keys, index_child-1);
					console.log(" ES IGUAL ");
					this.children = deleteSlice(this.children, index_child);
				}else{ //IZQUIERDA
					this.keys = deleteSlice(this.keys, index_child);
					console.log(" NO ES IGUAL ");
					this.children = deleteSlice(this.children, index_child);
				}

				//this.keys = deleteSlice(this.keys, index_child -1);
				//this.children = deleteSlice(this.children, index_child );
				return false;
			}
		}
		//console.log(" DELETE NODE");
		if(index_child == 0){
			this.keys = deleteSlice(this.keys, index_child);
		}else{
			this.keys = deleteSlice(this.keys, index_child-1);
		}
		
		//this.children[index_child] = null;
		this.children = deleteSlice(this.children, index_child);

		//try{
		var next = poisition+1;
		var prev = poisition-1;
		//console.log(" __ MERGE EMPTY ?? " + this.keys[0]);
		if(this.isEmpty()){
			//this.prev.next = this.next;
			//this.next.prev = this.prev;

			console.log(" NODE IS EMPTY NEED TO REORDER");
			if(father!= null && father.children!= null){
				console.log(" __ MERGE EMPTY ");
				//this.father.children[prev] = this.children.concat(nodeNext.children);
				if(father.children[next] != null && father.children[next].isStableCapacity()){
					console.log(" __ ROTATE EMPTY LEFT " + next);
					this.rotateLeft(father.children[next]);
					//Actualizar clave del padre, para mantener consistencia de propiedades
					father.keys[poisition] = father.children[next].children[0].keys[0];
					return NO_NEED_TO_REORDER;
				}else if(father.children[prev] != null && father.children[prev].isStableCapacity()){
					console.log(" __ ROTATE EMPTY RIGHT " + next);
					this.rotateRight(father.children[prev]);
					father.keys[prev] = this.children[0].keys[0];
					return NO_NEED_TO_REORDER;
				}else if(father.children[prev] != null){
					console.log(" __ MERGE EMPTY PREV ");
					father.children[prev].merge(this);
					//father.children[prev] = father.children[poisition]; //duda actualizat
				}else if(father.children[next] != null){
					console.log(" __ MERGE EMPTY NEXT " + next);
					this.merge(father.children[next]);
					father.children[next] = father.children[poisition];
				}
			}
			return NEED_TO_REORDER;
		}

		if(this.isUnderMinimumCapacity()){
			console.log(" NODE IS UNDER MINUM ");
			//console.log(" - UNDER CAPACITY " + father.keys[0] + " " + father.numberKeys());
			if(father.children[poisition-2] != null && father.children[poisition-2].isStableCapacity()){
				//merge
				//console.log(" - ROTATE LEFT " + father.keys[0] + " " + father.numberKeys());
				//father.children[poisition-2].merge(this);
			}else if(father.children[prev] != null && father.children[prev].isStableCapacity()){
				//merge
				//console.log(" - ROTATE RIGHT " + father.keys[0] + " " + father.numberKeys());
				//this.merge(father.children[poisition]);
			}else if(father.children[poisition-3] != null ){
				//console.log(" - BALANCEAR IZQUIERDA" + father.children[poisition-2].keys[0] + " " + father.numberKeys())
				father.children[poisition-2].merge(this);
			}else if(this.isEmpty() && father.children[prev] != null ){ //poisition -1
				//console.log(" - BALANCEAR IZQUIERDAAA?? " + this.keys[0] + " " + father.children[prev].keys[0] + " " +  father.numberKeys());
				//this.merge(father.children[poisition-1]);
				father.children[prev].merge(this);
				return NEED_TO_REORDER;
			}else if(father.children[poisition -1] != null ){ //poisition -1
				//console.log(" - BALANCEAR DERECHA " + this.keys[0] + " " + father.children[poisition-1].keys[0] + " " +  father.numberKeys());
				this.merge(father.children[poisition-1]);
				return NEED_TO_REORDER;
			}else if(father.children[next] != null ){ //poisition -1
				//console.log(" - merge a la DERECHA " + this.keys[0] + " " + father.children[next].keys[0] + " " +  father.numberKeys());
				this.merge(father.children[next]);
				return NEED_TO_REORDER;
			}
			return false;
		}

		return false;	
	}
	rotateLeft(next){
		//console.log(" >> ROTATE LEFT");
		//this.keys = this.keys.concat(next.keys[0]);
		this.keys = this.keys.concat(next.children[0].keys[0]);
		next.keys.shift();
		this.children = this.children.concat(next.children[0]);
		next.children.shift();
	};
	rotateRight(prev){
		//console.log(" >> ROTATE LEFT");
		//this.keys = this.keys.concat(next.keys[0]);
		/*this.keys = this.keys.concat(next.children[0].keys[0]);
		next.keys.shift();
		this.children = this.children.concat(next.children[0]);
		next.children.shift();*/

		//
		this.keys = [].concat(this.children[0].keys[0]).concat(this.keys);
		this.children = [].concat(prev.children[prev.numberKeys()]).concat(this.children);
		prev.keys.pop();
		prev.children.pop();
	};
	merge(nodeNext){
		if(this.isEmpty()){
			console.log(" MERGE NODE EMPTY :0 " + this.numberKeys());
			this.keys = this.keys.concat(nodeNext.children[0].keys[0]).concat(nodeNext.keys);
			this.children = this.children.concat(nodeNext.children);

			console.log(this.keys);
			console.log(this.children);
		}else{
			console.log(" MERGE NODE NOT EMPTY :0" + this.numberKeys());
			this.keys = this.keys.concat(nodeNext.children[0].keys[0]).concat(nodeNext.keys);
			this.children = this.children.concat(nodeNext.children);
		}
		return true;
	}
	spliceNode(){
		this.partSize1 = Math.floor(this.numberKeys()/2);
		
		let keyUp = this.keys[this.partSize1];

		this.part1 = this.keys.slice(0,this.partSize1);
		this.part2 = this.keys.slice(this.partSize1+1, this.numberKeys());
		this.keys = this.part1;
		
		this.partChildren1 = this.children.slice(0,this.partSize1+1);
		this.partChildren2 = this.children.slice(this.partSize1+1, this.children.length);
		this.children = this.partChildren1;
		
		this.newNode = new Node(this.part2, this.partChildren2, this.DEGREE);
		return {newNode: this.newNode, keyUp: keyUp};		
	}
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
	insert(root, father, n, newKey) {
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
	delete(K, index, father) {
		console.log(" - DELETE hoja " );
		for (var i=0; i<this.numberKeys(); i++) {
			if (this.keys[i] == K) { //FOUND
				this.keys = deleteSlice(this.keys, i);
				
				if(this.isEmpty()){ //NODE IS EMPTY
					console.log(" -* DELETE NODE IS EMPTY LEAF " );
					if(index == 0){
						
						console.log(" ] 0 - DELETE NODE IS EMPTY LEAF " );
						if(this.next!=null && this.next.isStableCapacity()){ //this.next.isFull()){
							console.log(" - FIRST THEN ROTATE LEFT " + K);
							this.rotateLeft();
							father.keys[index] = this.next.keys[0];
							console.log(" INDEX " + index + " " + this.next.keys[0]);
							return NO_NEED_TO_REORDER;
						}else{
							//this.prev.next = this.next;
							this.next.prev = this.prev;
						}
					}else if(father!=null  && index == father.numberKeys()){
						console.log("AL PARECER ES EL ULTIMO" );
						if(this.prev!=null && this.prev.isStableCapacity()){
							console.log(" - LAST THEN ROTATE RIGHT " + K);
							this.rotateRight();
							father.keys[index-1] = father.children[index].keys[0];
							return NO_NEED_TO_REORDER;
						}else{
							this.prev.next = this.next;
							//this.next.prev = this.prev;
							return NEED_TO_REORDER;
						}
					}else{
						console.log(" ]]] DELETE NODE IS EMPTY LEAF " );
						if(this.next!=null && this.next.isStableCapacity()){ //this.next.isFull()){
							console.log(" - INTERMEDIATE NEXT THEN ROTATE LEFT " + K);
							this.rotateLeft();
							father.keys[index] = this.next.keys[0];
							console.log(" INDEX " + index + " " + this.next.keys[0]);
							return NO_NEED_TO_REORDER;
						}else if(this.prev!=null && this.prev.isStableCapacity()){
							console.log(" - INTRMEDIATE PREV THEN ROTATE RIGHT " + K);
							this.rotateRight();
							return NO_NEED_TO_REORDER;
						}else if(this.prev!=null && this.next!=null){
							this.prev.next = this.next;
							this.next.prev = this.prev;
							console.log(" BALANCEADO NO REORDENAr ");
						}
					}
					
					return NEED_TO_REORDER;
				}

				if( this.isUnderMinimumCapacity()){ //NODE IS UNDER MINIMUM CAPACITY
					//NEXT IS STABLE THEN ROTATE LEFT
					if(this.next!=null && this.next.isStableCapacity()){
						console.log(" - NEXT IS STABLE THEN ROTATE LEFT " + K);
						this.rotateLeft();
						return NO_NEED_TO_REORDER;
					//NEXT IS STABLE THEN ROTATE RIGHT
					}else if(this.prev!=null && this.prev.isStableCapacity()){
						this.rotateRight();
						//father.keys[0] = father.children[1].keys[0];
						console.log(" - NEXT IS STABLE THEN ROTATE RIGHT " + K);
						return NO_NEED_TO_REORDER;
					//NEXT IS NOT FULL THEN MERGE WITH NEXT
					}else if(this.next!=null && this.next.validateFull(this.numberKeys())){
						console.log(" - NEXT IS NOT FULL THEN MERGE WITH NEXT " + K);
						this.merge();
						//father.keys[0] = father.children[1].keys[0];
						return NO_NEED_TO_REORDER;
					//PREV IS NOT FULL THEN MERGE WITH PREV
					}else if(this.prev!=null && this.prev.validateFull(this.numberKeys())){
						this.prev.merge();
						//father.keys[0] = father.children[1].keys[0];
						console.log(" - PREV IS NOT FULL THEN MERGE WITH PREV " + K);
						return NO_NEED_TO_REORDER;
					}else{
						console.log(" - DELETE MERGE " + K);
						this.merge();
						return NEED_TO_REORDER;
					}
				}
				//break;
				console.log(" - DELETE NO REORDER " + this.isUnderMinimumCapacity() + " " + this.numberKeys() + " BORRAR " + K);
				console.log(this.keys);
				return NO_NEED_TO_REORDER;
			}
		}
		return NO_NEED_TO_REORDER;
	};
	rotateLeft(){
		//console.log(" >> ROTATE LEFT");
		this.keys = this.keys.concat(this.next.keys[0]);
		this.next.keys.shift();
	};
	rotateRight(){
		//console.log(" >> ROTATE RIGHT");
		//this.keys = this.keys.concat(this.prev.keys[this.prev.numberKeys()-1]);
		//this.keys = this.keys.concat(this.prev.keys[this.prev.numberKeys()-1]);
		this.keys = [].concat(this.prev.keys[this.prev.numberKeys()-1]).concat(this.keys);
		this.prev.keys.pop();
	};
	merge(){
		//console.log(" MERGE " + this.next.keys[0]);
		this.keys = this.keys.concat(this.next.keys);
		if(this.next.next != null){
			this.next.next.prev = this;
		}
		this.next = this.next.next;
		return true;
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

		var newRoot = this.root.insert(this.root,null, null, newKey);
		if(newRoot!= null){
			this.root = newRoot;
		}
		console.log(this);
	};
	/**
	 ** DELETE **
	**/	
	remove(K) {
		console.log(" >> DELETE " + K);
		if(this._remove(this.root,null, null, K) && this.root.children != null){
			//console.log(" {} DELETE " + K + " " + this.root.children[0].keys[0]);
			if(this.root.children[0].numberKeys()>0){
				this.root = this.root.children[0];
			}else{
				this.root = this.root.children[1];
			}
			//this.root = this.root.children[0];
		} 
		if(this.root.isEmpty() && !this.root.isLeaf()){
			this.root = this.root.children[0];
		}
		//ACTUALIZAR REFERENCIA DE LAS HOJAS
		if(this.leaves.isEmpty() && this.leaves.next!=null){
			this.leaves = this.leaves.next;
		}
		console.log(this)
	};	
	_remove(node, father,n, K) {
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
				return node.delete(K, i, n, father);
			}
			//return false;
			//return this._remove(node.children[i],node,i,K);
		}
	};
	/**
	 ** SEARCH **
	**/
	search(K){
		console.log(" >> SEARCH " + K);
		if(this._search(this.root, K)){
			//console.log(">> ENCONTRADO ! ");
		}else{
			//console.log(">> NO ENCONTRADO ! ");
		}
	}
	_search(node, K) {
		if(node == null){
			return 0;
		}
		//Leaf
		//console.log(node.keys[0] + " leng " + node.keys.length);
		if (node.isLeaf()){
			//console.log(" hojasss " + K+ " "+ node.keys[0]);
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

		//console.log(" buscando " + i+ " "+ node.keys[i]);
		if(K < node.keys[i]){
			////console.log(" buscando izquierda" + i+ " "+ node.keys[i]);
			return this._search(node.children[i], K);
		}else {
			////console.log(" buscando derecha " + i+ " "+ node.keys[i+1]);
			return this._search(node.children[i+1], K);
		}
	};
	/**
	 ** INTEGRITY **
	**/
	validateReferentialIntegrityLeaves() {
		let bufer = "";
		bufer += this.leaves._printDirectLeaves();
		//console.log(">> VALIDATE INTEGRITY : " + bufer);
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
		+ " Maximum Degree : " + this.root.maxNumberKeys
		+ " Minimum Degree : " + this.root.minNumberKeys;
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