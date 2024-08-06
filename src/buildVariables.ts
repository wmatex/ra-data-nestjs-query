/* eslint-disable default-case */
import {
  IntrospectionField,
  IntrospectionInputObjectType,
  IntrospectionNamedTypeRef,
  IntrospectionNonNullTypeRef,
  IntrospectionType,
} from 'graphql';
import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  // GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
  DELETE_MANY,
  UPDATE_MANY,
} from 'ra-core';
import { IntrospectionResult, IntrospectedResource } from 'ra-data-graphql';

import getFinalType from './getFinalType';
import isList from './isList';
import {
  MutationCreateOneArgs,
  MutationDeleteManyArgs,
  MutationUpdateManyArgs,
  MutationUpdateOneArgs,
  QueryArgs,
} from './types';
import camelCase from 'lodash/camelCase';

export default (introspectionResults: IntrospectionResult) =>
  (
    resource: IntrospectedResource,
    raFetchMethod: string,
    params: any,
    queryType: IntrospectionField,
  ) => {
    const preparedParams = prepareParams(
      params,
      queryType,
      introspectionResults,
    );

    switch (raFetchMethod) {
      case GET_LIST:
        return getListVariables(resource, raFetchMethod, preparedParams);
      case GET_MANY:
        return {
          filter: { id: { in: preparedParams.ids } },
        };
      // case GET_MANY_REFERENCE: {
      //   let variables = buildGetListVariables(introspectionResults)(
      //     resource,
      //     raFetchMethod,
      //     preparedParams,
      //   );

      //   variables.filter = {
      //     ...variables.filter,
      //     [preparedParams.target]: { eq: preparedParams.id },
      //   };

      //   return variables;
      // }
      case GET_ONE:
      case DELETE:
        return {
          id: preparedParams.id,
        };
      case DELETE_MANY:
        return buildDeleteManyVariables(
          resource,
          raFetchMethod,
          preparedParams,
        );
      case CREATE:
        return buildCreateVariables(resource, raFetchMethod, preparedParams);
      case UPDATE:
        return buildUpdateVariables(resource, raFetchMethod, preparedParams);
      case UPDATE_MANY: {
        return buildUpdateManyVariables(
          resource,
          raFetchMethod,
          preparedParams,
        );
      }
    }
  };

const sanitizeValue = (type: IntrospectionType, value: any) => {
  if (type.name === 'Int') {
    return parseInt(value, 10);
  }

  if (type.name === 'Float') {
    return parseFloat(value);
  }

  return value;
};

const castType = (
  value: any,
  type: IntrospectionType | IntrospectionNonNullTypeRef,
) => {
  const realType = type.kind === 'NON_NULL' ? type.ofType : type;
  switch (`${realType.kind}:${(realType as IntrospectionNamedTypeRef).name}`) {
    case 'SCALAR:Int':
      return Number(value);

    case 'SCALAR:String':
      return String(value);

    case 'SCALAR:Boolean':
      return Boolean(value);

    default:
      return value;
  }
};

const prepareParams = (
  params: any,
  queryType: Partial<IntrospectionField>,
  introspectionResults: IntrospectionResult,
) => {
  const result = {};

  if (!params) {
    return params;
  }

  Object.keys(params).forEach((key) => {
    const param = params[key];
    let arg = null;

    if (!param) {
      result[key] = param;
      return;
    }

    if (queryType && Array.isArray(queryType.args)) {
      arg = queryType.args.find((item) => item.name === key);
    }

    if (param instanceof File) {
      result[key] = param;
      return;
    }

    if (param instanceof Date) {
      result[key] = param.toISOString();
      return;
    }

    if (
      param instanceof Object &&
      !Array.isArray(param) &&
      arg &&
      arg.type.kind === 'INPUT_OBJECT'
    ) {
      const args = (
        introspectionResults.types.find(
          (item) => item.kind === arg.type.kind && item.name === arg.type.name,
        ) as IntrospectionInputObjectType
      ).inputFields;
      result[key] = prepareParams(param, { args }, introspectionResults);
      return;
    }

    if (
      param instanceof Object &&
      !(param instanceof Date) &&
      !Array.isArray(param)
    ) {
      result[key] = prepareParams(param, queryType, introspectionResults);
      return;
    }

    if (!arg) {
      result[key] = param;
      return;
    }

    result[key] = castType(param, arg.type);
  });

  return result;
};

const getListVariables = (
  resource: IntrospectedResource,
  raFetchMethod: string,
  params: any,
): QueryArgs => {
  let variables: QueryArgs = { filter: {} };
  if (params.filter) {
    variables.filter = Object.keys(params.filter).reduce((acc, key) => {
      if (key === 'ids') {
        return { ...acc, id: { in: params.filter[key] } };
      }

      const resourceField = resource.type.fields.find((f) => f.name === key);

      if (resourceField) {
        const type = getFinalType(resourceField.type);
        const isAList = isList(resourceField.type);

        if (isAList) {
          return {
            ...acc,
            [key]: Array.isArray(params.filter[key])
              ? params.filter[key].map((value) => sanitizeValue(type, value))
              : sanitizeValue(type, [params.filter[key]]),
          };
        }

        const operator =
          `${type.kind}:${type.name}` === 'SCALAR:String' ? 'like' : 'eq';

        return {
          ...acc,
          [key]: { [operator]: sanitizeValue(type, params.filter[key]) },
        };
      }

      return { ...acc, [key]: { eq: params.filter[key] } };
    }, {});
  }

  if (params.pagination) {
    const perPage = parseInt(params.pagination.perPage, 10);
    variables.paging = {
      limit: parseInt(params.pagination.perPage, 10),
      offset: (parseInt(params.pagination.page, 10) - 1) * perPage,
    };
  }

  if (params.sort) {
    variables.sorting = [
      { field: params.sort.field, direction: params.sort.order },
    ];
  }

  return variables;
};

const buildCreateVariables = (
  resource: IntrospectedResource,
  raFetchMethod,
  { data }: any,
): MutationCreateOneArgs => ({
  input: {
    [camelCase(resource.type.name)]: data,
  },
});

const buildUpdateVariables = (
  resource: IntrospectedResource,
  raFetchMethod,
  { id, data }: any,
): MutationUpdateOneArgs => ({
  input: {
    id,
    update: data,
  },
});

const buildUpdateManyVariables = (
  resource: IntrospectedResource,
  raFetchMethod,
  { ids, data }: any,
): MutationUpdateManyArgs => ({
  input: {
    filter: {
      id: { in: ids },
    },
    update: data,
  },
});

const buildDeleteManyVariables = (
  resource: IntrospectedResource,
  raFetchMethod,
  { ids }: any,
): MutationDeleteManyArgs => ({
  input: {
    filter: {
      id: { in: ids },
    },
  },
});
