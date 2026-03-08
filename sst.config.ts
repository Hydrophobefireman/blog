/// <reference path="./.sst/platform/config.d.ts" />

const HPFM_ZONE_ID = "2cadf7f6abbd1cade4f1641ee2594b71"
const BHAVESH_DEV_ZONE_ID = "171cc36b8ce67b6d6e2a9ce669b11979"
export default $config({
  app(input) {
    return {
      name: "site",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "cloudflare",
    }
  },
  async run() {
    const worker = new sst.cloudflare.Worker("Blog", {
      handler: "./worker.ts",
      assets: {
        directory: "./public",
      },
      url: true,
      domain: "bhavesh.dev",
    })

    if ($app.stage == "production") {
      new cloudflare.DnsRecord("DnsRecord_hpfm_dev", {
        zoneId: HPFM_ZONE_ID,
        name: "@",
        type: "CNAME",
        proxied: true,
        ttl: 1, // Automatic
        content: "bhavesh.dev",
      })

      new cloudflare.DnsRecord("DnsRecord_www_bhavesh_dev", {
        zoneId: BHAVESH_DEV_ZONE_ID,
        name: "www",
        type: "CNAME",
        proxied: true,
        ttl: 1, // Automatic
        content: "bhavesh.dev",
      })

      new cloudflare.DnsRecord("DnsRecord_blog_hpfm_dev", {
        zoneId: HPFM_ZONE_ID,
        name: "blog",
        type: "CNAME",
        proxied: true,
        ttl: 1, // Automatic
        content: "hpfm.dev",
      })

      new cloudflare.DnsRecord("DnsRecord_www_hpfm_dev", {
        zoneId: HPFM_ZONE_ID,
        name: "www",
        type: "CNAME",
        proxied: true,
        ttl: 1, // Automatic
        content: "hpfm.dev",
      })

      new cloudflare.Ruleset("RedirectRules_hpfm_dev", {
        zoneId: HPFM_ZONE_ID,
        name: "hpfm.dev redirect rules",
        description: "Redirect www and blog to apex",
        kind: "zone",
        phase: "http_request_dynamic_redirect",
        rules: [
          {
            action: "redirect",
            actionParameters: {
              fromValue: {
                targetUrl: {
                  expression: 'concat("https://bhavesh.dev", http.request.uri.path)',
                },
                statusCode: 308,
                preserveQueryString: true,
              },
            },
            expression: `(http.host eq "www.hpfm.dev") or (http.host eq "blog.hpfm.dev") or (http.host eq "hpfm.dev")`,
            description: "Redirect apex",
            enabled: true,
          },
        ],
      })

      new cloudflare.Ruleset("RedirectRules_bhavesh", {
        zoneId: BHAVESH_DEV_ZONE_ID,
        name: "bhavesh.dev redirect rules",
        description: "Redirect www to apex",
        kind: "zone",
        phase: "http_request_dynamic_redirect",
        rules: [
          {
            action: "redirect",
            actionParameters: {
              fromValue: {
                targetUrl: {
                  expression: 'concat("https://bhavesh.dev", http.request.uri.path)',
                },
                statusCode: 308,
                preserveQueryString: true,
              },
            },
            expression: `(http.host eq "www.bhavesh.dev")`,
            description: "Redirect www to apex",
            enabled: true,
          },
        ],
      })
    }
    return {
      site: worker.url,
    }
  },
})
