Prism.languages.rhumb = {
    'text': [
        {
            pattern: /"(?:`[\s\S]|\$[\w\-\.]+|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|\$\((?:[^()]|\((?:[^()]|\([^)]*\))*\))+\)|(?!\$\{|\$\()[^`"])*"/,
            greedy: true,
            alias: 'string',
            inside: {
                'text-punctuation': {
                    pattern: /^"|"$/,
                    alias: 'string'
                },
                'interpolation': [
                    {
                        pattern: /\$[\w\-\.]+/,
                        inside: {
                            'interpolation-punctuation': {
                                pattern: /\$/,
                                alias: 'punctuation'
                            }
                        },
                        alias: 'property'
                    },
                    {
                        pattern: /((?:^|[^`])(?:`{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
                        lookbehind: true,
                        inside: {
                            'interpolation-punctuation': {
                                pattern: /^\$\{|\}$/,
                                alias: 'punctuation'
                            },
                            rest: Prism.languages.rhumb
                        }
                    },
                    {
                        pattern: /((?:^|[^`])(?:`{2})*)\$\((?:[^()]|\((?:[^()]|\([^)]*\))*\))+\)/,
                        lookbehind: true,
                        inside: {
                            'interpolation-punctuation': {
                                pattern: /^\$\(|\)$/,
                                alias: 'punctuation'
                            },
                            rest: Prism.languages.rhumb
                        }
                    },
                ],
                'string': /[\s\S]+/
            }
        },
        {
            pattern: /(^|[^`])'(?:`'|[^`'\r\n])*'/,
            lookbehind: true,
            greedy: true,
            alias: 'string',
        },
    ],
    'date': {
        pattern: /(?:\d{1,4}|\$[\w\-\.]+|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|\$\((?:[^()]|\((?:[^()]|\([^)]*\))*\))+\))\/(?:\d{1,4}|\$[\w\-\.]+|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|\$\((?:[^()]|\((?:[^()]|\([^)]*\))*\))+\))\/(?:\d{1,4}|\$[\w\-\.]+|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|\$\((?:[^()]|\((?:[^()]|\([^)]*\))*\))+\))/,
        greedy: true,
        alias: 'string',
        inside: {
            'date-punctuation': {
                pattern: /\//,
                alias: 'string'
            },
            'interpolation': [
                {
                    pattern: /\$[\w\-\.]+/,
                    inside: {
                        'interpolation-punctuation': {
                            pattern: /\$/,
                            alias: 'punctuation'
                        }
                    },
                    alias: 'property'
                },
                {
                    pattern: /((?:^|[^`])(?:`{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
                    lookbehind: true,
                    inside: {
                        'interpolation-punctuation': {
                            pattern: /^\$\{|\}$/,
                            alias: 'punctuation'
                        },
                        rest: Prism.languages.rhumb
                    }
                },
                {
                    pattern: /((?:^|[^`])(?:`{2})*)\$\((?:[^()]|\((?:[^()]|\([^)]*\))*\))+\)/,
                    lookbehind: true,
                    inside: {
                        'interpolation-punctuation': {
                            pattern: /^\$\(|\)$/,
                            alias: 'punctuation'
                        },
                        rest: Prism.languages.rhumb
                    }
                },
            ],
            'string': /[\s\S]+/
        }
    },
    'key': {
        pattern: /`[^\s;)\]}]+/,
        alias: 'builtin',
    },
    'signal': {
        pattern: /(?<!#)#(?:[\w\-\.]+|(?=\())|(?<!\^)\^(?:[\w\-\.]+|(?=\())/,
        alias: 'function',
    },
    'local': {
        pattern: /\$[\d]+/,
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
            pattern: /[.:^][=.:]/,
        },
        {
            pattern: /\+(?:\+|\-|\/)|\-(?:\+|\-|\/|>)|\*(?:\*|\^)|\/(?:\/|\\)|\^(?:\^|\/)/,
        },
        {
            pattern: /[~=][=~@\\]|>[>=]|<[<=]/,

        },
        {
            pattern: /[~=!$]>|!!|\?\?/,
        }
    ],
    'comment': {
        pattern: /%.*|%\([\s\S]*?(:%\)|$)/,
        greedy: true,
    },
    'base': {
        pattern: /(?<!!)!(?!!)/,
        alias: 'variable',
    },
    'wildcard': {
        pattern: /(?<=\\[\w\.\-]*)\*/,
        alias: 'variable',
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