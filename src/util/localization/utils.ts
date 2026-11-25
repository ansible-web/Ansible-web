import type { TeactNode } from '../../lib/teact/teact';

import type { LangFn } from './types';

const UNIQUE_PLACEHOLDER_PREFIX = '$PLACEHOLDER-';

// Cached and remote translations can still use the upstream name for Diamonds.
export function normalizeDiamondPlaceholder(template: string, variables?: object) {
  if (!variables || !('diamonds' in variables) || 'stars' in variables) return template;
  return template.replaceAll('{stars}', '{diamonds}');
}

export function conjuctionWithNodes(langFn: LangFn, nodes: TeactNode[]) {
  const placeholders = nodes.map((node, i) => `${UNIQUE_PLACEHOLDER_PREFIX}${i}`);
  const replaced = langFn.internalFormatters.conjunction.formatToParts(placeholders);
  const result: TeactNode[] = [];
  replaced.forEach((part) => {
    if (part.type === 'literal') {
      result.push(part.value);
      return;
    }

    const index = Number(part.value.slice(UNIQUE_PLACEHOLDER_PREFIX.length));
    result.push(nodes[index]);
  });

  return result;
}

export function disjunctionWithNodes(langFn: LangFn, nodes: TeactNode[]) {
  const placeholders = nodes.map((node, i) => `${UNIQUE_PLACEHOLDER_PREFIX}${i}`);
  const replaced = langFn.internalFormatters.disjunction.formatToParts(placeholders);
  const result: TeactNode[] = [];
  replaced.forEach((part) => {
    if (part.type === 'literal') {
      result.push(part.value);
      return;
    }

    const index = Number(part.value.slice(UNIQUE_PLACEHOLDER_PREFIX.length));
    result.push(nodes[index]);
  });

  return result;
}
