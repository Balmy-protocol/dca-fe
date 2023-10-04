import type { PlopTypes } from '@turbo/gen';

// Learn more about Turborepo Generators at https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setHelper('downcase', (text) => {
    return text.toLowerCase();
  });

  // A simple generator to add a new React component to the internal UI library
  plop.setGenerator('react-component', {
    description: 'Adds a new react component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the component?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{downcase name}}/index.tsx',
        templateFile: 'templates/component.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{downcase name}}/{{ pascalCase name }}.stories.tsx',
        templateFile: 'templates/component-story.hbs',
      },
      {
        type: 'append',
        path: 'src/components/index.tsx',
        pattern: /(?<insertion>\/\/ component exports)/g,
        template: 'export * from "./{{downcase name}}";',
      },
    ],
  });

  plop.setGenerator('mui-component', {
    description: 'Adds a new MUI component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the component?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{downcase name}}/index.tsx',
        templateFile: 'templates/mui-component.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{downcase name}}/{{ pascalCase name }}.stories.tsx',
        templateFile: 'templates/mui-component-story.hbs',
      },
      {
        type: 'append',
        path: 'src/components/index.tsx',
        pattern: /(?<insertion>\/\/ component exports)/g,
        template: 'export * from "./{{downcase name}}";',
      },
    ],
  });
}
