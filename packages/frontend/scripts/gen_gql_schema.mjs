import { getIntrospectedSchema, minifyIntrospectionQuery } from '@urql/introspection';
import * as fs from 'fs';
import { getIntrospectionQuery } from 'graphql';
import fetch from 'node-fetch';
import * as path from 'path';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const filename = path.basename(new URL(import.meta.url).pathname);

const endpoint =
  process.env.GRAPHQL_URL_FOR_CODEGEN ||
  (fs.existsSync(path.resolve(dirname, '..', '.env.local')) &&
    fs
      .readFileSync(path.resolve(dirname, '..', '.env.local'), 'utf-8')
      .split('\n')
      .find((line) => line.includes('NEXT_PUBLIC_GRAPHQL_URL'))
      ?.split('=')
      .pop()) ||
  '';

fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query: getIntrospectionQuery({ descriptions: false }),
  }),
})
  .then((result) => result.json())
  .then(({ data }) => {
    const minified = minifyIntrospectionQuery(getIntrospectedSchema(data));
    const code = `// Code generated by ${filename}; DO NOT EDIT.
const s = ${JSON.stringify(minified)}
export default s;
    `;
    fs.writeFileSync(
      path.resolve(dirname, '..', 'src', 'libs', 'urql', 'generated_gql_schema_json.ts'),
      code
    );
  });
