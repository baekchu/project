import algoliasearch from 'algoliasearch';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID;
const ALGOLIA_ADMIN_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
const ALGOLIA_UPDATE_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_UPDATE_KEY;

const searchClient = algoliasearch(ALGOLIA_APP_ID ?? "", ALGOLIA_ADMIN_API_KEY ?? "");
const updateClient = algoliasearch(ALGOLIA_APP_ID ?? "", ALGOLIA_UPDATE_API_KEY ?? "");

export { searchClient, updateClient };