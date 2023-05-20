Prism.languages.rhumb = {
    'text': [
        {
            pattern: /(^|[^`])"(?:`.|[^`"\r\n])*"/,
            lookbehind: true,
            greedy: true,
            alias: 'string',
        },
        {
            pattern: /(^|[^`])'(?:`'|[^`'\r\n])*'/,
            lookbehind: true,
            greedy: true,
            alias: 'string',
        },
    ],
    'key': {
        pattern: /`[^\s;)\]}]+/,
        alias: 'builtin',
    },
    'local': {
        pattern: /#[\w\d]+/,
        alias: 'variable',
    },
    'punctuation': {
        pattern: /[{}()\[\];]/,
    },
    'number': [
        {
            pattern: /(?<!\w|[.,])[0-9][0-9]*(?![0-9]*[.,])/,
        },
        {
            pattern: /(?<!\w)[0-9,]+(?:\.\-|\.[0-9]+(?![0-9]*\,))/,
        },
        {
            pattern: /(?<!\w)[0-9,]+(?:\.\-|\.[0-9]+(?![0-9]*\,))/,

        },
        {
            pattern: /(?<!\w)[0-9.]+(?:\,\-|\,[0-9]+(?![0-9]*\.))/,
        },
    ],
    'operator': [
        {
            pattern: /[.:][=.:]/,
        },
        {
            pattern: /\+(?:\+|\-|\/)|\-(?:\+|\-|\/|>)|\*(?:\*|\^)|\/(?:\/|\\)|\^(?:\^|\/)/,
        },
        {
            pattern: /[!=][=~@*\\]|>[>=]|<[<=]/,

        },
        {
            pattern: /[!=]>|!!|\?\?/,
        }
    ],
    'comment': {
        pattern: /%.*|%\([\s\S]*?(:%\)|$)/,
        greedy: true,
    },
    'truth': {
        pattern: /\b(?:yes|no)\b/,
        alias: 'boolean',
    },
    'empty': {
        pattern: /\bempty\b/,
        alias: 'boolean',
    },
}