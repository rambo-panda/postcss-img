/* eslint-disable max-len */

const postcss = require("postcss"),
    urlReg = /url\(['"]?([^'"]+)?['"]?\)/,
    base64Limit = 1024 * 3,
    { existsSync, statSync, readFileSync } = require("fs"),
    { dirname, resolve, extname: pathExtname } = require("path");

const extname = src => pathExtname(src).slice(1);

const toBase64 = imgSrc =>
    `data:image/${extname(imgSrc)};base64,${Buffer.from(
        readFileSync(imgSrc)
    ).toString("base64")}`;

const searchReg = /\?.+$/,
    webpReg = /\.webp(\?.+)?$/,
    endReg = /(\?.+)?$/;

const toSrc = (srcs) => srcs.join(',');

/* eslint-disable consistent-return */
const parse = (result, newOpts, url) => {
    const { strict, base64Limit: $base64Limit, webpClassName } = newOpts;

    if ($base64Limit > 0) {
        const imgSrc = resolve(dirname(result.opts.from), url).replace(searchReg, '');

        if (existsSync(imgSrc)) {
            const { size } = statSync(imgSrc);

            if (size < $base64Limit) {
                return ['B', toBase64(imgSrc)];
            }
        } else if (strict) {
            return new TypeError(`NOT FOUND Image: ${imgSrc}`);
        }
    }

    if (webpClassName !== '' && !webpReg.test(url)) {
        return ['W', url.replace(endReg, '.webp$1')];
    }
};
/* eslint-enable consistent-return */


const noParseReg = /no-postcss-img=0/,
    // relativeReg = /^(\.{1,2}\/|(?!(?:https?:\/\/|data:image))\w)/,
    absoluteReg = /^(?:https?:\/\/|data:image)/; // https://  or  base64

const do_parse = process.env.NO_WEBP === '1' ? () => () => {} : (opts = {}) => (root, result) => {
        const newOpts = Object.assign(
            {
                ignoreExts : ['svg', 'webp'],
                webpClassName: "webp",
                base64Limit,
                strict: true,
                ignore: (url) => url ? noParseReg.test(url) || newOpts.ignoreExts.includes(extname(url)) || absoluteReg.test(url) : true
            },
            opts
        );

        root.walkDecls(/^background(-image)?$/, decl => {
            const { value } = decl;

            if ((decl.parent.selector || "PNPI").includes('PNPI')) { /* PNPI: Postcss No Parse Image */
                return;
            }

            const ress = [],
                parseVal = value.split(',').map(v => {
                    const [, url ] = urlReg.exec(v) || [];

                    if (newOpts.ignore(url)) {
                        return v;
                    }

                    const res = parse(result, newOpts, url);

                    if (undefined === res) {
                        return v;
                    }

                    if (res instanceof Error) {
                        decl.error(res);

                        return res;
                    }

                    res.push(url);

                    ress.push(res);

                    return v.replace(url, res[1]);
                });

            if (ress.length === 0) {
                return;
            }

            if (ress.some(x => x[0] === 'B')) {
                ress.forEach((v) => {
                    if (v[0] === 'B') {

                        decl.value = decl.value.replace(v[2], v[1]);
                    }
                });

                if (ress.length === 1) {
                    return;
                }
            }


            const { parent } = decl,
                newDecl = decl.clone({
                    value: toSrc(parseVal.map(v => (urlReg.exec(v) || [v])[0])),
                    prop: 'background-image'
                }),
                newRule = parent.cloneAfter({
                    selector: parent.selector.split(',').map(v => `.${newOpts.webpClassName} ${v}`).join(','),
                    nodes: [
                    ]
                });

            newDecl.parent = newRule;

            newRule.nodes.push(newDecl);
        });
    };

module.exports = postcss.plugin(
    "postcss-img",
    do_parse
);
