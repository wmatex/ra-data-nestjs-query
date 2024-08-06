import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import merge from 'lodash/merge';
import buildDataProvider, {
  BuildQueryFactory,
  Options,
  defaultOptions as baseDefaultOptions,
} from 'ra-data-graphql';
import {
  CREATE,
  DELETE,
  DELETE_MANY,
  DataProvider,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  Identifier,
  UPDATE,
  UPDATE_MANY,
} from 'ra-core';
import pluralize from 'pluralize';

import defaultBuildQuery from './buildQuery';
import { IntrospectionObjectType } from 'graphql';

export const buildQuery = defaultBuildQuery;
export { buildQueryFactory } from './buildQuery';
export { default as buildGqlQuery } from './buildGqlQuery';
export { default as buildVariables } from './buildVariables';
export { default as getResponseParser } from './getResponseParser';

const defaultOptions: Options = {
  ...baseDefaultOptions,
  introspection: {
    ...baseDefaultOptions.introspection,
    operationNames: {
      ...baseDefaultOptions.introspection.operationNames,
      [GET_LIST]: (resource: IntrospectionObjectType) =>
        camelCase(pluralize(resource.name)),
      [GET_ONE]: (resource: IntrospectionObjectType) =>
        camelCase(resource.name),
      [GET_MANY]: (resource: IntrospectionObjectType) =>
        camelCase(pluralize(resource.name)),
      [GET_MANY_REFERENCE]: (resource: IntrospectionObjectType) =>
        camelCase(pluralize(resource.name)),
      [CREATE]: (resource: IntrospectionObjectType) =>
        `createOne${upperFirst(camelCase(resource.name))}`,
      [UPDATE]: (resource: IntrospectionObjectType) =>
        `updateOne${upperFirst(camelCase(resource.name))}`,
      [DELETE]: (resource: IntrospectionObjectType) =>
        `deleteOne${upperFirst(camelCase(resource.name))}`,
    },
  },
  buildQuery: defaultBuildQuery,
};

const bulkActionOperationNames = {
  [DELETE_MANY]: (resource: IntrospectionObjectType) =>
    `deleteMany${upperFirst(camelCase(pluralize(resource.name)))}`,
  [UPDATE_MANY]: (resource: IntrospectionObjectType) =>
    `updateMany${upperFirst(camelCase(pluralize(resource.name)))}`,
};

export default (
  options: Omit<Options, 'buildQuery'> & {
    buildQuery?: BuildQueryFactory;
    bulkActionsEnabled?: boolean;
  },
): DataProvider => {
  const { bulkActionsEnabled = false, ...dPOptions } = merge(
    {},
    defaultOptions,
    options,
  );

  if (
    bulkActionsEnabled &&
    dPOptions.introspection &&
    dPOptions.introspection.operationNames
  )
    dPOptions.introspection.operationNames = merge(
      dPOptions.introspection.operationNames,
      bulkActionOperationNames,
    );

  const defaultDataProvider = buildDataProvider(dPOptions);
  return {
    ...defaultDataProvider,
    // This provider defaults to sending multiple DELETE requests for DELETE_MANY
    // and multiple UPDATE requests for UPDATE_MANY unless bulk actions are enabled
    // This can be optimized using the apollo-link-batch-http link
    ...(bulkActionsEnabled
      ? {}
      : {
          deleteMany: (resource, params) => {
            const { ids, ...otherParams } = params;
            return Promise.all(
              ids.map((id) =>
                defaultDataProvider.delete(resource, {
                  id,
                  previousData: null,
                  ...otherParams,
                }),
              ),
            ).then((results) => {
              const data = results.reduce<Identifier[]>(
                (acc, { data }) => [...acc, data.id],
                [],
              );

              return { data };
            });
          },
          updateMany: (resource, params) => {
            const { ids, data, ...otherParams } = params;
            return Promise.all(
              ids.map((id) =>
                defaultDataProvider.update(resource, {
                  id,
                  data: data,
                  previousData: null,
                  ...otherParams,
                }),
              ),
            ).then((results) => {
              const data = results.reduce<Identifier[]>(
                (acc, { data }) => [...acc, data.id],
                [],
              );

              return { data };
            });
          },
        }),
  };
};
