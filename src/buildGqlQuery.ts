import {
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  DELETE,
  DELETE_MANY,
  UPDATE_MANY,
} from 'ra-core';
import {
  QUERY_TYPES,
  IntrospectionResult,
  IntrospectedResource,
} from 'ra-data-graphql';
import {
  ArgumentNode,
  IntrospectionField,
  IntrospectionNamedTypeRef,
  IntrospectionObjectType,
  IntrospectionUnionType,
  TypeKind,
  VariableDefinitionNode,
} from 'graphql';
import * as t from 'graphql-ast-types';

import getFinalType from './getFinalType';
import { getGqlType } from './getGqlType';

type SparseField = string | { [k: string]: SparseField[] };
type ExpandedSparseField = { linkedType?: string; fields: SparseField[] };
type ProcessedFields = {
  resourceFields: IntrospectionField[];
  linkedSparseFields: ExpandedSparseField[];
};

function processSparseFields(
  resourceFields: readonly IntrospectionField[],
  sparseFields: SparseField[],
): ProcessedFields & { resourceFields: readonly IntrospectionField[] } {
  if (!sparseFields || sparseFields.length === 0)
    throw new Error(
      "Empty sparse fields. Specify at least one field or remove the 'sparseFields' param",
    );

  const permittedSparseFields: ProcessedFields = sparseFields.reduce(
    (permitted: ProcessedFields, sparseField: SparseField) => {
      let expandedSparseField: ExpandedSparseField;
      if (typeof sparseField == 'string')
        expandedSparseField = { fields: [sparseField] };
      else {
        const [linkedType, linkedSparseFields] = Object.entries(sparseField)[0];
        expandedSparseField = {
          linkedType,
          fields: linkedSparseFields,
        };
      }

      const availableField = resourceFields.find(
        (resourceField) =>
          resourceField.name ===
          (expandedSparseField.linkedType || expandedSparseField.fields[0]),
      );

      if (availableField && expandedSparseField.linkedType) {
        permitted.linkedSparseFields.push(expandedSparseField);
        permitted.resourceFields.push(availableField);
      } else if (availableField) permitted.resourceFields.push(availableField);

      return permitted;
    },
    { resourceFields: [], linkedSparseFields: [] },
  ); // ensure the requested fields are available

  if (
    permittedSparseFields.resourceFields.length === 0 &&
    permittedSparseFields.linkedSparseFields.length === 0
  )
    throw new Error(
      "Requested sparse fields not found. Ensure sparse fields are available in the resource's type",
    );

  return permittedSparseFields;
}

export default (introspectionResults: IntrospectionResult) =>
  (
    resource: IntrospectedResource,
    raFetchMethod: string,
    queryType: IntrospectionField,
    variables: any,
  ) => {
    let { sortField, sortOrder, ...metaVariables } = variables;

    const apolloArgs = buildApolloArgs(queryType, variables);
    const args = buildArgs(queryType, variables);

    const sparseFields = metaVariables.meta?.sparseFields;
    if (sparseFields) delete metaVariables.meta.sparseFields;

    const fields = buildFields(introspectionResults)(
      resource.type.fields,
      sparseFields,
    );

    if (
      raFetchMethod === GET_LIST ||
      raFetchMethod === GET_MANY ||
      raFetchMethod === GET_MANY_REFERENCE
    ) {
      return t.document([
        t.operationDefinition(
          'query',
          t.selectionSet([
            t.field(
              t.name(queryType.name),
              t.name('data'),
              args,
              null,
              t.selectionSet([
                t.field(
                  t.name('nodes'),
                  null,
                  null,
                  null,
                  t.selectionSet(fields),
                ),
                t.field(
                  t.name('pageInfo'),
                  null,
                  null,
                  null,
                  t.selectionSet([
                    t.field(t.name('hasNextPage')),
                    t.field(t.name('hasPreviousPage')),
                  ]),
                ),
                t.field(t.name('totalCount')),
              ]),
            ),
          ]),
          t.name(queryType.name),
          apolloArgs,
        ),
      ]);
    }

    if (raFetchMethod === DELETE) {
      return t.document([
        t.operationDefinition(
          'mutation',
          t.selectionSet([
            t.field(
              t.name(queryType.name),
              t.name('data'),
              args,
              null,
              t.selectionSet(fields),
            ),
          ]),
          t.name(queryType.name),
          apolloArgs,
        ),
      ]);
    }

    if (raFetchMethod === DELETE_MANY || raFetchMethod === UPDATE_MANY) {
      const countFieldName =
        raFetchMethod === DELETE_MANY ? 'deletedCount' : 'updatedCount';
      return t.document([
        t.operationDefinition(
          'mutation',
          t.selectionSet([
            t.field(
              t.name(queryType.name),
              t.name('data'),
              args,
              null,
              t.selectionSet([t.field(t.name(countFieldName))]),
            ),
          ]),
          t.name(queryType.name),
          apolloArgs,
        ),
      ]);
    }

    return t.document([
      t.operationDefinition(
        QUERY_TYPES.includes(raFetchMethod) ? 'query' : 'mutation',
        t.selectionSet([
          t.field(
            t.name(queryType.name),
            t.name('data'),
            args,
            null,
            t.selectionSet(fields),
          ),
        ]),
        t.name(queryType.name),
        apolloArgs,
      ),
    ]);
  };

