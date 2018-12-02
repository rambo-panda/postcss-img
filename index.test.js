var postcss = require('postcss');

var plugin = require('./');

function run(input, output, opts) {
	return postcss([ plugin(opts) ]).process(input)
	.then(result => {
		expect(result.css).toEqual(output);
		expect(result.warnings().length).toBe(0);
	});
}

describe('test regexp', () => {
	it('background-color', () => {
		const test = 'a{background-color:red }';
		return run(test, test, { });
	});
});

describe('test to base64', () => {
	const build_param = (symbol) => ({
		test: `a{background-image:url(${symbol}./test/cc9966.png${symbol})}`,
		success: `a{background-image:url(${symbol}data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwAQMAAABtzGvEAAAABGdBTUEAAPQkx/agJQAAAANQTFRFvH5IooWndAAAAA1JREFUGNNjYBgF1AQAAVAAAafi2hYAAAAASUVORK5CYII=${symbol})}`,
	});

	it('base64', () => {
		const {test, success} = build_param('');

		return run(test, success, {});
	});

	it("base64 '", () => {
		const {test, success} = build_param("'");

		return run(test, success, {});
	});

	it('base64 "', () => {
		const {test, success} = build_param('"');

		return run(test, success, {});
	});
});

describe('test add webp', () => {
	it('base64', () => {
		const {test, success} = {
			test: `a{background-image:url(./test/postcss.jpeg)}`,
			success: `a{background-image:url(./test/postcss.jpeg)}.webp a{background-image:url(./test/postcss.jpeg.webp)}`,
		};

		return run(test, success, {});
	});

	it('base64 multi node', () => {
		const {test, success} = {
			test: `a{background-image:url(./test/postcss.jpeg); color:red}`,
			success: `a{background-image:url(./test/postcss.jpeg); color:red}.webp a{background-image:url(./test/postcss.jpeg.webp)}`,
		};

		return run(test, success, {});
	});
});
