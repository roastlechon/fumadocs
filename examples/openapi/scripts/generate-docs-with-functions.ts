#!/usr/bin/env tsx

import { generateFiles } from 'fumadocs-openapi';

const input = [
  './swagger/API-3.0-resolved.json',
  './swagger/API-2.0-resolved.json',
];

// Example of using function signatures for dynamic index generation
void generateFiles({
  input,
  output: './content/docs/apis',
  per: 'operation',
  index: {
    url: {
      baseUrl: '/docs/apis',
      contentDir: './content/docs/apis',
    },
    items: input.map((schemaPath) => ({
      // Dynamic title from OpenAPI document
      // @ts-ignore - document parameter type is inferred at runtime
      title: (document) => document.info.title,

      // Dynamic description from OpenAPI document
      // @ts-ignore - document parameter type is inferred at runtime
      description: (document) =>
        document.info.description || 'API Documentation',

      // Dynamic path using slugified document title
      // @ts-ignore - document parameter type is inferred at runtime
      path: (document) => {
        const slug = document.info.title.toLowerCase().replace(/\s+/g, '-');
        return `${slug}/index`;
      },

      // Include description in body content instead of frontmatter
      // This is useful for longer descriptions that benefit from being in the main content
      includeDescription: true,

      // Only include files from this specific schema
      only: [schemaPath],
    })) as any, // Type assertion to work around TypeScript inference issues
  },
  name: (output, document) => {
    const docName = document.info.title.toLowerCase().replace(/\s+/g, '-');

    if (output.type === 'operation') {
      const operationName = output.item.path
        .toLowerCase()
        .replace(/[{}]/g, '')
        .replace(/\//g, '-');
      return `${docName}/${operationName}-${output.item.method}`;
    }

    return docName;
  },
});

// This would result in a structure like:
// ./content/docs/apis/my-api-v3/index.mdx (with title from document.info.title)
// ./content/docs/apis/my-api-v3/users-get.mdx
// ./content/docs/apis/my-api-v3/users-post.mdx
// ./content/docs/apis/my-api-v2/index.mdx (with title from document.info.title)
// ./content/docs/apis/my-api-v2/products-get.mdx
// etc.
