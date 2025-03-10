import { checkLinks, generateReport } from '../src/utils/link-checker';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000/wav-track';
  const excludePaths = [
    '/api/',
    '/admin/',
    '/logout',
  ];

  console.log(`Starting link check for ${baseUrl}`);
  console.log('This may take a few minutes...');

  try {
    const results = await checkLinks({
      baseUrl,
      excludePaths,
      includeExternal: true,
      concurrency: 10,
    });

    // Generate report
    const report = generateReport(results);
    
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportsDir, `link-check-${timestamp}.md`);
    await fs.writeFile(reportPath, report);

    console.log(`\nReport generated: ${reportPath}`);
    
    // Log summary to console
    const brokenLinks = results.filter(r => !r.isValid);
    if (brokenLinks.length > 0) {
      console.log('\nBroken links found:');
      brokenLinks.forEach(link => {
        console.log(`\n${link.url}`);
        console.log(`Status: ${link.status}`);
        console.log(`Found on: ${link.pageFound}`);
        if (link.error) {
          console.log(`Error: ${link.error}`);
        }
      });
      process.exit(1);
    } else {
      console.log('\nNo broken links found!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error running link checker:', error);
    process.exit(1);
  }
}

main(); 