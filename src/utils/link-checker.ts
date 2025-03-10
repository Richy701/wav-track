interface LinkCheckResult {
  url: string;
  status: number;
  isValid: boolean;
  error?: string;
  pageFound: string;
}

interface CheckLinksOptions {
  baseUrl: string;
  excludePaths?: string[];
  includeExternal?: boolean;
  concurrency?: number;
}

export async function checkLinks({
  baseUrl,
  excludePaths = [],
  includeExternal = false,
  concurrency = 5
}: CheckLinksOptions): Promise<LinkCheckResult[]> {
  const visited = new Set<string>();
  const results: LinkCheckResult[] = [];
  const queue: { url: string; pageFound: string }[] = [{ url: baseUrl, pageFound: 'Initial URL' }];

  async function checkUrl(url: string, pageFound: string): Promise<LinkCheckResult> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        url,
        status: response.status,
        isValid: response.ok,
        pageFound,
      };
    } catch (error) {
      return {
        url,
        status: 0,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        pageFound,
      };
    }
  }

  async function processQueue() {
    while (queue.length > 0) {
      const batch = queue.splice(0, concurrency);
      const checks = batch.map(({ url, pageFound }) => checkUrl(url, pageFound));
      const batchResults = await Promise.all(checks);
      
      for (const result of batchResults) {
        results.push(result);
        
        // If it's an HTML page, scan it for more links
        if (result.isValid && result.url.startsWith(baseUrl)) {
          try {
            const response = await fetch(result.url);
            const html = await response.text();
            const newLinks = extractLinks(html, result.url);
            
            for (const link of newLinks) {
              const absoluteUrl = new URL(link, result.url).toString();
              
              // Ensure internal links include the base URL
              if (absoluteUrl.startsWith('/') && !absoluteUrl.startsWith(baseUrl)) {
                const baseUrlObj = new URL(baseUrl);
                const fullUrl = `${baseUrlObj.origin}${baseUrl}${absoluteUrl}`;
                if (!visited.has(fullUrl) && 
                    (includeExternal || fullUrl.startsWith(baseUrl)) &&
                    !excludePaths.some(path => fullUrl.includes(path))) {
                  visited.add(fullUrl);
                  queue.push({ url: fullUrl, pageFound: result.url });
                }
              } else if (!visited.has(absoluteUrl) && 
                        (includeExternal || absoluteUrl.startsWith(baseUrl)) &&
                        !excludePaths.some(path => absoluteUrl.includes(path))) {
                visited.add(absoluteUrl);
                queue.push({ url: absoluteUrl, pageFound: result.url });
              }
            }
          } catch (error) {
            console.error(`Error scanning page ${result.url}:`, error);
          }
        }
      }
    }
  }

  function extractLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const regex = /href=["'](.*?)["']/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const href = match[1];
      if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        links.push(href);
      }
    }
    
    return links;
  }

  visited.add(baseUrl);
  await processQueue();
  return results;
}

export function generateReport(results: LinkCheckResult[]): string {
  const validLinks = results.filter(r => r.isValid);
  const brokenLinks = results.filter(r => !r.isValid);
  
  let report = '# Link Check Report\n\n';
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `Total Links Checked: ${results.length}\n`;
  report += `Valid Links: ${validLinks.length}\n`;
  report += `Broken Links: ${brokenLinks.length}\n\n`;
  
  if (brokenLinks.length > 0) {
    report += '## Broken Links\n\n';
    for (const link of brokenLinks) {
      report += `- ${link.url}\n`;
      report += `  Status: ${link.status}\n`;
      report += `  Found on: ${link.pageFound}\n`;
      if (link.error) {
        report += `  Error: ${link.error}\n`;
      }
      report += '\n';
    }
  }
  
  return report;
} 