/* eslint-disable max-len */

const { resolve } = require('path'),
    postcss = require('postcss');

const plugin = require('./');

function run(input, output, opts) {
    return postcss([ plugin(opts) ]).process(input, {
        from : resolve('./index.js')
    })
        .then(result => {
            expect(result.css).toEqual(output);
            expect(result.warnings().length).toBe(0);
        });
}

const buildParams = (symbol, type = "-image") => ({
    test: `a{background${type}:url(${symbol}./test/cc9966.png${symbol})}`,
    success: `a{background${type}:url(${symbol}data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwAQMAAABtzGvEAAAABGdBTUEAAPQkx/agJQAAAANQTFRFvH5IooWndAAAAA1JREFUGNNjYBgF1AQAAVAAAafi2hYAAAAASUVORK5CYII=${symbol})}`
});


describe('test regexp', () => {
    it('background-color', () => {
        const test = 'a{background-color:red }';
        return run(test, test, { });
    });

    it('background-image', () => {
        const { test, success } = buildParams('');

        return run(test, success, {});
    });

    it('background', () => {
        const { test, success } = buildParams('', '');

        return run(test, success, {});
    });
});

describe('test to base64', () => {
    it('base64', () => {
        const { test, success } = buildParams('');

        return run(test, success, {});
    });

    it("base64 '", () => {
        const { test, success } = buildParams("'");

        return run(test, success, {});
    });

    it('base64 "', () => {
        const { test, success } = buildParams('"');

        return run(test, success, {});
    });
});

describe('test add webp', () => {
    it('base64', () => {
        const { test, success } = {
            test: `a{background-image:url(./test/postcss.jpeg)}`,
            success: `a{background-image:url(./test/postcss.jpeg)}.webp a{background-image:url(./test/postcss.jpeg.webp)}`
        };

        return run(test, success, {});
    });

    it('base64 multi node', () => {
        const { test, success } = {
            test: `a{background-image:url(./test/postcss.jpeg); color:red}`,
            success: `a{background-image:url(./test/postcss.jpeg); color:red}.webp a{background-image:url(./test/postcss.jpeg.webp)}`
        };

        return run(test, success, {});
    });
});
