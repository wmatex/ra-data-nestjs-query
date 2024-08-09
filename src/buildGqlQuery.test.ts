import {
  IntrospectionField,
  IntrospectionSchema,
  TypeKind,
  print,
} from 'graphql';
import { gql } from '@apollo/client';
import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  // GET_MANY_REFERENCE,
  UPDATE,
  CREATE,
  DELETE,
  DELETE_MANY,
  UPDATE_MANY,
} from 'ra-core';

import buildGqlQuery, {
  buildApolloArgs,
  buildArgs,
  buildFields,
} from './buildGqlQuery';
import { IntrospectionResult } from 'ra-data-graphql';

describe(buildArgs.name, () => {
  it('returns an empty array when query does not have any arguments', () => {
    expect(buildArgs({ args: [] }, {})).toEqual([]);
  });

  it('returns an array of args correctly filtered when query has arguments', () => {
    expect(
      print(
        buildArgs(
          {
            args: [{ name: 'foo' }, { name: 'bar' }],
          } as unknown as IntrospectionField,
          { foo: 'foo_value' },
        ) as any,
      ),
    ).toEqual(['foo: $foo']);
  });
});

describe(buildApolloArgs.name, () => {
  it('returns an empty array when query does not have any arguments', () => {
    expect(print(buildApolloArgs({ args: [] }, {}))).toEqual([]);
  });

  it('returns an array of args correctly filtered when query has arguments', () => {
    expect(
      print(
        buildApolloArgs(
          {
            args: [
              {
                name: 'foo',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.SCALAR,
                    name: 'Int',
                  },
                },
              },
              {
                name: 'barId',
                type: { kind: TypeKind.SCALAR, name: 'ID' },
              },
              {
                name: 'barIds',
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
              },
              { name: 'bar' },
            ],
          },
          { foo: 'foo_value', barId: 100, barIds: [101, 102] },
        ),
      ),
    ).toEqual(['$foo: Int!', '$barId: ID', '$barIds: [ID!]']);
  });
});

describe(buildFields.name, () => {
  it('returns an object with the fields to retrieve', () => {
    const introspectionResults: IntrospectionResult = {
      resources: [
        {
          type: {
            name: 'resourceType',
            fields: [
              {
                name: 'id',
                type: { kind: TypeKind.SCALAR, name: 'ID' },
              },
            ],
          },
        },
      ],
      types: [
        {
          name: 'linkedType',
          fields: [
            {
              name: 'id',
              type: { kind: TypeKind.SCALAR, name: 'ID' },
            },
          ],
        },
      ],
    };

    const fields: IntrospectionField[] = [
      { type: { kind: TypeKind.SCALAR, name: 'ID' }, name: 'id' },
      {
        type: { kind: TypeKind.SCALAR, name: '_internalField' },
        name: 'foo1',
      },
      {
        type: { kind: TypeKind.OBJECT, name: 'linkedType' },
        name: 'linked',
      },
      {
        type: { kind: TypeKind.OBJECT, name: 'resourceType' },
        name: 'resource',
      },
    ];

    expect(print(buildFields(introspectionResults)(fields))).toEqual([
      'id',
      `linked {
  id
}`,
      `resource {
  id
}`,
    ]);
  });
});

describe('buildFieldsWithCircularDependency', () => {
  it('returns an object with the fields to retrieve', () => {
    const introspectionResults = {
      resources: [
        {
          type: {
            name: 'resourceType',
            fields: [
              {
                name: 'id',
                type: { kind: TypeKind.SCALAR, name: 'ID' },
              },
            ],
          },
        },
      ],
      types: [
        {
          name: 'linkedType',
          fields: [
            {
              name: 'id',
              type: { kind: TypeKind.SCALAR, name: 'ID' },
            },
            {
              name: 'child',
              type: { kind: TypeKind.OBJECT, name: 'linkedType' },
            },
          ],
        },
      ],
    };

    const fields = [
      { type: { kind: TypeKind.SCALAR, name: 'ID' }, name: 'id' },
      {
        type: { kind: TypeKind.SCALAR, name: '_internalField' },
        name: 'foo1',
      },
      {
        type: { kind: TypeKind.OBJECT, name: 'linkedType' },
        name: 'linked',
      },
      {
        type: { kind: TypeKind.OBJECT, name: 'resourceType' },
        name: 'resource',
      },
    ];

    expect(print(buildFields(introspectionResults)(fields))).toEqual([
      'id',
      `linked {
  id
}`,
      `resource {
  id
}`,
    ]);
  });
});

