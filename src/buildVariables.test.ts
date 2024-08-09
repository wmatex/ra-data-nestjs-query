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
import buildVariables from './buildVariables';
import { IntrospectionResult } from 'ra-data-graphql';
import {
  IntrospectionField,
  IntrospectionScalarType,
  IntrospectionSchema,
  TypeKind,
} from 'graphql';
import { vi } from 'vitest';

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

describe(buildVariables.name, () => {
  const introspectionResult: IntrospectionResult = {
    queries: [],
    resources: [
      {
        type: {
          kind: TypeKind.OBJECT,
          name: 'Club',
          description: 'RESOURCE',
          fields: [
            {
              name: 'id',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'ID',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'name',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'location',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.OBJECT,
                  name: 'Point',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'createdAt',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'DateTime',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'createdBy',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'updatedAt',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'DateTime',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'updatedBy',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
          ],
          interfaces: [],
        },
      },
      {
        type: {
          kind: TypeKind.OBJECT,
          name: 'Field',
          description: 'RESOURCE',
          fields: [
            {
              name: 'id',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'ID',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'name',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'sport',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: 'ENUM',
                  name: 'Sports',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'price',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'Float',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'active',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'Boolean',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'createdAt',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'DateTime',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'createdBy',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'updatedAt',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'DateTime',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'updatedBy',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            {
              name: 'club',
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.OBJECT,
                  name: 'Club',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
          ],
          interfaces: [],
        },
      },
    ],
    schema: {} as IntrospectionSchema,
    types: [
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'UpdateOneClubInput',
        inputFields: [
          {
            name: 'id',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.SCALAR,
                name: 'ID',
              },
            },
            defaultValue: null,
          },
          {
            name: 'update',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.INPUT_OBJECT,
                name: 'UpdateClubInput',
              },
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'UpdateClubInput',
        inputFields: [
          {
            name: 'name',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'location',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'PointInput',
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'PointInput',
        inputFields: [
          {
            name: 'type',
            description: 'Point',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.SCALAR,
                name: 'String',
              },
            },
            defaultValue: null,
          },
          {
            name: 'coordinates',
            description: '[lon, lat]',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.LIST,
                ofType: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.SCALAR,
                    name: 'Float',
                  },
                },
              },
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'DeleteManyClubsInput',
        inputFields: [
          {
            name: 'filter',
            description: 'Filter to find records to delete',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.INPUT_OBJECT,
                name: 'ClubDeleteFilter',
              },
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'ClubDeleteFilter',
        inputFields: [
          {
            name: 'and',
            type: {
              kind: TypeKind.LIST,
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'ClubDeleteFilter',
                },
              },
            },
            defaultValue: null,
          },
          {
            name: 'or',
            type: {
              kind: TypeKind.LIST,
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'ClubDeleteFilter',
                },
              },
            },
            defaultValue: null,
          },
          {
            name: 'id',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'IDFilterComparison',
            },
            defaultValue: null,
          },
          {
            name: 'name',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'StringFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'active',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'BooleanFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'createdAt',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'DateFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'createdBy',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'StringFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'updatedAt',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'DateFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'updatedBy',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'StringFieldComparison',
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'IDFilterComparison',
        inputFields: [
          {
            name: 'is',
            type: {
              kind: TypeKind.SCALAR,
              name: 'Boolean',
            },
            defaultValue: null,
          },
          {
            name: 'isNot',
            type: {
              kind: TypeKind.SCALAR,
              name: 'Boolean',
            },
            defaultValue: null,
          },
          {
            name: 'eq',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'neq',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'gt',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'gte',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'lt',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'lte',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'like',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'notLike',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'iLike',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'notILike',
            type: {
              kind: TypeKind.SCALAR,
              name: 'ID',
            },
            defaultValue: null,
          },
          {
            name: 'in',
            type: {
              kind: TypeKind.LIST,
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'ID',
                },
              },
            },
            defaultValue: null,
          },
          {
            name: 'notIn',
            type: {
              kind: TypeKind.LIST,
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'ID',
                },
              },
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'StringFieldComparison',
        inputFields: [
          {
            name: 'is',
            type: {
              kind: TypeKind.SCALAR,
              name: 'Boolean',
            },
            defaultValue: null,
          },
          {
            name: 'isNot',
            type: {
              kind: TypeKind.SCALAR,
              name: 'Boolean',
            },
            defaultValue: null,
          },
          {
            name: 'eq',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'neq',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'gt',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'gte',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'lt',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'lte',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'like',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'notLike',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'iLike',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'notILike',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String',
            },
            defaultValue: null,
          },
          {
            name: 'in',
            type: {
              kind: TypeKind.LIST,
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
            },
            defaultValue: null,
          },
          {
            name: 'notIn',
            type: {
              kind: TypeKind.LIST,
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'BooleanFieldComparison',
        inputFields: [
          {
            name: 'is',
            type: {
              kind: TypeKind.SCALAR,
              name: 'Boolean',
            },
            defaultValue: null,
          },
          {
            name: 'isNot',
            type: {
              kind: TypeKind.SCALAR,
              name: 'Boolean',
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'DateFieldComparison',
        inputFields: [
          {
            name: 'is',
            type: {
              kind: TypeKind.SCALAR,
              name: 'Boolean',
            },
            defaultValue: null,
          },
          {
            name: 'isNot',
            type: {
              kind: TypeKind.SCALAR,
              name: 'Boolean',
            },
            defaultValue: null,
          },
          {
            name: 'eq',
            type: {
              kind: TypeKind.SCALAR,
              name: 'DateTime',
            },
            defaultValue: null,
          },
          {
            name: 'neq',
            type: {
              kind: TypeKind.SCALAR,
              name: 'DateTime',
            },
            defaultValue: null,
          },
          {
            name: 'gt',
            type: {
              kind: TypeKind.SCALAR,
              name: 'DateTime',
            },
            defaultValue: null,
          },
          {
            name: 'gte',
            type: {
              kind: TypeKind.SCALAR,
              name: 'DateTime',
            },
            defaultValue: null,
          },
          {
            name: 'lt',
            type: {
              kind: TypeKind.SCALAR,
              name: 'DateTime',
            },
            defaultValue: null,
          },
          {
            name: 'lte',
            type: {
              kind: TypeKind.SCALAR,
              name: 'DateTime',
            },
            defaultValue: null,
          },
          {
            name: 'in',
            type: {
              kind: TypeKind.LIST,
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'DateTime',
                },
              },
            },
            defaultValue: null,
          },
          {
            name: 'notIn',
            type: {
              kind: TypeKind.LIST,
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.SCALAR,
                  name: 'DateTime',
                },
              },
            },
            defaultValue: null,
          },
          {
            name: 'between',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'DateFieldComparisonBetween',
            },
            defaultValue: null,
          },
          {
            name: 'notBetween',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'DateFieldComparisonBetween',
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'DateFieldComparisonBetween',
        inputFields: [
          {
            name: 'lower',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.SCALAR,
                name: 'DateTime',
              },
            },
            defaultValue: null,
          },
          {
            name: 'upper',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.SCALAR,
                name: 'DateTime',
              },
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'CreateOneClubInput',
        inputFields: [
          {
            name: 'club',
            description: 'The record to create',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.INPUT_OBJECT,
                name: 'CreateClubInput',
              },
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'CreateClubInput',
        inputFields: [
          {
            name: 'name',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.SCALAR,
                name: 'String',
              },
            },
            defaultValue: null,
          },
          {
            name: 'address',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.SCALAR,
                name: 'String',
              },
            },
            defaultValue: null,
          },
          {
            name: 'location',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.INPUT_OBJECT,
                name: 'PointInput',
              },
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'UpdateManyClubsInput',
        inputFields: [
          {
            name: 'filter',
            description: 'Filter used to find fields to update',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.INPUT_OBJECT,
                name: 'ClubUpdateFilter',
              },
            },
            defaultValue: null,
          },
          {
            name: 'update',
            description:
              'The update to apply to all records found using the filter',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.INPUT_OBJECT,
                name: 'UpdateClubInput',
              },
            },
            defaultValue: null,
          },
        ],
      },
      {
        isOneOf: true,
        kind: TypeKind.INPUT_OBJECT,
        name: 'ClubUpdateFilter',
        inputFields: [
          {
            name: 'and',
            type: {
              kind: 'LIST',
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'ClubUpdateFilter',
                },
              },
            },
            defaultValue: null,
          },
          {
            name: 'or',
            type: {
              kind: 'LIST',
              ofType: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'ClubUpdateFilter',
                },
              },
            },
            defaultValue: null,
          },
          {
            name: 'id',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'IDFilterComparison',
            },
            defaultValue: null,
          },
          {
            name: 'name',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'StringFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'active',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'BooleanFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'createdAt',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'DateFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'createdBy',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'StringFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'updatedAt',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'DateFieldComparison',
            },
            defaultValue: null,
          },
          {
            name: 'updatedBy',
            type: {
              kind: TypeKind.INPUT_OBJECT,
              name: 'StringFieldComparison',
            },
            defaultValue: null,
          },
        ],
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
              kind: TypeKind.OBJECT,
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
          title: { iLike: 'Foo' },
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
          name: 'Test club',
          location: {
            type: 'Point',
            coordinates: [-34.6490871, -58.3457883],
          },
          extraFieldToIgnore: 'pipipi',
        },
      };
      const queryType: IntrospectionField = {
        name: 'createOneClub',
        args: [
          {
            name: 'input',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.INPUT_OBJECT,
                name: 'CreateOneClubInput',
              },
            },
            defaultValue: null,
          },
        ],
        type: {
          kind: TypeKind.NON_NULL,
          ofType: {
            kind: TypeKind.OBJECT,
            name: 'Club',
          },
        },
        isDeprecated: false,
        deprecationReason: null,
      };

      expect(
        buildVariables(introspectionResult)(
          introspectionResult.resources[0],
          CREATE,
          params,
          queryType,
        ),
      ).toEqual({
        input: {
          club: {
            name: 'Test club',
            location: {
              type: 'Point',
              coordinates: [-34.6490871, -58.3457883],
            },
          },
        },
      });
    });
  });

  describe(UPDATE, () => {
    it('returns correct variables', () => {
      const params = {
        id: '7c28654a-cffa-4723-b5d3-99142469f4b8',
        data: {
          id: '7c28654a-cffa-4723-b5d3-99142469f4b8',
          name: 'Test club',
          location: {
            type: 'Point',
            coordinates: [-34.6490871, -58.3457883],
          },
          createdAt: new Date(),
          createdBy: 'a59f7d84-ae82-4f2e-bd27-967b92314eaf',
          updatedAt: new Date(),
          updatedBy: 'c2415901-faa3-43c3-9da7-f29de98e6988',
        },
      };
      const queryType: IntrospectionField = {
        name: 'updateOneClub',
        args: [
          {
            name: 'input',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.INPUT_OBJECT,
                name: 'UpdateOneClubInput',
              },
            },
            defaultValue: null,
          },
        ],
        type: {
          kind: TypeKind.NON_NULL,
          ofType: {
            kind: TypeKind.OBJECT,
            name: 'Club',
          },
        },
        isDeprecated: false,
        deprecationReason: null,
      };

      expect(
        buildVariables(introspectionResult)(
          introspectionResult.resources[0],
          UPDATE,
          params,
          queryType,
        ),
      ).toEqual({
        input: {
          id: '7c28654a-cffa-4723-b5d3-99142469f4b8',
          update: {
            name: 'Test club',
            location: {
              type: 'Point',
              coordinates: [-34.6490871, -58.3457883],
            },
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
          introspectionResult.resources[0],
          GET_MANY,
          params,
          {},
        ),
      ).toEqual({
        filter: { id: { in: ['tag1', 'tag2'] } },
      });
    });
  });

  describe(GET_MANY_REFERENCE, () => {
    it('returns correct variables', () => {
      const params = {
        target: 'club',
        id: '103daae0-ef3f-4f1b-a114-528df8047cb4',
        filter: { sport: 'Football' },
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'name', order: 'ASC' },
      };

      expect(
        buildVariables(introspectionResult)(
          introspectionResult.resources[1], // fields, which are defined as entities that exist within a club
          GET_MANY_REFERENCE,
          params,
          {},
        ),
      ).toEqual({
        filter: { club: { id: { eq: params.id } }, sport: { eq: 'Football' } },
        paging: {
          limit: 10,
          offset: 0,
        },
        sorting: [
          {
            field: 'name',
            direction: 'ASC',
          },
        ],
      });
    });
  });

  describe(DELETE, () => {
    it('returns correct variables', () => {
      const params = {
        id: 'post1',
      };
      expect(
        buildVariables(introspectionResult)(
          {
            type: {
              kind: TypeKind.OBJECT,
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
        ids: [
          '12817482-2f5d-47ae-bb41-15fb63bc2cae',
          '7aebbf30-56f6-4f84-a4c8-6da499608b2a',
        ],
      };
      expect(
        buildVariables(introspectionResult)(
          introspectionResult.resources[0],
          DELETE_MANY,
          params,
          {
            name: 'deleteManyClubs',
            args: [
              {
                name: 'input',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'DeleteManyClubsInput',
                  },
                },
                defaultValue: null,
              },
            ],
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.OBJECT,
                name: 'DeleteManyResponse',
              },
            },
            isDeprecated: false,
            deprecationReason: null,
          },
        ),
      ).toEqual({
        input: {
          filter: { id: { in: params.ids } },
        },
      });
    });
  });

  describe(UPDATE_MANY, () => {
    it('returns correct variables', () => {
      const params = {
        ids: [
          '7c28654a-cffa-4723-b5d3-99142469f4b8',
          'e57e77fa-4989-4926-ab42-697667305b82',
          '6aaeb324-d63f-4106-806b-712b2dec4805',
        ],
        data: {
          name: 'Test club',
          location: {
            type: 'Point',
            coordinates: [-34.6490871, -58.3457883],
          },
          randomFieldToExclude: 'pipipi',
          createdAt: new Date(),
          createdBy: 'a59f7d84-ae82-4f2e-bd27-967b92314eaf',
          updatedAt: new Date(),
          updatedBy: 'c2415901-faa3-43c3-9da7-f29de98e6988',
        },
      };

      const queryType: IntrospectionField = {
        name: 'updateManyClubs',
        args: [
          {
            name: 'input',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.INPUT_OBJECT,
                name: 'UpdateManyClubsInput',
              },
            },
            defaultValue: null,
          },
        ],
        type: {
          kind: TypeKind.NON_NULL,
          ofType: {
            kind: TypeKind.OBJECT,
            name: 'UpdateManyResponse',
          },
        },
        isDeprecated: false,
        deprecationReason: null,
      };

      expect(
        buildVariables(introspectionResult)(
          introspectionResult.resources[0],
          UPDATE_MANY,
          params,
          queryType,
        ),
      ).toEqual({
        input: {
          filter: {
            id: { in: params.ids },
          },
          update: {
            name: 'Test club',
            location: {
              type: 'Point',
              coordinates: [-34.6490871, -58.3457883],
            },
          },
        },
      });
    });
  });
});
