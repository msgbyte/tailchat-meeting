/**
 * 返回属性类型为boolean的字段名
 *
 * Reference: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#conditional-types
 */
export type PickBooleanPropertyNames<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];