describe('buildFieldsWithSameType', () => {
  it('returns an object with the fields to retrieve', () => {
    const introspectionResults: IntrospectionResult = {
      resources: [
        {
          type: {
            name: 'resourceType',
            fields: [
              {
                name: 'id',
                type: { kind: TypeKind.SCALAR, name: 'ID' },
              },
            ],
          },
        },
      ],
      types: [
        {
          name: 'linkedType',
          fields: [
            {
              name: 'id',
              type: { kind: TypeKind.SCALAR, name: 'ID' },
            },
          ],
        },
      ],
    };

    const fields: IntrospectionField[] = [
      { type: { kind: TypeKind.SCALAR, name: 'ID' }, name: 'id' },
      {
        type: { kind: TypeKind.SCALAR, name: '_internalField' },
        name: 'foo1',
      },
      {
        type: { kind: TypeKind.OBJECT, name: 'linkedType' },
        name: 'linked',
      },
      {
        type: { kind: TypeKind.OBJECT, name: 'linkedType' },
        name: 'anotherLinked',
      },
      {
        type: { kind: TypeKind.OBJECT, name: 'resourceType' },
        name: 'resource',
      },
    ];

    expect(print(buildFields(introspectionResults)(fields))).toEqual([
      'id',
      `linked {
  id
}`,
      `anotherLinked {
  id
}`,
      `resource {
  id
}`,
    ]);
  });
});

