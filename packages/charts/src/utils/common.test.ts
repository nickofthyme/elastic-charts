/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RecursivePartial } from './common';
import {
  clamp,
  compareByValueAsc,
  hasPartialObjectToMerge,
  mergePartial,
  getPartialValue,
  getAllKeys,
  shallowClone,
  getColorFromVariant,
  ColorVariant,
  isUniqueArray,
  isDefined,
  isDefinedFrom,
  isBetween,
  clampAll,
  sortNumbers,
  isSorted,
  inRange,
} from './common';

describe('common utilities', () => {
  test('return value bounded above', () => {
    expect(clamp(0, 0, 1)).toBe(0);
    expect(clamp(1, 0, 1)).toBe(1);

    expect(clamp(1.1, 0, 1)).toBe(1);
    expect(clamp(-0.1, 0, 1)).toBe(0);

    expect(clamp(0.1, 0, 1)).toBe(0.1);
    expect(clamp(0.8, 0, 1)).toBe(0.8);
  });

  test('compareByValueAsc', () => {
    expect([2, 1, 4, 3].sort(compareByValueAsc)).toEqual([1, 2, 3, 4]);
    expect(['b', 'a', 'd', 'c'].sort(compareByValueAsc)).toEqual(['a', 'b', 'c', 'd']);
  });

  describe('getPartialValue', () => {
    interface TestType {
      foo: string;
      bar: number;
      test?: TestType;
    }

    const base: TestType = {
      foo: 'elastic',
      bar: 123,
      test: {
        foo: 'shay',
        bar: 321,
      },
    };
    const partial: RecursivePartial<TestType> = {
      foo: 'elastic',
    };

    it('should return partial if it is defined', () => {
      const result = getPartialValue(base, partial);

      expect(result).toBe(partial);
    });

    it('should return base if partial is undefined', () => {
      const result = getPartialValue(base);

      expect(result).toBe(base);
    });

    it('should return extra partials if partial is undefined', () => {
      const result = getPartialValue(base, undefined, [partial]);

      expect(result).toBe(partial);
    });

    it('should return second partial if partial is undefined', () => {
      // @ts-ignore - nesting limitation
      const result = getPartialValue(base, undefined, [undefined, partial]);

      expect(result).toBe(partial);
    });

    it('should return base if no partials are defined', () => {
      // @ts-ignore - nesting limitation
      const result = getPartialValue(base, undefined, [undefined, undefined]);

      expect(result).toBe(base);
    });
  });

  describe('getAllKeys', () => {
    const object1 = {
      key1: 1,
      key2: 2,
    };
    const object2 = {
      key3: 3,
      key4: 4,
    };
    const object3 = {
      key5: 5,
      key6: 6,
    };

    it('should allow undefined object', () => {
      const result = getAllKeys(undefined, [object1]);

      expect(result).toEqual(new Set(['key1', 'key2']));
    });

    it('should return allow undefined objects', () => {
      const result = getAllKeys(undefined, undefined);

      expect(result).toEqual(new Set([]));
    });

    it('should remove duplicates', () => {
      const result = getAllKeys(object1, [object1]);

      expect(result).toEqual(new Set(['key1', 'key2']));
    });

    it('should return all keys from single object', () => {
      const result = getAllKeys(object1);

      expect(result).toEqual(new Set(['key1', 'key2']));
    });

    it('should return all keys from all objects x 2', () => {
      const result = getAllKeys(object1, [object2]);

      expect(result).toEqual(new Set(['key1', 'key2', 'key3', 'key4']));
    });

    it('should return all keys from single objects x 3', () => {
      const result = getAllKeys(object1, [object2, object3]);

      expect(result).toEqual(new Set(['key1', 'key2', 'key3', 'key4', 'key5', 'key6']));
    });

    it('should return all keys from only defined objects', () => {
      const result = getAllKeys(object1, [null, object2, {}, undefined]);

      expect(result).toEqual(new Set(['key1', 'key2', 'key3', 'key4']));
    });
  });

  describe('shallowClone', () => {
    const obj = { value: 'test' };
    const arr = ['test'];

    it('should clone object', () => {
      const result = shallowClone(obj);

      expect(result).toEqual(obj);
      expect(result).not.toBe(obj);
    });

    it('should clone array', () => {
      const result = shallowClone(arr);

      expect(result).toEqual(arr);
      expect(result).not.toBe(arr);
    });

    it('should return simple values', () => {
      expect(shallowClone(false)).toBe(false);
      expect(shallowClone(true)).toBe(true);
      expect(shallowClone('string')).toBe('string');
      expect(shallowClone(10)).toBe(10);
      expect(shallowClone(undefined)).toBeUndefined();
    });

    it('should return null', () => {
      expect(shallowClone(null)).toBeNull();
    });
  });

  describe('hasPartialObjectToMerge', () => {
    it('should return false if base is null', () => {
      const result = hasPartialObjectToMerge(null);
      expect(result).toBe(false);
    });

    it('should return false if base is an array', () => {
      const result = hasPartialObjectToMerge([]);
      expect(result).toBe(false);
    });

    it('should return false if base is a Set', () => {
      const result = hasPartialObjectToMerge(new Set());
      expect(result).toBe(false);
    });

    it('should return true if base and partial are objects', () => {
      const result = hasPartialObjectToMerge({}, {});
      expect(result).toBe(true);
    });

    it('should return false if base is object and patial is null', () => {
      const result = hasPartialObjectToMerge({}, null as any);
      expect(result).toBe(false);
    });

    it('should return true if base and any additionalPartials are objects', () => {
      const result = hasPartialObjectToMerge({}, undefined, ['string', [], {}]);
      expect(result).toBe(true);
    });

    it('should return true if base and any additionalPartials are objects even if partial is an array', () => {
      const result = hasPartialObjectToMerge({}, [], ['string', [], {}]);
      expect(result).toBe(true);
    });

    it('should return false if base is an object but not the partial nor any additionalPartials are not objects', () => {
      const result = hasPartialObjectToMerge({}, undefined, ['string', []]);
      expect(result).toBe(false);
    });

    it('should return false if base is an object but not the partial nor any additionalPartials are not objects even if partial is an array', () => {
      const result = hasPartialObjectToMerge({}, [], ['string', []]);
      expect(result).toBe(false);
    });
  });

  describe('mergePartial', () => {
    let baseClone: TestType;

    interface TestType {
      string: string;
      number: number;
      boolean: boolean;
      array1: Partial<TestType>[];
      array2: number[];
      nested: Partial<TestType>;
    }

    type PartialTestType = RecursivePartial<TestType>;
    const base: TestType = {
      string: 'string1',
      boolean: false,
      number: 1,
      array1: [
        {
          string: 'string2',
        },
      ],
      array2: [1, 2, 3],
      nested: {
        string: 'string2',
        number: 2,
      },
    };

    beforeAll(() => {
      baseClone = JSON.parse(JSON.stringify(base)) as TestType;
    });

    describe('Union types', () => {
      type TestObject = { string1?: string; string2?: string };

      interface TestUnionType {
        union: 'val1' | 'val2' | TestObject | string[];
      }

      test('should override simple union type with object', () => {
        const result = mergePartial<TestUnionType>(
          { union: 'val2' },
          { union: { string1: 'other' } },
          { mergeOptionalPartialValues: true },
        );
        expect(result).toEqual({
          union: { string1: 'other' },
        });
      });

      test('should override simple union type with array', () => {
        const result = mergePartial<TestUnionType>(
          { union: 'val2' },
          { union: ['string'] },
          { mergeOptionalPartialValues: true },
        );
        expect(result).toEqual({
          union: ['string'],
        });
      });

      test('should override simple union type with object from additionalPartials', () => {
        const result = mergePartial<TestUnionType>({ union: 'val2' }, {}, { mergeOptionalPartialValues: true }, [
          {},
          { union: { string1: 'other' } },
        ]);
        expect(result).toEqual({
          union: { string1: 'other' },
        });
      });

      test('should override simple union type with array from additionalPartials', () => {
        const result = mergePartial<TestUnionType>({ union: 'val2' }, {}, { mergeOptionalPartialValues: true }, [
          {},
          { union: ['string'] },
        ]);
        expect(result).toEqual({
          union: ['string'],
        });
      });

      test('should override object union type with simple', () => {
        const result = mergePartial<TestUnionType>(
          { union: { string1: 'other' } },
          { union: 'val2' },
          { mergeOptionalPartialValues: true },
        );
        expect(result).toEqual({ union: 'val2' });
      });

      test('should override object union type with array', () => {
        const result = mergePartial<TestUnionType>(
          { union: { string1: 'other' } },
          { union: ['string'] },
          { mergeOptionalPartialValues: true },
        );
        expect(result).toEqual({ union: ['string'] });
      });

      test('should override object union type with simple from additionalPartials', () => {
        const result = mergePartial<TestUnionType>(
          { union: { string1: 'other' } },
          {},
          { mergeOptionalPartialValues: true },
          [{}, { union: 'val2' }],
        );
        expect(result).toEqual({ union: 'val2' });
      });

      test('should override object union type with array from additionalPartials', () => {
        const result = mergePartial<TestUnionType>(
          { union: { string1: 'other' } },
          {},
          { mergeOptionalPartialValues: true },
          [{}, { union: ['string'] }],
        );
        expect(result).toEqual({ union: ['string'] });
      });

      test('should override array union type with simple', () => {
        const result = mergePartial<TestUnionType>(
          { union: ['string'] },
          { union: 'val2' },
          { mergeOptionalPartialValues: true },
        );
        expect(result).toEqual({ union: 'val2' });
      });

      test('should override array union type with object', () => {
        const result = mergePartial<TestUnionType>(
          { union: ['string'] },
          { union: { string1: 'other' } },
          { mergeOptionalPartialValues: true },
        );
        expect(result).toEqual({ union: { string1: 'other' } });
      });

      test('should override array union type with simple from additionalPartials', () => {
        const result = mergePartial<TestUnionType>({ union: ['string'] }, {}, { mergeOptionalPartialValues: true }, [
          {},
          { union: 'val2' },
        ]);
        expect(result).toEqual({ union: 'val2' });
      });

      test('should override array union type with object from additionalPartials', () => {
        const result = mergePartial<TestUnionType>({ union: ['string'] }, {}, { mergeOptionalPartialValues: true }, [
          {},
          { union: { string1: 'other' } },
        ]);
        expect(result).toEqual({ union: { string1: 'other' } });
      });
    });

    test('should allow partial to be undefined', () => {
      expect(mergePartial('test')).toBe('test');
    });

    test('should override base value with partial', () => {
      expect(mergePartial(1 as number, 2)).toBe(2);
    });

    test('should NOT return original base structure', () => {
      expect(mergePartial(base, undefined, { mergeOptionalPartialValues: false })).not.toBe(base);
    });

    test('should override string value in base', () => {
      const partial: PartialTestType = { string: 'test' };
      const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false });
      expect(newBase).toEqual({
        ...newBase,
        string: partial.string,
      });
    });

    test('should override boolean value in base', () => {
      const partial: PartialTestType = { boolean: true };
      const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false });
      expect(newBase).toEqual({
        ...newBase,
        boolean: partial.boolean,
      });
    });

    test('should override number value in base', () => {
      const partial: PartialTestType = { number: 3 };
      const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false });
      expect(newBase).toEqual({
        ...newBase,
        number: partial.number,
      });
    });

    test('should override complex array value in base', () => {
      const partial: PartialTestType = { array1: [{ string: 'test' }] };
      const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false });
      expect(newBase).toEqual({
        ...newBase,
        array1: partial.array1,
      });
    });

    test('should override simple array value in base', () => {
      const partial: PartialTestType = { array2: [4, 5, 6] };
      const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false });
      expect(newBase).toEqual({
        ...newBase,
        array2: partial.array2,
      });
    });

    test('should override nested values in base', () => {
      const partial: PartialTestType = { nested: { number: 5 } };
      const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false });
      expect(newBase).toEqual({
        ...newBase,
        nested: {
          ...newBase.nested,
          number: partial.nested!.number,
        },
      });
    });

    test('should not mutate base structure', () => {
      const partial: PartialTestType = { number: 3 };
      mergePartial(base, partial, { mergeOptionalPartialValues: false });
      expect(base).toEqual(baseClone);
    });

    describe('Maps', () => {
      it('should merge top-level Maps', () => {
        const result = mergePartial(
          new Map([
            ['a', { name: 'Nick' }],
            ['b', { name: 'Marco' }],
          ]),
          new Map([['b', { name: 'rachel' }]]),
          {
            mergeMaps: true,
            mergeOptionalPartialValues: false,
          },
        );
        expect(result).toEqual(
          new Map([
            ['a', { name: 'Nick' }],
            ['b', { name: 'rachel' }],
          ]),
        );
      });

      it('should merge nested Maps with partail', () => {
        const result = mergePartial(
          { test: new Map([['cat', { name: 'cat' }]]) },
          { test: new Map([['dog', { name: 'dog' }]]) },
          {
            mergeMaps: true,
            mergeOptionalPartialValues: true,
          },
        );
        expect(result).toEqual({
          test: new Map([
            ['cat', { name: 'cat' }],
            ['dog', { name: 'dog' }],
          ]),
        });
      });

      it('should merge nested Maps', () => {
        const result = mergePartial(
          { test: new Map([['cat', { name: 'toby' }]]) },
          { test: new Map([['cat', { name: 'snickers' }]]) },
          {
            mergeMaps: true,
            mergeOptionalPartialValues: false,
          },
        );
        expect(result).toEqual({
          test: new Map([['cat', { name: 'snickers' }]]),
        });
      });

      it('should merge nested Maps with mergeOptionalPartialValues', () => {
        const result = mergePartial(
          { test: new Map([['cat', { name: 'toby' }]]) },
          { test: new Map([['dog', { name: 'lucky' }]]) },
          {
            mergeMaps: true,
            mergeOptionalPartialValues: true,
          },
        );
        expect(result).toEqual({
          test: new Map([
            ['cat', { name: 'toby' }],
            ['dog', { name: 'lucky' }],
          ]),
        });
      });

      it('should merge nested Maps from additionalPartials', () => {
        const result = mergePartial(
          { test: new Map([['cat', { name: 'toby' }]]) },
          undefined,
          {
            mergeMaps: true,
          },
          [
            {
              test: new Map([['cat', { name: 'snickers' }]]),
            },
          ],
        );
        expect(result).toEqual({
          test: new Map([
            ['cat', { name: 'toby' }],
            ['cat', { name: 'snickers' }],
          ]),
        });
      });

      it('should replace Maps when mergeMaps is false', () => {
        const result = mergePartial(
          { test: new Map([['cat', { name: 'toby' }]]) },
          { test: new Map([['dog', { name: 'snickers' }]]) },
          {
            mergeOptionalPartialValues: false,
          },
        );
        expect(result).toEqual({
          test: new Map([['dog', { name: 'snickers' }]]),
        });
      });

      it('should replace Maps when mergeMaps is false from additionalPartials', () => {
        const result = mergePartial(
          { test: new Map([['cat', { name: 'toby' }]]) },
          undefined,
          { mergeOptionalPartialValues: false },
          [
            {
              test: new Map([['dog', { name: 'snickers' }]]),
            },
          ],
        );
        expect(result).toEqual({
          test: new Map([['dog', { name: 'snickers' }]]),
        });
      });
    });

    describe('Sets', () => {
      it('should merge Sets like arrays', () => {
        const result = mergePartial(
          {
            animals: new Set(['cat', 'dog']),
          },
          {
            animals: new Set(['cat', 'dog', 'bird']),
          },
          { mergeOptionalPartialValues: false },
        );
        expect(result).toEqual({
          animals: new Set(['cat', 'dog', 'bird']),
        });
      });

      it('should merge Sets like arrays with mergeOptionalPartialValues', () => {
        interface Test {
          animals: Set<string>;
          numbers?: Set<number>;
        }

        const result = mergePartial<Test>(
          {
            animals: new Set(['cat', 'dog']),
          },
          {
            numbers: new Set([1, 2, 3]),
          },
          { mergeOptionalPartialValues: true },
        );
        expect(result).toEqual({
          animals: new Set(['cat', 'dog']),
          numbers: new Set([1, 2, 3]),
        });
      });

      it('should merge Sets like arrays from additionalPartials', () => {
        const result = mergePartial(
          {
            animals: new Set(['cat', 'dog']),
          },
          {},
          { mergeOptionalPartialValues: false },
          [
            {
              animals: new Set(['cat', 'dog', 'bird']),
            },
          ],
        );
        expect(result).toEqual({
          animals: new Set(['cat', 'dog', 'bird']),
        });
      });
    });

    describe('additionalPartials', () => {
      test('should override string value in base with first partial value', () => {
        const partial: PartialTestType = { string: 'test1' };
        const partials: PartialTestType[] = [{ string: 'test2' }, { string: 'test3' }];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          string: partial.string,
        });
      });

      test('should override string values in base with first and second partial value', () => {
        const partial: PartialTestType = { number: 4 };
        const partials: PartialTestType[] = [{ string: 'test2' }];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          number: partial.number,
          string: partials[0]?.string,
        });
      });

      test('should override string values in base with first, second and thrid partial value', () => {
        const partial: PartialTestType = { number: 4 };
        const partials: PartialTestType[] = [
          { number: 10, string: 'test2' },
          { number: 20, string: 'nope', boolean: true },
        ];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          number: partial.number,
          string: partials[0]?.string,
          boolean: partials[1]?.boolean,
        });
      });

      test('should override complex array value in base', () => {
        const partial: PartialTestType = { array1: [{ string: 'test1' }] };
        const partials: PartialTestType[] = [{ array1: [{ string: 'test2' }] }];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          array1: partial.array1,
        });
      });

      test('should override complex array value in base second partial', () => {
        const partial: PartialTestType = {};
        const partials: PartialTestType[] = [{}, { array1: [{ string: 'test2' }] }];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          array1: partials[1]?.array1,
        });
      });

      test('should override simple array value in base', () => {
        const partial: PartialTestType = { array2: [4, 5, 6] };
        const partials: PartialTestType[] = [{ array2: [7, 8, 9] }];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          array2: partial.array2,
        });
      });

      test('should override simple array value in base with partial', () => {
        const partial: PartialTestType = {};
        const partials: PartialTestType[] = [{ array2: [7, 8, 9] }];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          array2: partials[0]?.array2,
        });
      });

      test('should override simple array value in base with second partial', () => {
        const partial: PartialTestType = {};
        const partials: PartialTestType[] = [{}, { array2: [7, 8, 9] }];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          array2: partials[1]?.array2,
        });
      });

      test('should override nested values in base', () => {
        const partial: PartialTestType = { nested: { number: 5 } };
        const partials: PartialTestType[] = [{ nested: { number: 10 } }];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          nested: {
            ...newBase.nested,
            number: partial.nested!.number,
          },
        });
      });

      test('should override nested values from partial', () => {
        const partial: PartialTestType = {};
        const partials: PartialTestType[] = [{ nested: { number: 10 } }];
        const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: false }, partials);
        expect(newBase).toEqual({
          ...newBase,
          nested: {
            ...newBase.nested,
            number: partials[0]?.nested!.number,
          },
        });
      });

      test('should traverse all partial keys', () => {
        interface Test {
          crosshair: {
            line: {
              dash?: number[];
              strokeWidth: number;
            };
            band?: {
              visible: boolean;
            };
          };
        }
        const customBase: Test = {
          crosshair: {
            line: {
              strokeWidth: 1,
            },
          },
        };
        const partials: RecursivePartial<Test>[] = [
          {
            crosshair: {
              line: {
                dash: [4, 4],
              },
            },
          },
          {
            crosshair: {
              line: {
                strokeWidth: 10,
              },
              band: {
                visible: true,
              },
            },
          },
        ];
        const newBase = mergePartial(customBase, {}, {}, partials);
        expect(newBase).toEqual({
          crosshair: {
            line: {
              strokeWidth: 10,
              dash: [4, 4],
            },
            band: {
              visible: true,
            },
          },
        });
      });
    });

    describe('MergeOptions', () => {
      describe('mergeOptionalPartialValues', () => {
        interface OptionalTestType {
          value1: string;
          value2?: number;
          value3: string;
          value4?: OptionalTestType;
        }

        const defaultBase: OptionalTestType = {
          value1: 'foo',
          value3: 'bar',
          value4: {
            value1: 'foo',
            value3: 'bar',
          },
        };
        const partial1: RecursivePartial<OptionalTestType> = { value1: 'baz', value2: 10 };
        const partial2: RecursivePartial<OptionalTestType> = { value1: 'baz', value4: { value2: 10 } };

        describe('mergeOptionalPartialValues is true', () => {
          test('should merge optional parameters', () => {
            const merged = mergePartial(defaultBase, partial1, { mergeOptionalPartialValues: true });
            expect(merged).toEqual({
              value1: 'baz',
              value2: 10,
              value3: 'bar',
              value4: {
                value1: 'foo',
                value3: 'bar',
              },
            });
          });

          test('should merge nested optional parameters', () => {
            const merged = mergePartial(defaultBase, partial2, { mergeOptionalPartialValues: true });
            expect(merged).toEqual({
              value1: 'baz',
              value3: 'bar',
              value4: {
                value1: 'foo',
                value2: 10,
                value3: 'bar',
              },
            });
          });

          test('should merge optional params from partials', () => {
            type PartialTestTypeOverride = PartialTestType & any;
            const partial: PartialTestTypeOverride = { nick: 'test', number: 6 };
            const partials: PartialTestTypeOverride[] = [{ string: 'test', foo: 'bar' }, { array3: [3, 3, 3] }];
            const newBase = mergePartial(base, partial, { mergeOptionalPartialValues: true }, partials);
            expect(newBase).toEqual({
              ...newBase,
              ...partial,
              ...partials[0],
              ...partials[1],
            });
          });
        });

        describe('mergeOptionalPartialValues is false', () => {
          test('should NOT merge optional parameters', () => {
            const merged = mergePartial(defaultBase, partial1, { mergeOptionalPartialValues: false });
            expect(merged).toEqual({
              value1: 'baz',
              value3: 'bar',
              value4: {
                value1: 'foo',
                value3: 'bar',
              },
            });
          });

          test('should NOT merge nested optional parameters', () => {
            const merged = mergePartial(defaultBase, partial2, { mergeOptionalPartialValues: false });
            expect(merged).toEqual({
              value1: 'baz',
              value3: 'bar',
              value4: {
                value1: 'foo',
                value3: 'bar',
              },
            });
          });
        });
      });
    });
  });

  describe('#getColorFromVariant', () => {
    const seriesColor = '#626825';
    it('should return seriesColor if color is undefined', () => {
      expect(getColorFromVariant(seriesColor)).toBe(seriesColor);
    });

    it('should return seriesColor color if ColorVariant is Series', () => {
      expect(getColorFromVariant(seriesColor, ColorVariant.Series)).toBe(seriesColor);
    });

    it('should return transparent if ColorVariant is None', () => {
      expect(getColorFromVariant(seriesColor, ColorVariant.None)).toBe('transparent');
    });

    it('should return color if Color is passed', () => {
      const color = '#f61c48';
      expect(getColorFromVariant(seriesColor, color)).toBe(color);
    });
  });
});

