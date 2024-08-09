import { vi } from 'vitest';
import { gql } from '@apollo/client';
import { buildQueryFactory } from './buildQuery';
import { IntrospectedResource, IntrospectionResult } from 'ra-data-graphql';

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

describe('buildQuery', () => {
  const queryType = 'query_type';

  const resource = {
    type: { name: 'Post' },
    GET_LIST: queryType,
  } as unknown as IntrospectedResource;
  const introspectionResults = {
    resources: [resource],
  } as IntrospectionResult;

  it('throws an error if resource is unknown', () => {
    expect(() =>
      buildQueryFactory()(introspectionResults)(
        'GET_LIST',
        'Comment',
        undefined,
      ),
    ).toThrow(
      'Unknown resource Comment. Make sure it has been declared on your server side schema. Known resources are Post',
    );
  });

  it('throws an error if resource does not have a query or mutation for specified AOR fetch type', () => {
    expect(() =>
      buildQueryFactory()(introspectionResults)('CREATE', 'Post', undefined),
    ).toThrow(
      'No query or mutation matching fetch type CREATE could be found for resource Post',
    );
  });

  it('correctly builds a query and returns it along with variables and parseResponse', () => {
    const buildVariables = vi.fn(() => ({ foo: true }));
    const buildGqlQuery = vi.fn(
      () => gql`
        query {
          id
        }
      `,
    );
    const getResponseParser = vi.fn(() => 'parseResponseFunction');
    const buildVariablesFactory = vi.fn(() => buildVariables);
    const buildGqlQueryFactory = vi.fn(() => buildGqlQuery);
    const getResponseParserFactory = vi.fn(() => getResponseParser);

    expect(
      buildQueryFactory(
        buildVariablesFactory,
        buildGqlQueryFactory,
        getResponseParserFactory,
      )(introspectionResults)('GET_LIST', 'Post', { foo: 'bar' }),
    ).toEqual({
      query: gql`
        query {
          id
        }
      `,
      variables: { foo: true },
      parseResponse: 'parseResponseFunction',
    });

    expect(buildVariablesFactory).toHaveBeenCalledWith(introspectionResults);
    expect(buildGqlQueryFactory).toHaveBeenCalledWith(introspectionResults);
    expect(getResponseParserFactory).toHaveBeenCalledWith(introspectionResults);

    expect(buildVariables).toHaveBeenCalledWith(
      resource,
      'GET_LIST',
      { foo: 'bar' },
      queryType,
    );
    expect(buildGqlQuery).toHaveBeenCalledWith(
      resource,
      'GET_LIST',
      queryType,
      { foo: true },
    );
    expect(getResponseParser).toHaveBeenCalledWith('GET_LIST', { foo: 'bar' });
  });
});
