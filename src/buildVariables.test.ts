import {
  GET_LIST,
  GET_MANY,
  // GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
  DELETE_MANY,
  UPDATE_MANY,
} from 'ra-core';
import buildVariables from './buildVariables';
import { IntrospectionResult } from 'ra-data-graphql';
import {
  IntrospectionField,
  IntrospectionScalarType,
  IntrospectionSchema,
  TypeKind,
} from 'graphql';

describe(buildVariables.name, () => {
  const introspectionResult: IntrospectionResult = {
    queries: [],
    resources: [],
    schema: {} as IntrospectionSchema,
    types: [
      {
        kind: 'INPUT_OBJECT',
        name: 'PostFilter',
        inputFields: [],
        description: '',
      },
    ],
  };
  describe(GET_LIST, () => {
    it('returns correct variables', () => {
      const params = {
        filter: {
          ids: ['foo1', 'foo2'],
          title: 'Foo',
          views: 100,
        },
        pagination: { page: 10, perPage: 10 },
        sort: { field: 'sortField', order: 'DESC' },
      };

      expect(
        buildVariables(introspectionResult)(
          {
            type: {
              kind: 'OBJECT',
              name: 'Post',
              fields: [
                {
                  name: 'title',
                  type: {
                    name: 'String',
                    kind: TypeKind.SCALAR,
                  } as IntrospectionScalarType,
                } as IntrospectionField,
              ],
              interfaces: [],
            },
          },
          GET_LIST,
          params,
          {},
        ),
      ).toEqual({
        filter: {
          id: { in: ['foo1', 'foo2'] },
          title: { like: 'Foo' },
          views: { eq: 100 },
        },
        paging: { limit: 10, offset: 90 },
        sorting: [{ field: 'sortField', direction: 'DESC' }],
      });
    });
  });

  describe(CREATE, () => {
    it('returns correct variables', () => {
      const params = {
        data: {
          title: 'Foo',
        },
      };
      const queryType = {
        args: [{ name: 'tagsIds' }, { name: 'authorId' }],
      };

      expect(
        buildVariables(introspectionResult)(
          { type: { name: 'Post' } },
          CREATE,
          params,
          queryType,
        ),
      ).toEqual({
        input: {
          post: {
            title: 'Foo',
          },
        },
      });
    });
  });

  describe(UPDATE, () => {
    it('returns correct variables', () => {
      const params = {
        id: 'post1',
        data: {
          title: 'Foo',
        },
      };
      const queryType = {
        args: [{ name: 'tagsIds' }, { name: 'authorId' }],
      };

      expect(
        buildVariables(introspectionResult)(
          { type: { name: 'Post' } },
          UPDATE,
          params,
          queryType,
        ),
      ).toEqual({
        input: {
          id: 'post1',
          update: {
            title: 'Foo',
          },
        },
      });
    });
  });

  describe(GET_MANY, () => {
    it('returns correct variables', () => {
      const params = {
        ids: ['tag1', 'tag2'],
      };

      expect(
        buildVariables(introspectionResult)(
          { type: { name: 'Post' } },
          GET_MANY,
          params,
          {},
        ),
      ).toEqual({
        filter: { id: { in: ['tag1', 'tag2'] } },
      });
    });
  });

  // TODO: reimplement
  // describe('GET_MANY_REFERENCE', () => {
  //   it('returns correct variables', () => {
  //     const params = {
  //       target: 'author_id',
  //       id: 'author1',
  //       pagination: { page: 1, perPage: 10 },
  //       sort: { field: 'name', order: 'ASC' },
  //     };

  //     expect(
  //       buildVariables(introspectionResult)(
  //         { type: { name: 'Post' } },
  //         GET_MANY_REFERENCE,
  //         params,
  //         {},
  //       ),
  //     ).toEqual({
  //       filter: { author_id: 'author1' },
  //       paging: {
  //         limit: 10,
  //         offset: 0,
  //       },
  //       sorting: [
  //         {
  //           field: 'name',
  //           direction: 'ASC',
  //         },
  //       ],
  //     });
  //   });
  // });

  describe(DELETE, () => {
    it('returns correct variables', () => {
      const params = {
        id: 'post1',
      };
      expect(
        buildVariables(introspectionResult)(
          {
            type: {
              kind: 'OBJECT',
              name: 'Post',
              fields: [],
              interfaces: [],
            },
          },
          DELETE,
          params,
          {},
        ),
      ).toEqual({
        id: 'post1',
      });
    });
  });

  describe(DELETE_MANY, () => {
    it('returns correct variables', () => {
      const params = {
        ids: ['post1'],
      };
      expect(
        buildVariables(introspectionResult)(
          {
            type: {
              kind: 'OBJECT',
              name: 'Post',
              fields: [],
              interfaces: [],
            },
          },
          DELETE_MANY,
          params,
          {},
        ),
      ).toEqual({
        input: {
          filter: { id: { in: ['post1'] } },
        },
      });
    });
  });

  describe(UPDATE_MANY, () => {
    it('returns correct variables', () => {
      const params = {
        ids: ['post1', 'post2'],
        data: {
          title: 'New Title',
        },
      };
      expect(
        buildVariables(introspectionResult)(
          {
            type: {
              kind: 'OBJECT',
              name: 'Post',
              fields: [],
              interfaces: [],
            },
          },
          UPDATE_MANY,
          params,
          {},
        ),
      ).toEqual({
        input: {
          filter: {
            id: { in: ['post1', 'post2'] },
          },
          update: {
            title: 'New Title',
          },
        },
      });
    });
  });
});
