import type { ChatMessage, UiLanguage } from '../types';
import { latexMathPlugin } from './latexMath';
import type { ContentPlugin } from './types';

const contentPlugins: ContentPlugin[] = [latexMathPlugin];
const codeFencePattern = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g;

export function getContentPlugins(): ContentPlugin[] {
  return contentPlugins;
}

export function applyContentPlugins(
  text: string,
  context: { message: ChatMessage; language: UiLanguage; isUser: boolean }
): string {
  const blocks: string[] = [];
  const protectedText = text.replace(codeFencePattern, (block) => {
    const token = `\uE000CODE_BLOCK_${blocks.length}\uE000`;
    blocks.push(block);
    return token;
  });

  const transformed = contentPlugins.reduce(
    (current, plugin) => plugin.transformText?.(current, context) ?? current,
    protectedText
  );

  return transformed.replace(/\uE000CODE_BLOCK_(\d+)\uE000/g, (_, index: string) => blocks[Number(index)] ?? '');
}