describe('#isUniqueArray', () => {
  it('should return true for simple unique values', () => {
    expect(isUniqueArray([1, 2])).toBe(true);
  });

  it('should return true for complex unique values', () => {
    expect(isUniqueArray([{ n: 1 }, { n: 2 }], ({ n }) => n)).toBe(true);
  });

  it('should return false for simple duplicated values', () => {
    expect(isUniqueArray([1, 1, 2])).toBe(false);
  });

  it('should return false for complex duplicated values', () => {
    expect(isUniqueArray([{ n: 1 }, { n: 1 }, { n: 2 }], ({ n }) => n)).toBe(false);
  });
});

describe('#sortNumbers', () => {
  describe('ascending', () => {
    it('should sort positive values', () => {
      expect(sortNumbers([20, 5, 0, 200])).toEqual([0, 5, 20, 200]);
    });

    it('should sort negative values', () => {
      expect(sortNumbers([-20, -5, 0, -200])).toEqual([-200, -20, -5, 0]);
    });

    it('should sort negative values', () => {
      expect(sortNumbers([-20, -5, 20, 5, 0, 200, 0, -200])).toEqual([-200, -20, -5, 0, 0, 5, 20, 200]);
    });
  });

  describe('descending', () => {
    it('should sort positive values', () => {
      expect(sortNumbers([20, 5, 0, 200], true)).toEqual([200, 20, 5, 0]);
    });

    it('should sort negative values', () => {
      expect(sortNumbers([-20, -5, 0, -200], true)).toEqual([0, -5, -20, -200]);
    });

    it('should sort negative values', () => {
      expect(sortNumbers([-20, -5, 20, 5, 0, 200, 0, -200], true)).toEqual([200, 20, 5, 0, 0, -5, -20, -200]);
    });
  });
});

