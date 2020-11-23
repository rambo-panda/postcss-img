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

    it('background url is startsWith http', () => {
        const x = 'a{background:url("https://www.xxx.com/xxx/yyy.png")}';

        return run(x, x, {});
    });

    it('background url is startsWith svg', () => {
        const x = 'a{background:url("./a.svg")}';

        return run(x, x, {});
    });

    it('background url disable', () => {
        const x = 'a{background:url(./test/cc9966.png?no-postcss-img=0)}';

        return run(x, x, {});
    });

    it('background url is startsWith base64', () => {
        const { success } = buildParams('');

        return run(success, success, {});
    });

    it('background-image', () => {
        const { test, success } = buildParams('');

        return run(test, success, {});
    });

    it('background-image', () => {
        const { test, success } = buildParams('');

        return run(test, success, {});
    });

    it('background', () => {
        const { test, success } = buildParams('', '');

        return run(test, success, {});
    });

    it('background startsWith Number', () => {
        const { test, success } = buildParams('', '');

        return run(test.replace('cc9966.png', '1.png'), success, {});
    });

    it('background with _', () => {
        const { test, success } = buildParams('', '');

        return run(test.replace('cc9966.png', '_.png'), success, {});
    });
});

describe('test to base64', () => {
    it('base64', () => {
        const { test, success } = buildParams('');

        return run(test, success, {});
    });

    it("base64 add search url", () => {
        const { test, success } = buildParams("'");

        return run(test.replace('cc9966.png', 'cc9966.png?version=1'), success, {});
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
    it('multiple background-image url', () => {
        const { test, success } = {
            test: `a{background-image:url(./test/postcss.jpeg), url(./test/postcss2.jpeg)}`,
            success: `a{background-image:url(./test/postcss.jpeg), url(./test/postcss2.jpeg)}.webp a{background-image:url(./test/postcss.jpeg.webp),url(./test/postcss2.jpeg.webp)}`
        };

        return run(test, success, {});
    });

    it('normal url', () => {
        const { test, success } = {
            test: `a{background-image:url(./test/postcss.jpeg)}`,
            success: `a{background-image:url(./test/postcss.jpeg)}.webp a{background-image:url(./test/postcss.jpeg.webp)}`
        };

        return run(test, success, {});
    });

    it('search url', () => {
        const { test, success } = {
            test: `a{background-image:url(./test/postcss.jpeg?x=1)}`,
            success: `a{background-image:url(./test/postcss.jpeg?x=1)}.webp a{background-image:url(./test/postcss.jpeg.webp?x=1)}`
        };

        return run(test, success, {});
    });

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

    it('css linear', () => {
        const { test, success } = {
            test: `PNPI_a{background-image: url(./test/postcss.jpeg), url(./test/postcss.jpeg), linear-gradient(to right, rgba(30, 75, 115, 1), rgba(255, 255, 255, 0));}`,
            success: `PNPI_a{background-image: url(./test/postcss.jpeg), url(./test/postcss.jpeg), linear-gradient(to right, rgba(30, 75, 115, 1), rgba(255, 255, 255, 0));}`
        };

        return run(test, success, {});
    });

    it('css linear', () => {
        const { test, success } = {
            test: `a{background-image: url(./test/postcss.jpeg), url(./test/postcss.jpeg), linear-gradient(to right, rgba(30, 75, 115, 1), rgba(255, 255, 255, 0));}`,
            success: `a{background-image: url(./test/postcss.jpeg), url(./test/postcss.jpeg), linear-gradient(to right, rgba(30, 75, 115, 1), rgba(255, 255, 255, 0));}.webp a{background-image: url(./test/postcss.jpeg.webp),url(./test/postcss.jpeg.webp), linear-gradient(to right, rgba(30, 75, 115, 1), rgba(255, 255, 255, 0));}`
        };

        return run(test, success, {});
    });

    it('css linear before', () => {
        const { test, success } = {
            test: `a{background-image: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5)), url("./test/postcss.jpeg");}`,
            success: `a{background-image: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5)), url("./test/postcss.jpeg");}.webp a{background-image: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5)),url("./test/postcss.jpeg.webp");}`,
        };

        return run(test, success, {});
    });

    it('css multiple base64 and normal img', () => {
        const { test, success } = {
            test: `a{background-image: url(./test/cc9966.png), url(./test/postcss.jpeg);}`,
            success: `a{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwAQMAAABtzGvEAAAABGdBTUEAAPQkx/agJQAAAANQTFRFvH5IooWndAAAAA1JREFUGNNjYBgF1AQAAVAAAafi2hYAAAAASUVORK5CYII=), url(./test/postcss.jpeg);}.webp a{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwAQMAAABtzGvEAAAABGdBTUEAAPQkx/agJQAAAANQTFRFvH5IooWndAAAAA1JREFUGNNjYBgF1AQAAVAAAafi2hYAAAAASUVORK5CYII=),url(./test/postcss.jpeg.webp);}`
        };

        return run(test, success, {});
    });

    it('css rules weight', () => {
        const { test, success } = {
            test: `a{background:url(./test/postcss.jpeg) no-repeat 100% 100%}`,
            success: `a{background:url(./test/postcss.jpeg) no-repeat 100% 100%}.webp a{background-image:url(./test/postcss.jpeg.webp)}`
        };

        return run(test, success, {});
    });
});
