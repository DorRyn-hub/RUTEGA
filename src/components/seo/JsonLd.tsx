interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Stable, no user-controlled string injection.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