describe('#isSorted', () => {
  it('should sort empty as true', () => {
    expect(isSorted([])).toBe(true);
  });

  it('should sort single as true', () => {
    expect(isSorted([1])).toBe(true);
  });

  it('should sort double as true', () => {
    expect(isSorted([1, 10])).toBe(true);
  });

  it('should sort double revered as true', () => {
    expect(isSorted([10, 1])).toBe(true);
  });

  it('should sort many as true', () => {
    expect(isSorted([1, 10, 100])).toBe(true);
  });

  it('should sort many revered as true', () => {
    expect(isSorted([100, 10, 1])).toBe(true);
  });

  it('should force ascending sort', () => {
    expect(isSorted([100, 10, 1], { order: 'ascending' })).toBe(false);
  });

  it('should force descending sort', () => {
    expect(isSorted([1, 10, 100], { order: 'descending' })).toBe(false);
  });

  it('should sort many revered as true', () => {
    expect(isSorted([100, 10, 1])).toBe(true);
  });

  it('should sort many mixed as true', () => {
    expect(isSorted([-100, -10, 1, 10, 100])).toBe(true);
  });

  it('should sort many mixed as false', () => {
    expect(isSorted([-100, 10, 1, 10, 100])).toBe(false);
  });

  it('should sort many mixed revered as true', () => {
    expect(isSorted([100, 10, 1, -10, -100])).toBe(true);
  });

  it('should sort many mixed revered as false', () => {
    expect(isSorted([100, 10, 1, 10, -100])).toBe(false);
  });

  it('should sort many mixed revered as false', () => {
    expect(isSorted([100, 10, 1, -10, -10, -100])).toBe(false);
  });

  it('should sort many mixed revered as false', () => {
    expect(isSorted([100, 10, 1, -10, -10, -100], { allowDuplicates: true })).toBe(true);
  });

  it('should sort double with dups as false', () => {
    expect(isSorted([1, 1])).toBe(false);
  });

  it('should sort double with dups as true', () => {
    expect(isSorted([1, 1], { allowDuplicates: true })).toBe(true);
  });

  it('should sort many with dups as false', () => {
    expect(isSorted([0, 1, 10, 10, 100])).toBe(false);
  });

  it('should sort many with dups as true', () => {
    expect(isSorted([0, 1, 10, 10, 100], { allowDuplicates: true })).toBe(true);
  });

  it('should sort many reversed with dups as false', () => {
    expect(isSorted([100, 10, 10, 1, 0])).toBe(false);
  });

  it('should sort many reversed with dups as true', () => {
    expect(isSorted([100, 10, 10, 1, 0], { allowDuplicates: true })).toBe(true);
  });
});

