# B+Tree

Demo:
https://gladyschy5.github.io/BPlusTree/

![Image](https://github.com/gladyschy5/BPlusTree/blob/main/im/ap.JPG)


# Complejidad algorítmica: Search

La complejidad de búsqueda en cada nodo, es lineal. Puesto que la búsqueda se sobre una lista ordenada. En el mejor de los casos la clave buscada estará al inicio, y en el peor de los casos estará al final. Entonces si el grado del árbol es B, la complejidad algorítmica será B-1, es decir O(B), solo en el nodo.

Ahora para calcular la complejidad de búsqueda global, en todo el árbol, el tamaño del problema se va reduciendo en proporciones logarítmicas dependiendo del tamaño de hijos que se pueda tener. Cabe denotar que solo se pasa por un solo nodo en cada nivel, y se descartan todos sus nodos hermanos. Por tanto la complejidad está dada por la altura del árbol. En cuanto la altura está dada por log B(n) y en cada nodo se tiene una complejidad lineal B.

![Image](https://github.com/gladyschy5/BPlusTree/blob/main/im/tree.jpg)

La complejidad es logB(n)*B, pero al ser B mucho menor que el tamaño total de registros n, B<n. La influencia de B sobre la complejidad es despreciable, por tanto, podemos asumir, que una búsqueda en un árbol B+, tiene una complejidad O(log(n)).


```js
class BPlusTree {
...
    search(K){
        console.log(" >> SEARCH " + K);
        if(this.root._search(K)){
            console.log(">> ENCONTRADO ! ");
        }else{
            console.log(">> NO ENCONTRADO ! ");
        }
    }
...
};
```

La complejidad de la función findChildSlot, depende del tamaño máximo de elementos que puede contener un nodo. Por lo que para un máximo de claves, K, la complejidad será O(k).
La complejidad de la recursividad depende del tamaño del árbol.

```js
class Node extends PNode {
...
    search(K) {
        let i = this.findChildSlot(K);
        return this.children[i].search(K);
    };
...
};
```

```js
class LeafNode extends PNode  {
...
    search(K) {
        for (let key of this.keys) {
            if (key == K)
                return true;
        }
        return false;
    };
...
};
```
```js
class PNode {
...
    findChildSlot(K) {
        for (var i=0; i<this.numberKeys(); i++) {
            if(this.keys[i] >= K){
                return (this.keys[i] == K)? i+1: i;
            }
        }
        return i;
    };
...
};
```

Por tanto, la **complejidad algorítmica de buscar un elemento es O(log n).**


# COMPLEJIDAD ALGORÍTMICA: INSERT

Para insertar un nuevo elemento, se envía el elemento a insertar a la raíz. A partir de este se determinará sobre que nodos se debe descender hasta llegar a la hoja, donde finalmente se insertará el elemento.

```js
class BPlusTree {
...
    insert(newKey) {
        var newRoot = this.root.insert(null, null, newKey);
        if(newRoot!= null){
            this.root = newRoot;
        }
    };
};
```

El costo de inserción solo en el nodo, es lineal. Puesto que se usa una función, que busca linealmente donde insertar el nuevo elemento, por tanto, la complejidad algorítmica solo en el nodo es: O(B).

```js
class PNode {
...
    ___insert(newkey) {
        let index = this.findChildSlot(newkey);			//O(B)
        this.keys = insertSlice(this.keys, newkey, index);	//O(M)
    };
...
};
```

El costo de la inserción en el nodo hoja, es dependiente del tamaño de las claves que puede albergar este, las operaciones más costosas de inserción clave, de costo O(B), dividir el nodo, costo O(B) y empujar la clave del nuevo nodo al padre, costo O(M). Consideremos que en el peor de los casos M tendrá el tamaño del arreglo. Por tanto O(M) ~ O(B). Por tanto O(B) + O(B) + O(M), tendrá un costo resumido de O(B).


```js
class LeafNode extends PNode  {
...
    insert(father, n, newKey) {
        this.___insert(newKey);				//O(B)
        //THE LEAF IS OVER MAXIMUN CAPACITY => SPLIT NODE
        if(this.isOverMaximumCapacity()){
            this.spliceLeaf();				//O(B)
            //CREATE NEW ROOT
            if(father == null){				//O(1)
                let newRoot= new Node([], [], this.DEGREE); 
                newRoot.children[0] = this;
                newRoot.children[1] = this.next;
                newRoot.keys.push(this.next.keys[0])
                return newRoot;
            }else{ //PUSH KEY TO FATHER  			//O(M)               
                father.keys = insertSlice(father.keys, this.next.keys[0], n);
                father.children = insertSlice(father.children, this.next, n+1);
            }
        }
    };
    spliceLeaf(){//O(M)
        //DIVIDE
        var partSize1 = this.numberKeys()/2;		//O(1)
        var part1 = this.keys.slice(0,partSize1);		//O(M), M ~ B/2
        var part2 = this.keys.slice(partSize1, this.numberKeys());//O(M)
        this.keys = part1;
        //CREATE NEW NODE
        let newNode = new LeafNode(part2, this.next, this, this.DEGREE);
        //UPDATE REFERENCES
        if(this.next != null && this.next.prev != null){		//O(1)
            this.next.prev = newNode;
        }
        this.next = newNode;
    }
...
};
```


En el caso de los nodos internos, se procede a buscar sobre qué hijo descender, costo B. Luego se hace un llamado recursivo, sobre el nodo hijo seleccionado y así sucesivamente. Hasta llegar a la hoja, se realiza la inserción la hoja, y se devuelve la llamada al nodo padre. En el nodo padre se valida si el nodo está por encima de la capacidad máxima, si es así, se divide el nodo y se empuja una clave a su padre.

La función spliceNode, la operación más compleja es slice, con complejidad de O (M) donde M es el comienzo y final de la operación. Por tanto la complejidad de toda la función es O(M), puesto que las demás operaciones son de costo O(1)

```js
class Node extends PNode {
...
    insert(father, n, newKey) {
        let i = this.findChildSlot(newKey);				  //O(B)
        let newRoot = this.children[i].insert(this, i, newKey); //O(logBn)O(B)
        //THE ROOT IS OVER MAXIMUN CAPACITY => SPLIT NODE
        if(this.isOverMaximumCapacity() ){ 
            let {newNode, ascendingKey} = this.spliceNode();	//O(M)
            //CREATE NEW ROOT
            if(father == null){ 					//O(1)
                newRoot = new Node([], [], this.DEGREE); 
                newRoot.children[0] = this;
                newRoot.children[1] = newNode;
                newRoot.keys.push(ascendingKey);			//O(1)
            // PUSH KEY TO FATHER
            }else{ 							
                father.___insert(ascendingKey);			//O(B)
                father.children = insertSlice(father.children, newNode, n+1); 
			//O(M)
            }
        }
        return newRoot;
    };
    spliceNode(){//O(M)
        this.partSize1 = Math.floor(this.numberKeys()/2); 
        
        let ascendingKey = this.keys[this.partSize1];

        this.part1 = this.keys.slice(0,this.partSize1); //O(M), M ~ B/2
        this.part2 = this.keys.slice(this.partSize1+1, this.numberKeys()); 
        this.keys = this.part1;
        
        this.partChildren1 = this.children.slice(0,this.partSize1+1); //O(M)
        this.partChildren2 = this.children.slice(this.partSize1+1, this.children.length);
        this.children = this.partChildren1;
        
        this.newNode = new Node(this.part2, this.partChildren2, this.DEGREE);
        return {newNode: this.newNode, ascendingKey: ascendingKey};     
    }
...
};
```

La complejidad de los nodos internos, dependerá de la recursividad, del costo de inserción en la hoja y la posible división en los nodos. El número de recursiones, es el tamaño del árbol, costo O(logB(n)). El costo de inserción en la hoja, es O(B), y el reordenamiento por la división del nodo, en el peor de los casos O(B).
Lo cual nos lleva a O(B) + O(logBn)*( O(B) +  O(B) ). Considerando que B es mucho menor que N, por lo que se hace despreciable. Finalmente tenemos una complejidad de O(logN).

**Complejidad algorítmica de insertar un elemento es O(log n).**


# COMPLEJIDAD ALGORÍTMICA: ELIMINAR


La complejidad de eliminación en el nodo hoja, va a depender del número claves permitidas. Por tanto en el peor de los casos el nodo está lleno, y se tiene que recorrer todas las claves, o al eliminar el elemento, queda debajo del mínimo, y se tiene que producir una rotación o unión de nodos. Lo cual solo será ejecutado una sola vez. Entonces la complejidad algorítmica de remover un elemento en una hoja es O(B).

```js
class LeafNode extends PNode{
...
    remove(father,index, K){ //O(B)
        for (var i=0; i<this.numberKeys(); i++) {  //O(B)
            if (this.keys[i] == K) { //FOUND
                this.keys = deleteSlice(this.keys, i); //O(B)
                //NODE IS UNDER MINIMUM CAPACITY
                if( this.isUnderMinimumCapacity()){ //O(B)
                    //NEXT IS STABLE THEN ROTATE LEFT
                    if(this.next!=null && this.next.isStableCapacity() && index != father.numberKeys()){
                        this.rotateLeft(); //O(B)
                        father.keys[index] = this.next.keys[0];
                        return NO_NEED_TO_REORDER;
                    //PREV IS STABLE THEN ROTATE RIGHT
                    }else if(this.prev!=null && this.prev.isStableCapacity() && index!= 0){
                        this.rotateRight(); //O(B)
                        father.keys[index-1] = father.children[index].keys[0];
                        return NO_NEED_TO_REORDER;
                    //NEXT IS NOT FULL THEN MERGE WITH NEXT
                    }else if(this.next!=null && index != father.numberKeys() ){ 
                        this.merge();   //O(B)
                        father.keys[index] = this.keys[0];
                        father.children[index+1] = this;
                        return NEED_TO_REORDER;
                    //PREV IS NOT FULL THEN MERGE WITH PREV
                    }else if(this.prev!=null ){ 
                        this.prev.merge();  //O(B)
                        return NEED_TO_REORDER;
                    }
                }
                //NODE IS STABLE
                return NO_NEED_TO_REORDER;
            }
        }
        return NO_NEED_TO_REORDER;
    };
    rotateLeft(){//O(B)
        this.keys = this.keys.concat(this.next.keys[0]); //O(B)
        this.next.keys.shift(); //O(B)
    };
    rotateRight(){//O(B)
        this.keys = [].concat(this.prev.keys[this.prev.numberKeys()-1]).concat(this.keys); //O(B)
        this.prev.keys.pop();//O(1)
    };
    merge(){//O(B)
        this.keys = this.keys.concat(this.next.keys); //O(B)
        if(this.next.next != null){
            this.next.next.prev = this;
        }
        this.next = this.next.next;
        return true;
    };    
...
```

La inserción en los nodos internos, dependerá de la recursión y si se diera el caso de reordenar los nodos, por insuficiencia de claves. El costo de la recursión, depende de la altura del árbol, es decir O(logBn) por el costo de eliminar en cada nivel, O(b). Entonces O(logBn)*O(B), se puede simplificar, a O(logBn).

```js
class Node extends PNode {
...
    remove(father,position, K) {  //O(logBn)
        let index_child = this.findChildSlot(K);	//O(B)

        if(this.children[index_child].remove(this,index_child,K)){ //O(logBn)*O(B)
            //IS ROOT
            if(father == null && this.numberKeys() == 1){	//O(1)
                return NEED_TO_REORDER;
            }
            //REMOVE KEYS AND CHILDREN
            this.keys = index_child == 0?  deleteSlice(this.keys, index_child): 
                            deleteSlice(this.keys, index_child-1); //O(B)
            this.children = deleteSlice(this.children, index_child); //O(B)

            var next = position+1;
            var prev = position-1;

            if(this.isUnderMinimumCapacity()){  //O(logn)
                if(father!= null && father.children!= null){
                    //NEXT IS STABLE THEN ROTATE LEFT
                    if(father.children[next] != null 
                        && father.children[next].isStableCapacity()){    
                        this.rotateLeft(father.children[next]);	//O(logn)
                        father.keys[position] = father.children[next].getMimElement();//O(logn)
                        return NO_NEED_TO_REORDER;
                    //PREV IS STABLE THEN ROTATE RIGHT
                    }else if(father.children[prev] != null && father.children[prev].isStableCapacity()){
                        this.rotateRight(father.children[prev]); //O(logn)
                        father.keys[prev] = this.getMimElement();//O(logn)
                        return NO_NEED_TO_REORDER;
                    //PREV IS NOT FULL THEN MERGE WITH PREV
                    }else if(father.children[prev] != null){
                        father.children[prev].merge(this); //O(logn)
                        return NEED_TO_REORDER;
                    //NEXT IS NOT FULL THEN MERGE WITH NEXT
                    }else if(father.children[next] != null){
                        this.merge(father.children[next]);  //O(logn)
                        father.children[next] = father.children[position];
                        return NEED_TO_REORDER;
                    }
                }
                return NEED_TO_REORDER;
            }
            return NO_NEED_TO_REORDER;
        }
    };
    rotateLeft(next){		//O(logn)
        this.keys = this.keys.concat(next.getMimElement());  //O(logBn)*O(B) ~ O(logn)
        next.keys.shift();					  //O(B)
        this.children = this.children.concat(next.children[0]);  //O(B)
        next.children.shift();					  //O(B)
    };
    rotateRight(prev){	//O(logn)
        this.keys = [].concat(this.getMimElement()).concat(this.keys);         //O(logBn)*O(B) ~ O(logn)
        this.children = [].concat(prev.children[prev.numberKeys()]).concat(this.children);
	 //O(B)
        prev.keys.pop();	 //O(1)
        prev.children.pop();  //O(1)
    };
    merge(nodeNext){      //O(logn)
        this.keys = this.keys.concat(nodeNext.getMimElement()).concat(nodeNext.keys);      //O(logBn)*O(B) ~ O(logn)
        this.children = this.children.concat(nodeNext.children); //O(B)
        return true;
    }
...
};
```

La complejidad de remover, depende de las operaciones que se realizan en los nodos.

```js
class BPlusTree{
...
    remove(K) {
        //UPDATE ROOT IF ONE CHILDREN IS EMPTY
        if(this.root.remove(null, null, K) && this.root.children != null){
            this.root = (this.root.children[0].numberKeys()>0)? this.root.children[0] : 
                         this.root.children[1];
        } 
        //UPDATE ROOT IF EMPTY
        if(this.root.isEmpty() && !this.root.isLeaf()){  //O(1)
            this.root = this.root.children[0];
        }
        //UPDATE LEAF REFERENCES
        if(this.leaves.isEmpty() && this.leaves.next!=null){  //O(1)
            this.leaves = this.leaves.next;
        }
    };      
...
};
```
Por tanto, la complejidad algorítmica es dada como O(logn).


**Complejidad algorítmica de remover un elemento es O(log n)**


# Complejidad de espacio:

Al realizar la búsqueda, se trabajara recursivamente. Por lo que en cada nivel se ocupara todo nodo, hasta llegar a las hojas, al retornar, se liberará todos los nodos en sucesión.
La complejidad de espacio en cada nodo, está dado por O(B*L)

El espacio ocupado por el un PNode es un arreglo de claves y cuatro propiedades, entonces, el espacio ocupado es (B-1)*L + 4*L, es decir O(B*L)

```js
class PNode {
    constructor(keys, degree, type) {
        this.keys = keys !== null ? keys : []; //(B-1)*L
        this.DEGREE = degree > 2 ? degree : 3; //L
        this.maxNumberKeys = this.DEGREE-1;    //L
        this.minNumberKeys = Math.floor(this.maxNumberKeys/2);  //L
        this.type = type;   //L
};
};
```

En cuanto a la clase Node, el espacio ocupado es lo mismo que PNode, más un arreglo de referencias a otros nodos. Por lo que el espacio ocupado seria, O(B*L) + B*L = 2B*L, la constante es despreciable, por tanto la complejidad de espacio es O(B*L).

```js
class Node extends PNode {
    constructor(keys, children, degree) {
        super(keys, degree, NODE_INTERNAL);
        this.children = children !== null ? children : []; 
    }
```

Siguiendo la misma lógica con la clase LeafNode, se agregarían dos propiedades 2*L. Por tanto O(B*L) + 2*L, entonces, la complejidad es O(B*L)

```js
class LeafNode extends PNode  {
    constructor(keys, next, prev, M) {
        super(keys, M, NODE_LEAF);
        this.next = next;
        this.prev = prev;
    }
};
```

Como mínimo cada nodo, debe tener ocupado al menos la mitad de su capacidad, por tanto (B*L/2)*(número de nodos), donde el número de nodos esta dado, por:


![Image](https://github.com/gladyschy5/BPlusTree/blob/main/im/ecu.JPG)

Si, B es menor que n, se hace despreciable. Por tanto el número de nodos internos será ~n. Es decir el espacio ocupado por todo el árbol será, (B*L/2)*n, donde asumiendo que n, será tan grande que las constantes no son relevantes. La complejidad de espacio del árbol será O(n).

**Complejidad de espacio es O(n)**






