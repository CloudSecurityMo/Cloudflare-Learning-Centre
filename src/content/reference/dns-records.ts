export interface DnsRecordRef {
  type: string;
  purpose: string;
  example: string;
  proxyable: boolean;
  notes: string;
}

export const DNS_RECORD_REFERENCE: DnsRecordRef[] = [
  { type: "A", purpose: "Maps a hostname to an IPv4 address.", example: "example.com A 203.0.113.10", proxyable: true, notes: "Most common record for web traffic." },
  { type: "AAAA", purpose: "Maps a hostname to an IPv6 address.", example: "example.com AAAA 2001:db8::1", proxyable: true, notes: "IPv6 equivalent of A." },
  { type: "CNAME", purpose: "Aliases one hostname to another hostname.", example: "www CNAME example.com", proxyable: true, notes: "Cannot coexist with other records on the same name (except via CNAME flattening at the apex)." },
  { type: "MX", purpose: "Specifies mail servers for the domain, with priority.", example: "example.com MX 10 mail.example.com", proxyable: false, notes: "Must not be proxied — SMTP isn't handled by the HTTP proxy." },
  { type: "TXT", purpose: "Arbitrary text — SPF, DKIM, DMARC, domain verification.", example: "example.com TXT \"v=spf1 include:_spf.example.com ~all\"", proxyable: false, notes: "TXT records are never proxied; they're metadata, not a connection target." },
  { type: "NS", purpose: "Delegates a subdomain to a different set of nameservers.", example: "sub.example.com NS ns1.otherprovider.com", proxyable: false, notes: "Used for subdomain delegation, distinct from zone-level nameserver delegation at the registrar." },
  { type: "SRV", purpose: "Specifies host and port for a service (e.g. SIP, XMPP).", example: "_sip._tcp.example.com SRV 10 60 5060 sipserver.example.com", proxyable: false, notes: "Service discovery record, not proxied." },
  { type: "CAA", purpose: "Restricts which Certificate Authorities may issue certs for the domain.", example: "example.com CAA 0 issue \"letsencrypt.org\"", proxyable: false, notes: "Security control at the DNS layer for certificate issuance." },
  { type: "PTR", purpose: "Reverse DNS — maps an IP back to a hostname.", example: "10.113.0.203.in-addr.arpa PTR mail.example.com", proxyable: false, notes: "Typically managed by the IP's owner (e.g. cloud provider), used for mail server reputation." },
];
