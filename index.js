let ideas = {}

class Node {
    constructor(name, model = {}) {
	this.name = name
	Object.assign(this, model, {
	    flows: {} // default to empty flows
	});

	if (this.idea != void 0) {
	    let idea = ideas[this.idea] || (ideas[this.idea] = [])
	    idea.push(this)
	}
    }

    sitsOn(...items) {
	for (let item of items) {
	    this.addFlow("sitsOn", item)
	}
    }

    addFlow(name, item) {
	let flow = this.flows[name]

	if (flow == void 0) {
	    flow = this.flows[name] = []
	}
	
	flow.push(item)
    }
}

function addEasyFlow(name) {
    Node.prototype[name] = function (...items) {
	for (let item of items) {
	    this.addFlow(name, item);    
	}
    }
}

addEasyFlow("sitsOn")
addEasyFlow("connectsTo")
addEasyFlow("dependsOn")

class Service extends Node {
}
