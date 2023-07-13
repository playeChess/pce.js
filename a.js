class A {
	val = 0

	constructor(val) {
		this.val = val
	}

	getVal() { return val }
}

const a = { b: new A(12), c: new A(123)}
console.log(a)
const b = Object.entries(structuredClone(a)).reduce((acc, value) => {
	value[1].__proto__ = a[Object.keys(a)[0]].__proto__
	acc[value[0]] = value[1]
	return acc
}, {})

console.log(b)