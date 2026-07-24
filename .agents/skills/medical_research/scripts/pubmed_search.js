const https = require('https');

function searchPubMed(query, maxResults = 5) {
  const encodedQuery = encodeURIComponent(query);
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmode=json&retmax=${maxResults}`;

  https.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const idList = json.esearchresult?.idlist || [];
        if (idList.length === 0) {
          console.log("No articles found on PubMed matching that query.");
          return;
        }

        const idsStr = idList.join(',');
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idsStr}&retmode=json`;

        https.get(summaryUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (sumRes) => {
          let sumData = '';
          sumRes.on('data', (chunk) => { sumData += chunk; });
          sumRes.on('end', () => {
            try {
              const sumJson = JSON.parse(sumData);
              const results = sumJson.result || {};
              console.log(`## PubMed Research Results for: *${query}*\n`);
              idList.forEach((uid) => {
                const doc = results[uid];
                if (!doc) return;
                const title = doc.title || 'No Title';
                const authors = (doc.authors || []).map(a => a.name).join(', ');
                const source = doc.source || 'Unknown Journal';
                const pubdate = doc.pubdate || 'Unknown Date';
                const epubaddr = `https://pubmed.ncbi.nlm.nih.gov/${uid}/`;
                console.log(`### [${title}](${epubaddr})`);
                console.log(`- **Authors:** ${authors}`);
                console.log(`- **Journal & Date:** *${source}*, ${pubdate}`);
                console.log(`- **PMID:** ${uid}\n`);
              });
            } catch (e) {
              console.error(`Error parsing PubMed summaries: ${e.message}`);
            }
          });
        }).on('error', (e) => {
          console.error(`Error fetching PubMed summaries: ${e.message}`);
        });

      } catch (e) {
        console.error(`Error parsing PubMed search: ${e.message}`);
      }
    });
  }).on('error', (e) => {
    console.error(`Error searching PubMed: ${e.message}`);
  });
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node pubmed_search.js <query>");
  process.exit(1);
}
searchPubMed(args.join(' '));
