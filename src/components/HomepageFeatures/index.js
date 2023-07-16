import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Challenging & Unique',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        No conventional programming syntax was considered too sacred
        for evaluation. The end result is intended to be a thoughtful
        attempt at a programming system without following the common
        conventions of today's languages.
      </>
    ),
  },
  {
    title: 'Multiple Prototypal',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        One technique that Rhumb wants to resurrect from the dinosaurs
        is prototypal inheritance. Specifically, the Self language
        version that allows for named multiple inheritance. Rhumb takes
        this paradigm and integrates it into its core.
      </>
    ),
  },
  {
    title: 'Keyword-Free',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Rhumb keeps all the words for you, the programmer. The only reserved 
        words are <code>yes</code>, <code>no</code>, and <code>empty</code>
        (in all languages). The Rhumb VS Code extension allows you to
        use translation files to work across language barriers.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
