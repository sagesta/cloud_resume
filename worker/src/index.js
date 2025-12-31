export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      
      // Define the upstream Azure Static Website URL
      // We will set this in wrangler.toml or as a secret, but for now we default to the known endpoint structure
      // or retrieve it from environment variables.
      const AZURE_ORIGIN = env.AZURE_STORAGE_URL;
  
      if (!AZURE_ORIGIN) {
        return new Response("Error: AZURE_STORAGE_URL environment variable is not set.", { status: 500 });
      }
  
      // Construct the new URL
      let targetUrl = new URL(url.pathname + url.search, AZURE_ORIGIN);
  
      // Handle root request -> index.html
      if (targetUrl.pathname === "/" || targetUrl.pathname === "") {
        targetUrl.pathname = "/index.html";
      }
  
      // Create a mutable request to forward
      const newRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "manual" // Let the worker handle redirects if needed, or pass them back
      });
  
      // Override Host header to match the Azure Storage requirement (optional but often needed)
      // Azure Blob Storage static websites usually expect the host header to be the storage endpoint or just accept the request.
      // Ideally, we don't send the original 'samueladebodun.com' host header to Azure, 
      // as Azure won't recognize it without Custom Domain config (which we are removing).
      // We let the fetch use the host from targetUrl.
      
      try {
        const response = await fetch(newRequest);
        return response;
      } catch (e) {
        return new Response(`Error fetching from backend: ${e.message}`, { status: 502 });
      }
    },
  };
