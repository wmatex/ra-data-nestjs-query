import { TypeKind } from 'graphql';
import {
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
  DELETE_MANY,
  UPDATE_MANY,
} from 'ra-core';
import { IntrospectionResult } from 'ra-data-graphql';
import { ApolloQueryResult } from '@apollo/client';
import getResponseParser from './getResponseParser';

describe('getResponseParser', () => {
  it.each([[GET_LIST], [GET_MANY], [GET_MANY_REFERENCE]])(
    'returns the response expected for %s',
    (type) => {
      const introspectionResults: IntrospectionResult = {
        resources: [
          {
            type: {
              name: 'User',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'firstName',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
          {
            type: {
              name: 'Tag',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'name',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
        ],
        types: [{ name: 'User' }, { name: 'Tag' }],
      };
      const response = {
        data: {
          data: {
            nodes: [
              {
                __typename: 'Post',
                id: 'post1',
                title: 'title1',
                author: { id: 'author1', firstName: 'Toto' },
                coauthor: null,
                tags: [
                  { id: 'tag1', name: 'tag1 name' },
                  { id: 'tag2', name: 'tag2 name' },
                ],
                embeddedJson: { foo: 'bar' },
              },
              {
                __typename: 'Post',
                id: 'post2',
                title: 'title2',
                author: { id: 'author1', firstName: 'Toto' },
                coauthor: null,
                tags: [
                  { id: 'tag1', name: 'tag1 name' },
                  { id: 'tag3', name: 'tag3 name' },
                ],
                embeddedJson: { foo: 'bar' },
              },
            ],
            pageInfo: {
              hasPreviousPage: false,
              hasNextPage: true,
            },
            totalCount: 100,
          },
        },
      } as ApolloQueryResult<any>;

      expect(getResponseParser(introspectionResults)(type)(response)).toEqual({
        data: [
          {
            id: 'post1',
            title: 'title1',
            'author.id': 'author1',
            author: { id: 'author1', firstName: 'Toto' },
            tags: [
              { id: 'tag1', name: 'tag1 name' },
              { id: 'tag2', name: 'tag2 name' },
            ],
            tagsIds: ['tag1', 'tag2'],
            embeddedJson: { foo: 'bar' },
          },
          {
            id: 'post2',
            title: 'title2',
            'author.id': 'author1',
            author: { id: 'author1', firstName: 'Toto' },
            tags: [
              { id: 'tag1', name: 'tag1 name' },
              { id: 'tag3', name: 'tag3 name' },
            ],
            tagsIds: ['tag1', 'tag3'],
            embeddedJson: { foo: 'bar' },
          },
        ],
        total: 100,
      });
    },
  );

  describe.each([[CREATE], [UPDATE], [DELETE]])('%s', (type) => {
    it(`returns the response expected for ${type}`, () => {
      const introspectionResults: IntrospectionResult = {
        resources: [
          {
            type: {
              name: 'User',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'firstName',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
          {
            type: {
              name: 'Tag',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'name',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
        ],
        types: [{ name: 'User' }, { name: 'Tag' }],
      };
      const response = {
        data: {
          data: {
            __typename: 'Post',
            id: 'post1',
            title: 'title1',
            author: { id: 'author1', firstName: 'Toto' },
            coauthor: null,
            tags: [
              { id: 'tag1', name: 'tag1 name' },
              { id: 'tag2', name: 'tag2 name' },
            ],
            embeddedJson: { foo: 'bar' },
          },
        },
      } as ApolloQueryResult<any>;
      expect(getResponseParser(introspectionResults)(type)(response)).toEqual({
        data: {
          id: 'post1',
          title: 'title1',
          'author.id': 'author1',
          author: { id: 'author1', firstName: 'Toto' },
          tags: [
            { id: 'tag1', name: 'tag1 name' },
            { id: 'tag2', name: 'tag2 name' },
          ],
          tagsIds: ['tag1', 'tag2'],
          embeddedJson: { foo: 'bar' },
        },
      });
    });

    it(`returns the response expected for ${type} with simple arrays of values`, () => {
      const introspectionResults: IntrospectionResult = {
        resources: [
          {
            type: {
              name: 'User',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'firstName',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
          {
            type: {
              name: 'Tag',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'name',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
        ],
        types: [{ name: 'User' }, { name: 'Tag' }],
      };
      const response = {
        data: {
          data: {
            __typename: 'Post',
            id: 'post1',
            title: 'title1',
            author: { id: 'author1', firstName: 'Toto' },
            coauthor: null,
            tags: [
              { id: 'tag1', name: 'tag1 name' },
              { id: 'tag2', name: 'tag2 name' },
            ],
            features: ['feature1', 'feature2'],
            embeddedJson: { foo: 'bar' },
          },
        },
      } as ApolloQueryResult<any>;
      expect(getResponseParser(introspectionResults)(type)(response)).toEqual({
        data: {
          id: 'post1',
          title: 'title1',
          'author.id': 'author1',
          author: { id: 'author1', firstName: 'Toto' },
          tags: [
            { id: 'tag1', name: 'tag1 name' },
            { id: 'tag2', name: 'tag2 name' },
          ],
          features: ['feature1', 'feature2'],
          tagsIds: ['tag1', 'tag2'],
          embeddedJson: { foo: 'bar' },
        },
      });
    });

    it(`returns the response expected for ${type} with aliases`, () => {
      const introspectionResults: IntrospectionResult = {
        resources: [
          {
            type: {
              name: 'User',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'firstName',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
          {
            type: {
              name: 'Tag',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'name',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
        ],
        types: [{ name: 'User' }, { name: 'Tag' }],
      };
      const response = {
        data: {
          data: {
            __typename: 'Post',
            id: 'post1',
            aliasTitle: 'title1',
            author: { id: 'author1', firstName: 'Toto' },
            coauthor: null,
            tags: [
              { id: 'tag1', name: 'tag1 name' },
              { id: 'tag2', name: 'tag2 name' },
            ],
            embeddedJson: { foo: 'bar' },
          },
        },
      } as ApolloQueryResult<any>;

      expect(getResponseParser(introspectionResults)(type)(response)).toEqual({
        data: {
          aliasTitle: 'title1',
          author: { firstName: 'Toto', id: 'author1' },
          'author.id': 'author1',
          coauthor: undefined,
          'coauthor.id': undefined,
          embeddedJson: { foo: 'bar' },
          id: 'post1',
          tags: [
            { id: 'tag1', name: 'tag1 name' },
            { id: 'tag2', name: 'tag2 name' },
          ],
          tagsIds: ['tag1', 'tag2'],
        },
      });
    });

    it(`returns the response expected for ${type} with embedded objects`, () => {
      const introspectionResults: IntrospectionResult = {
        resources: [
          {
            type: {
              name: 'User',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'firstName',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
          {
            type: {
              name: 'Tag',
              fields: [
                { name: 'id', type: { kind: TypeKind.SCALAR } },
                {
                  name: 'name',
                  type: { kind: TypeKind.SCALAR },
                },
              ],
            },
          },
        ],
        types: [{ name: 'User' }, { name: 'Tag' }],
      };
      const response = {
        data: {
          data: {
            __typename: 'Post',
            id: 'post1',
            title: 'title1',
            author: { id: 'author1', firstName: 'Toto' },
            coauthor: null,
            tags: [
              { id: 'tag1', name: 'tag1 name' },
              { id: 'tag2', name: 'tag2 name' },
            ],
            embeddedJson: {
              strictEqual: [{ var: 'k5PjloYXQhn' }, true],
            },
          },
        },
      } as ApolloQueryResult<any>;
      expect(getResponseParser(introspectionResults)(type)(response)).toEqual({
        data: {
          id: 'post1',
          title: 'title1',
          'author.id': 'author1',
          author: { id: 'author1', firstName: 'Toto' },
          tags: [
            { id: 'tag1', name: 'tag1 name' },
            { id: 'tag2', name: 'tag2 name' },
          ],
          tagsIds: ['tag1', 'tag2'],
          embeddedJson: {
            strictEqual: [{ var: 'k5PjloYXQhn' }, true],
          },
        },
      });
    });
  });

  it('returns the response expected for DELETE_MANY', () => {
    const introspectionResults: IntrospectionResult = {
      resources: [
        {
          type: {
            name: 'User',
            fields: [
              { name: 'id', type: { kind: TypeKind.SCALAR } },
              {
                name: 'firstName',
                type: { kind: TypeKind.SCALAR },
              },
            ],
          },
        },
      ],
      types: [{ name: 'User' }],
    };
    const response = {
      data: {
        data: {
          deletedCount: 4,
        },
      },
    } as ApolloQueryResult<any>;

    expect(
      getResponseParser(introspectionResults)(DELETE_MANY, {
        ids: [1, 2, 3, 4],
      })(response),
    ).toEqual({
      data: [1, 2, 3, 4],
    });
  });

  it('returns the response expected for UPDATE_MANY', () => {
    const introspectionResults: IntrospectionResult = {
      resources: [
        {
          type: {
            name: 'User',
            fields: [
              { name: 'id', type: { kind: TypeKind.SCALAR } },
              {
                name: 'firstName',
                type: { kind: TypeKind.SCALAR },
              },
            ],
          },
        },
      ],
      types: [{ name: 'User' }],
    };
    const response = {
      data: {
        data: {
          updatedCount: 4,
        },
      },
    } as ApolloQueryResult<any>;

    expect(
      getResponseParser(introspectionResults)(UPDATE_MANY, {
        ids: [1, 2, 3, 4],
      })(response),
    ).toEqual({
      data: [1, 2, 3, 4],
    });
  });
});