describe('#isDefined', () => {
  it('should return false for null', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isDefined()).toBe(false);
  });

  it('should return true for zero', () => {
    expect(isDefined(0)).toBe(true);
  });

  it('should return true for empty string', () => {
    expect(isDefined('')).toBe(true);
  });

  it('should return true for empty false', () => {
    expect(isDefined(false)).toBe(true);
  });

  it('should filter out null and undefined values', () => {
    const values: (number | null | undefined)[] = [1, 2, null, 4, 5, undefined];
    const result: number[] = values.filter(isDefined);
    expect(result).toEqual([1, 2, 4, 5]);
  });
});

describe('#isDefinedFrom', () => {
  interface Test {
    a?: number | string | boolean | null;
  }

  it('should filter out undefined values from complex types', () => {
    const values: Partial<Test>[] = [
      {
        a: 1,
      },
      {
        a: 'string',
      },
      {
        a: false,
      },
      {},
    ];
    const result: NonNullable<Test>[] = values.filter(isDefinedFrom(({ a }) => a !== undefined));
    expect(result).toEqual(values.slice(0, -1));
  });

  it('should filter out null values from complex types', () => {
    const values: Test[] = [
      {
        a: 1,
      },
      {
        a: 'string',
      },
      {
        a: false,
      },
      {
        a: null,
      },
    ];
    const result: NonNullable<Test>[] = values.filter(isDefinedFrom(({ a }) => a !== null));
    expect(result).toEqual(values.slice(0, -1));
  });

  it('should filter out null values from complex nested types', () => {
    type NestedTest = {
      aa: Test;
    };
    const values: NestedTest[] = [
      {
        aa: { a: 1 },
      },
      {
        aa: { a: 'string' },
      },
      {
        aa: { a: false },
      },
      {
        aa: { a: null },
      },
      {
        aa: {},
      },
      {
        aa: { a: undefined },
      },
    ];
    const result: NonNullable<NestedTest>[] = values.filter(
      isDefinedFrom(({ aa }) => aa?.a !== undefined && aa?.a !== null),
    );
    expect(result).toEqual(values.slice(0, 3));
  });

  describe('#isBetween', () => {
    it('should filter array values between min and max inclusive', () => {
      expect([1, 2, 3, 4, 5, 6].filter(isBetween(2, 5, false))).toEqual([2, 3, 4, 5]);
    });
    it('should filter array values between min and max exclusive', () => {
      expect([1, 2, 3, 4, 5, 6].filter(isBetween(2, 5, true))).toEqual([3, 4]);
    });
  });

  describe('#clampAll', () => {
    it('should clamp each value in array between min and max', () => {
      expect([0, 200, 400].reduce(...clampAll(100, 300))).toEqual([100, 200, 300]);
    });
    it('should clamp array values and remove duplicates', () => {
      expect([0, 100, 200, 300, 400].reduce(...clampAll(100, 300))).toEqual([100, 200, 300]);
    });
  });

  describe('#inRange', () => {
    describe('#firstHalf', () => {
      it.each<{ start: number; end: number; value: number; expected: boolean; exclusive?: boolean }>([
        { start: 0, end: 100, value: 25, expected: true },
        { start: 0, end: 100, value: 75, expected: false },
        { start: 100, end: 0, value: 25, expected: false },
        { start: 100, end: 0, value: 75, expected: true },
        { start: -10, end: 100, value: 0, expected: true },
        { start: -100, end: 100, value: 50, expected: false },
        { start: -100, end: 100, value: -50, expected: true },
        { start: -100, end: 100, value: -110, expected: false },
        { start: 100, end: -100, value: 110, expected: false },
        { start: 10, end: 20, value: 10, expected: false, exclusive: true },
        { start: 10, end: 20, value: 15, expected: false, exclusive: true },
      ])(
        'should return $expected for $value, given a range of [$start, $end]',
        ({ start, end, value, expected, exclusive }) => {
          expect(inRange(start, end, exclusive).firstHalf(value)).toBe(expected);
        },
      );
    });
    describe('#lastHalf', () => {
      it.each<{ start: number; end: number; value: number; expected: boolean; exclusive?: boolean }>([
        { start: 0, end: 100, value: 25, expected: false },
        { start: 0, end: 100, value: 75, expected: true },
        { start: 100, end: 0, value: 25, expected: true },
        { start: 100, end: 0, value: 75, expected: false },
        { start: 100, end: 10, value: 0, expected: false },
        { start: -100, end: 10, value: 0, expected: true },
        { start: -100, end: 100, value: 50, expected: true },
        { start: -100, end: 100, value: -50, expected: false },
        { start: -100, end: 100, value: 110, expected: false },
        { start: 100, end: -100, value: -110, expected: false },
        { start: 10, end: 20, value: 20, expected: false, exclusive: true },
        { start: 10, end: 20, value: 15, expected: false, exclusive: true },
      ])(
        'should return $expected for $value, given a range of [$start, $end]',
        ({ start, end, value, expected, exclusive }) => {
          expect(inRange(start, end, exclusive).lastHalf(value)).toBe(expected);
        },
      );
    });
  });
});
