/**
 * JSON-LD must already be serialised (and `<` escaped) by the caller.
 * The string is the exact graph emitted in the HTML.
 */
export function JsonLd({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
