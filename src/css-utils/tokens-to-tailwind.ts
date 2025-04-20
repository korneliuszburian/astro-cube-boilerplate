import slugify from 'slugify';

/**
 * Token interface representing a design token with name and value
 */
interface Token {
  name: string;
  value: any;
}

/**
 * Converts human readable tokens into tailwind config friendly ones
 *
 * @param {Token[]} tokens Array of {name: string, value: any}
 * @return {Record<string, any>} Object with slugified keys and original values
 */
const tokensToTailwind = (tokens: Token[]): Record<string, any> => {
  const nameSlug = (text: string): string => slugify(text, {lower: true});
  let response: Record<string, any> = {};

  tokens.forEach(({name, value}) => {
    response[nameSlug(name)] = value;
  });

  return response;
};

export default tokensToTailwind;
