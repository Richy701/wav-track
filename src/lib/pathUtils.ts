/**
 * Path utility functions for handling different base paths
 * in different environments (Vercel vs local)
 */

/**
 * Get the application base URL from the environment
 * This returns the correct base path regardless of environment
 */
export const getBaseUrl = (): string => {
  return import.meta.env.BASE_URL || '/';
};

/**
 * Resolves a path relative to the base URL
 * 
 * @param path The path to resolve (should not start with /)
 * @returns The resolved path with the correct base
 */
export const resolvePath = (path: string): string => {
  const base = getBaseUrl();
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Join base and path, ensuring no double slashes
  const baseWithTrailingSlash = base.endsWith('/') ? base : `${base}/`;
  return `${baseWithTrailingSlash}${cleanPath}`;
};

/**
 * Resolves an asset path
 * 
 * @param assetPath The asset path relative to the public directory
 * @returns The resolved asset path
 */
export const resolveAssetPath = (assetPath: string): string => {
  // For assets like images, we can use relative paths in most cases
  // This is more reliable across environments
  return `./${assetPath.replace(/^\.\//, '')}`;
};

/**
 * Creates a route path that works across environments
 * 
 * @param routePath The route path (should not include the base path)
 * @returns The full route path
 */
export const createRoutePath = (routePath: string): string => {
  // For routes, we need to consider the router's base path
  // which is handled by the basename prop in BrowserRouter
  
  // Remove leading slash
  return routePath.startsWith('/') ? routePath.slice(1) : routePath;
}; 