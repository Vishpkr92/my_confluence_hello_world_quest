import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  // Safely extract the space name from the payload
  const spaceName = req.payload?.spaceName || 'Default Space';

  console.log(`Incoming request for space: ${spaceName}`);

  return `Welcome to the ${spaceName} space!`;
});

export const handler = resolver.getDefinitions();


