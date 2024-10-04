import { IntrospectionField, TypeKind, print } from 'graphql';
import { gql } from '@apollo/client';
import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  UPDATE,
  CREATE,
  DELETE,
  DELETE_MANY,
  UPDATE_MANY,
} from 'ra-core';
import { IntrospectionResult } from 'ra-data-graphql';
import buildGqlQuery, {
  buildApolloArgs,
  buildArgs,
  buildFields,
} from './buildGqlQuery';
import { introspectionResult } from './test-introspection';

const getResourceByName = (name: string) =>
  introspectionResult.resources.find((resource) => resource.type.name === name);

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
  const resource = getResourceByName('Club');

  describe(GET_LIST, () => {
    it('returns the correct query', () => {
      expect(
        print(
          buildGqlQuery(introspectionResult)(
            resource,
            GET_LIST,
            resource[GET_LIST],
            {
              filter: {},
              paging: {},
              sorting: {},
            },
          ),
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
                phoneNumbers
                emails
                active
                amenities
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

    it('returns the correct query with sparse fieldset', () => {
      expect(
        print(
          buildGqlQuery(introspectionResult)(
            resource,
            GET_LIST,
            resource[GET_LIST],
            {
              filter: {},
              paging: {},
              sorting: {},
              meta: {
                sparseFields: ['id', 'name', 'location'],
              },
            },
          ),
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
                location {
                  type
                  coordinates
                }
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
          buildGqlQuery(introspectionResult)(
            resource,
            GET_MANY,
            resource[GET_MANY],
            {
              filter: {},
              paging: {},
              sorting: {},
            },
          ),
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
                phoneNumbers
                emails
                active
                amenities
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

    it('returns the correct query with sparse fieldset', () => {
      expect(
        print(
          buildGqlQuery(introspectionResult)(
            resource,
            GET_MANY,
            resource[GET_MANY],
            {
              filter: {},
              paging: {},
              sorting: {},
              meta: {
                sparseFields: ['id', 'name', 'location'],
              },
            },
          ),
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
                location {
                  type
                  coordinates
                }
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

  describe(GET_MANY_REFERENCE, () => {
    it('returns the correct query', () => {
      expect(
        print(
          buildGqlQuery(introspectionResult)(
            resource,
            GET_MANY_REFERENCE,
            resource[GET_MANY_REFERENCE],
            {
              filter: {},
              paging: {},
              sorting: {},
            },
          ),
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
                phoneNumbers
                emails
                active
                amenities
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

    it('returns the correct query with sparse fieldset', () => {
      expect(
        print(
          buildGqlQuery(introspectionResult)(
            resource,
            GET_MANY_REFERENCE,
            resource[GET_MANY_REFERENCE],
            {
              filter: {},
              paging: {},
              sorting: {},
              meta: {
                sparseFields: ['id', 'name', 'location'],
              },
            },
          ),
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
                location {
                  type
                  coordinates
                }
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

  describe(GET_ONE, () => {
    it('returns the correct query', () => {
      expect(
        print(
          buildGqlQuery(introspectionResult)(
            resource,
            GET_ONE,
            resource[GET_ONE],
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
              phoneNumbers
              emails
              active
              amenities
              createdAt
              createdBy
              updatedAt
              updatedBy
            }
          }
        `),
      );
    });

    it('returns the correct query with sparse fieldset', () => {
      expect(
        print(
          buildGqlQuery(introspectionResult)(
            resource,
            GET_ONE,
            resource[GET_ONE],
            {
              id: 'cc76f014-7dc7-4cc3-bb5b-a7222b9b727f',
              meta: {
                sparseFields: ['id', 'name', 'location'],
              },
            },
          ),
        ),
      ).toEqual(
        print(gql`
          query club($id: ID!) {
            data: club(id: $id) {
              id
              name
              location {
                type
                coordinates
              }
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
          buildGqlQuery(introspectionResult)(
            resource,
            UPDATE,
            resource[UPDATE],
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
              phoneNumbers
              emails
              active
              amenities
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
          buildGqlQuery(introspectionResult)(
            resource,
            CREATE,
            resource[CREATE],
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
              phoneNumbers
              emails
              active
              amenities
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
          buildGqlQuery(introspectionResult)(
            resource,
            DELETE,
            resource[DELETE],
            { input: { id: '01f5b50b-f526-4d8c-8480-d001b2a3bb76' } },
          ),
        ),
      ).toEqual(
        print(gql`
          mutation deleteOneClub($input: DeleteOneClubInput!) {
            data: deleteOneClub(input: $input) {
              id
            }
          }
        `),
      );
    });
  });

  it(DELETE_MANY, () => {
    expect(
      print(
        buildGqlQuery(introspectionResult)(
          resource,
          DELETE_MANY,
          resource[DELETE_MANY],
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
        buildGqlQuery(introspectionResult)(
          resource,
          UPDATE_MANY,
          resource[UPDATE_MANY],
          {
            input: {
              filter: { id: { in: [1, 2, 3] } },
              update: {},
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
