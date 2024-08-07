import {
  IntrospectionListTypeRef,
  IntrospectionType,
  IntrospectionTypeRef,
  TypeKind,
  TypeNode,
} from 'graphql';
import * as t from 'graphql-ast-types';

export const getGqlType = (
  type: IntrospectionType | IntrospectionListTypeRef | IntrospectionTypeRef,
): TypeNode => {
  switch (type.kind) {
    case TypeKind.LIST:
      return t.listType(getGqlType(type.ofType));

    case TypeKind.NON_NULL:
      return t.nonNullType(getGqlType(type.ofType));

    default:
      return t.namedType(t.name((type as any).name));
  }
};