describe(buildGqlQuery.name, () => {
  const introspectionResults: IntrospectionResult = {
    queries: [],
    schema: {} as IntrospectionSchema,
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
              name: 'address',
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
              description: null,
              args: [],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: 'SCALAR',
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
              description: null,
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
    ],
    types: [
      {
        kind: TypeKind.OBJECT,
        name: 'Point',
        fields: [
          {
            name: 'type',
            type: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.SCALAR,
                name: 'String',
              },
            },
            args: [],
            isDeprecated: false,
            deprecationReason: null,
          },
          {
            name: 'coordinates',
            description: '[lon, lat]',
            args: [],
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
            isDeprecated: false,
            deprecationReason: null,
          },
        ],
        interfaces: [],
      },
    ],
  };

  const resource = introspectionResults.resources[0];

  const queryType: IntrospectionField = {
    name: 'clubs',
    args: [
      {
        name: 'paging',
        type: {
          kind: TypeKind.NON_NULL,
          ofType: {
            kind: TypeKind.INPUT_OBJECT,
            name: 'OffsetPaging',
          },
        },
        defaultValue: null,
      },
      {
        name: 'filter',
        type: {
          kind: TypeKind.NON_NULL,
          ofType: {
            kind: TypeKind.INPUT_OBJECT,
            name: 'ClubFilter',
          },
        },
        defaultValue: null,
      },
      {
        name: 'sorting',
        type: {
          kind: TypeKind.NON_NULL,
          ofType: {
            kind: 'LIST',
            ofType: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: 'INPUT_OBJECT',
                name: 'ClubSort',
              },
            },
          },
        },
        defaultValue: null,
      },
    ],
    type: {
      kind: TypeKind.NON_NULL,
      ofType: {
        kind: 'OBJECT',
        name: 'ClubConnection',
      },
    },
    isDeprecated: false,
    deprecationReason: null,
  };

  const queryTypeDeleteMany: IntrospectionField = {
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
        kind: 'OBJECT',
        name: 'DeleteManyResponse',
      },
    },
    isDeprecated: false,
    deprecationReason: null,
  };

  const queryTypeUpdateMany: IntrospectionField = {
    name: 'updateManyClubs',
    args: [
      {
        name: 'input',
        description: null,
        type: {
          kind: TypeKind.NON_NULL,
          ofType: {
            kind: 'INPUT_OBJECT',
            name: 'UpdateManyClubsInput',
          },
        },
        defaultValue: null,
      },
    ],
    type: {
      kind: TypeKind.NON_NULL,
      ofType: {
        kind: 'OBJECT',
        name: 'UpdateManyResponse',
      },
    },
    isDeprecated: false,
    deprecationReason: null,
  };

  const params = { foo: 'foo_value' };

  describe(GET_LIST, () => {
    it('returns the correct query', () => {
      expect(
        print(
          buildGqlQuery(introspectionResults)(resource, GET_LIST, queryType, {
            filter: {},
            paging: {},
            sorting: {},
          }),
        ),
      ).toEqual(
        print(gql`
          query clubs(
            $paging: OffsetPaging!
            $filter: ClubFilter!
            $sorting: [ClubSort!]!
          ) {
            data: clubs(paging: $paging, filter: $filter, sorting: $sorting) {
              nodes {
                id
                name
                address
                location {
                  type
                  coordinates
                }
                createdAt
                createdBy
                updatedAt
                updatedBy
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
              totalCount
            }
          }
        `),
      );
    });
  });
  describe(GET_MANY, () => {
    it('returns the correct query', () => {
      expect(
        print(
          buildGqlQuery(introspectionResults)(resource, GET_MANY, queryType, {
            filter: {},
            paging: {},
            sorting: {},
          }),
        ),
      ).toEqual(
        print(gql`
          query clubs(
            $paging: OffsetPaging!
            $filter: ClubFilter!
            $sorting: [ClubSort!]!
          ) {
            data: clubs(paging: $paging, filter: $filter, sorting: $sorting) {
              nodes {
                id
                name
                address
                location {
                  type
                  coordinates
                }
                createdAt
                createdBy
                updatedAt
                updatedBy
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
              totalCount
            }
          }
        `),
      );
    });
  });

  // describe('GET_MANY_REFERENCE', () => {
  //   it('returns the correct query', () => {
  //     expect(
  //       print(
  //         buildGqlQuery(introspectionResults)(
  //           resource,
  //           GET_MANY_REFERENCE,
  //           queryType,
  //           params,
  //         ),
  //       ),
  //     ).toEqual(
  //       print(gql`
  //         query allCommand($foo: Int!) {
  //           items: allCommand(foo: $foo) {
  //             foo
  //             linked {
  //               foo
  //             }
  //             resource {
  //               id
  //             }
  //           }
  //           total: _allCommandMeta(foo: $foo) {
  //             count
  //           }
  //         }
  //       `),
  //     );
  //   });
  // });
  describe(GET_ONE, () => {
    it('returns the correct query', () => {
      expect(
        print(
          buildGqlQuery(introspectionResults)(
            resource,
            GET_ONE,
            {
              name: 'club',
              args: [
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
            },
            { id: 'cc76f014-7dc7-4cc3-bb5b-a7222b9b727f' },
          ),
        ),
      ).toEqual(
        print(gql`
          query club($id: ID!) {
            data: club(id: $id) {
              id
              name
              address
              location {
                type
                coordinates
              }
              createdAt
              createdBy
              updatedAt
              updatedBy
            }
          }
        `),
      );
    });
  });
  describe(UPDATE, () => {
    it('returns the correct query', () => {
      expect(
        print(
          buildGqlQuery(introspectionResults)(
            resource,
            UPDATE,
            {
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
            },
            {
              input: {
                id: '53b2e780-6a32-4554-a1e3-ca0913e96d1a',
                update: { name: 'pipipi' },
              },
            },
          ),
        ),
      ).toEqual(
        print(gql`
          mutation updateOneClub($input: UpdateOneClubInput!) {
            data: updateOneClub(input: $input) {
              id
              name
              address
              location {
                type
                coordinates
              }
              createdAt
              createdBy
              updatedAt
              updatedBy
            }
          }
        `),
      );
    });
  });
  describe(CREATE, () => {
    it('returns the correct query', () => {
      expect(
        print(
          buildGqlQuery(introspectionResults)(
            resource,
            CREATE,
            {
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
            },
            {
              input: { club: { name: 'pipipi' } },
            },
          ),
        ),
      ).toEqual(
        print(gql`
          mutation createOneClub($input: CreateOneClubInput!) {
            data: createOneClub(input: $input) {
              id
              name
              address
              location {
                type
                coordinates
              }
              createdAt
              createdBy
              updatedAt
              updatedBy
            }
          }
        `),
      );
    });
  });
  describe(DELETE, () => {
    it('returns the correct query', () => {
      expect(
        print(
          buildGqlQuery(introspectionResults)(
            resource,
            DELETE,
            {
              name: 'deleteOneClub',
              args: [
                {
                  name: 'input',
                  type: {
                    kind: TypeKind.NON_NULL,
                    ofType: {
                      kind: TypeKind.INPUT_OBJECT,
                      name: 'DeleteOneClubInput',
                    },
                  },
                  defaultValue: null,
                },
              ],
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.OBJECT,
                  name: 'ClubDeleteResponse',
                },
              },
              isDeprecated: false,
              deprecationReason: null,
            },
            { input: { id: '01f5b50b-f526-4d8c-8480-d001b2a3bb76' } },
          ),
        ),
      ).toEqual(
        print(gql`
          mutation deleteOneClub($input: DeleteOneClubInput!) {
            data: deleteOneClub(input: $input) {
              id
              name
              address
              location {
                type
                coordinates
              }
              createdAt
              createdBy
              updatedAt
              updatedBy
            }
          }
        `),
      );
    });
  });

  it(DELETE_MANY, () => {
    expect(
      print(
        buildGqlQuery(introspectionResults)(
          resource,
          DELETE_MANY,
          queryTypeDeleteMany,
          { input: { filter: { id: { in: [1, 2, 3] } } } },
        ),
      ),
    ).toEqual(
      print(gql`
        mutation deleteManyClubs($input: DeleteManyClubsInput!) {
          data: deleteManyClubs(input: $input) {
            deletedCount
          }
        }
      `),
    );
  });

  it(UPDATE_MANY, () => {
    expect(
      print(
        buildGqlQuery(introspectionResults)(
          resource,
          UPDATE_MANY,
          queryTypeUpdateMany,
          {
            input: {
              filter: { id: { in: [1, 2, 3] } },
              update: params,
            },
          },
        ),
      ),
    ).toEqual(
      print(gql`
        mutation updateManyClubs($input: UpdateManyClubsInput!) {
          data: updateManyClubs(input: $input) {
            updatedCount
          }
        }
      `),
    );
  });
});
