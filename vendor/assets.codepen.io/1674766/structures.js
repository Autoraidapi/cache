(function (global, modules) {

    var splice = function (array, insert, at) {
        at = Math.min(Math.max(at, 0), array.length);
        var tail = Array(array.length - at);
        var length = insert.length;
        var i;
        for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
        for (i = 0; i < length; i++) array[i + at] = insert[i];
        for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
    };

    function PriorityNode(val, priority) {
        this.val = val;
        this.priority = priority;
    }

    function NextNode(val) {
        this.val = val;
        this.next = null;
    }

    function TwinNode(val) {
        this.val = val;
        this.next = null;
        this.prev = null;
    }

    function WeightedGraph() {
        this.adjacencyList = {};
    }

    WeightedGraph.prototype = {
        constructor: WeightedGraph,
        addVertex: function () {},
        addEdge: function () {},
        Djikstra: function () {},
        removeEdge: function () {},
        removeVertex: function () {}
    }

    function PriorityQueue() {
        this.values = [];
    }

    PriorityQueue.prototype = {
        constructor: PriorityQueue,
        enqueue: function (val, priority) {
            var newNode = new PriorityNode(val, priority);
        },
        bubbleUp: function () {},
        dequeue: function () {},
        sinkDown: function () {}
    }

    function BinarySearchTree() {

    }

    BinarySearchTree.prototype = {
        constructor: BinarySearchTree,
        insert: function (val) {
            var newNode = new TwinNode(val);
        },
        find: function () {}
    }

    function SinglyLinkedList() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    SinglyLinkedList.prototype = {
        constructor: SinglyLinkedList,
        push: function (val) {
            var newNode = new NextNode(val);
        },
        pop: function () {},
        shift: function () {},
        unshift: function (val) {
            var newNode = new NextNode(val);
        },
        get: function () {},
        set: function () {},
        insert: function () {
            if (index < 0 || index > this.length) return false;
            if (index === this.length) return !!this.push(val);
            if (index === 0) return !!this.unshift(val);
            var newNode = new Node(val);
        },
        remove: function () {},
        reverse: function () {},
        iterate: function () {}
    }

    function DoublyLinkedList() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    DoublyLinkedList.prototype = {
        constructor: DoublyLinkedList,
        push: function (val) {
            var newNode = new TwinNode(val);
        },
        pop: function () {},
        shift: function () {},
        unshift: function (val) {
            var newNode = new TwinNode(val);
        },
        get: function () {},
        set: function () {},
        insert: function () {
            if (index < 0 || index > this.length) return false;
            if (index === this.length) return !!this.push(val);
            if (index === 0) return !!this.unshift(val);
            var newNode = new TwinNode(val);
        },
        remove: function () {},
        reverse: function () {},
        iterate: function () {}
    }

    modules['exports'] = function () {
        return {
            WeightedGraph: WeightedGraph,
            SinglyLinkedList: SinglyLinkedList,
            BinarySearchTree: BinarySearchTree,
            PriorityQueue: PriorityQueue,
            DoublyLinkedList: DoublyLinkedList
        }
    }

    if (typeof global !== 'undefined') {
        global.modules = modules.exports();
    }

})(this, {});