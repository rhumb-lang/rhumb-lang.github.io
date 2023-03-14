import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Challenging & Unique',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Rhumb was designed from the ground up to try new ideas.
        Although things may be foreign, I am attempting to assemble a
        comprehensible toolset to inspire new ideas.
      </>
    ),
  },
  {
    title: 'Prototypes',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Rhumb uses the endangered technique of prototype inheritance. It takes
        it a step further than some by offering "first-class" prototypes. Use
        with caution!
      </>
    ),
  },
  {
    title: 'Keyword-Free',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Rhumb keeps all the words for you, the programmer. The only reserved 
        words are <code>yes</code> and <code>no</code> (in all languages). Rhumb
        is a global language.
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