export const buildFields =
  (introspectionResults: IntrospectionResult, paths = []) =>
  (fields: readonly IntrospectionField[], sparseFields?: SparseField[]) => {
    const { resourceFields, linkedSparseFields } = sparseFields
      ? processSparseFields(fields, sparseFields)
      : { resourceFields: fields, linkedSparseFields: [] };

    return resourceFields.reduce((acc, field) => {
      const type = getFinalType(field.type);

      if (type.name.startsWith('_')) {
        return acc;
      }

      if (type.kind !== TypeKind.OBJECT && type.kind !== TypeKind.INTERFACE) {
        return [...acc, t.field(t.name(field.name))];
      }

      const linkedResource = introspectionResults.resources.find(
        (r) => r.type.name === type.name,
      );

      if (linkedResource) {
        const linkedResourceSparseFields = linkedSparseFields.find(
          (lSP) => lSP.linkedType === field.name,
        )?.fields || ['id']; // default to id if no sparse fields specified for linked resource

        const linkedResourceFields = buildFields(introspectionResults)(
          linkedResource.type.fields,
          linkedResourceSparseFields,
        );

        return [
          ...acc,
          t.field(
            t.name(field.name),
            null,
            null,
            null,
            t.selectionSet(linkedResourceFields),
          ),
        ];
      }

      const linkedType = introspectionResults.types.find(
        (t) => t.name === type.name,
      );

      if (linkedType && !paths.includes(linkedType.name)) {
        const possibleTypes =
          (linkedType as IntrospectionUnionType).possibleTypes || [];

        return [
          ...acc,
          t.field(
            t.name(field.name),
            null,
            null,
            null,
            t.selectionSet([
              ...buildFragments(introspectionResults)(possibleTypes),
              ...buildFields(introspectionResults, [...paths, linkedType.name])(
                (linkedType as IntrospectionObjectType).fields,
                linkedSparseFields.find((lSP) => lSP.linkedType === field.name)
                  ?.fields,
              ),
            ]),
          ),
        ];
      }

      // NOTE: We might have to handle linked types which are not resources but will have to be careful about
      // ending with endless circular dependencies
      return acc;
    }, []);
  };

export const buildFragments =
  (introspectionResults: IntrospectionResult) =>
  (
    possibleTypes: readonly IntrospectionNamedTypeRef<IntrospectionObjectType>[],
  ) =>
    possibleTypes.reduce((acc, possibleType) => {
      const type = getFinalType(possibleType);

      const linkedType = introspectionResults.types.find(
        (t) => t.name === type.name,
      );

      return [
        ...acc,
        t.inlineFragment(
          t.selectionSet(
            buildFields(introspectionResults)(
              (linkedType as IntrospectionObjectType).fields,
            ),
          ),
          t.namedType(t.name(type.name)),
        ),
      ];
    }, []);

export const buildArgs = (
  query: IntrospectionField,
  variables: any,
): ArgumentNode[] => {
  if (query.args.length === 0) {
    return [];
  }

  const validVariables = Object.keys(variables).filter(
    (k) => typeof variables[k] !== 'undefined',
  );
  let args = query.args
    .filter((a) => validVariables.includes(a.name))
    .reduce(
      (acc, arg) => [
        ...acc,
        t.argument(t.name(arg.name), t.variable(t.name(arg.name))),
      ],
      [],
    );

  return args;
};

export const buildApolloArgs = (
  query: IntrospectionField,
  variables: any,
): VariableDefinitionNode[] => {
  if (query.args.length === 0) {
    return [];
  }

  const validVariables = Object.keys(variables).filter(
    (k) => typeof variables[k] !== 'undefined',
  );

  let args = query.args
    .filter((a) => validVariables.includes(a.name))
    .reduce((acc, arg) => {
      return [
        ...acc,
        t.variableDefinition(
          t.variable(t.name(arg.name)),
          getGqlType(arg.type),
        ),
      ];
    }, []);

  return args;
};
