'use strict';

/*
 * SMOLETS local policy-gate prototype.
 * This is a conservative deterministic preflight, not an AI classifier or a
 * complete privacy/security boundary. Keep it out of production until reviewed.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SmoletsPolicyGate = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const MAX_BYTES = 20000;
  const BLOCK_PATTERNS = [
    { code: 'credentials', re: /(?:parole|password|smart[ -]?id|pin kods|bankas piekļuves|bankas pieejas|api[ _-]?key|access token|bearer token)/iu },
    { code: 'personal_identifier', re: /(?:personas kods|personas kodu|personas kods ir|\b\d{6}[- ]?\d{5}\b)/iu },
    { code: 'sensitive_trait_inference', re: /(?:nosaki|izsecini|uzmini|profilē|izveido profilu).{0,70}(?:reliģij|politisk|seksuāl|veselīb|etnisk|psiholoģisk|ievainojamīb)/iu },
    { code: 'personal_dossier', re: /(?:(?:izveido|savāc|papildini|uzbūvē).{0,80}(?:personas|cilvēka|viņa|viņas).{0,50}(?:dosjē|dossier|profil|sociālo tīklu|personīgās pēdas)|(?:scrape|crawl).{0,50}(?:person|profile|social media))/iu },
    { code: 'targeted_manipulation', re: /(?:kā|how to).{0,90}(?:manipulē|ietekmē|piespied|uzspied|maldini|apmāni|coerce|deceive).{0,90}(?:konkrētu personu|viņu|viņas|viņu vājīb|named person|their vulnerabilities)/iu },
    { code: 'covert_contact', re: /(?:uzdodoties par|izlikties par|impersonat|viltus identitāt|slepeni sazināties|covert outreach)/iu }
  ];

  function deny(code, reason) {
    return { allowed: false, code, reason };
  }

  function inspectPayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return deny('invalid_payload', 'Payload must be a plain JSON object.');
    }

    let serialized;
    try { serialized = JSON.stringify(payload); }
    catch (_) { return deny('unserializable_payload', 'Payload cannot be safely inspected.'); }
    if (typeof serialized !== 'string' || serialized.length > MAX_BYTES) {
      return deny('payload_too_large', 'Payload exceeds the local inspection limit.');
    }

    const strings = [];
    const seen = new Set();
    function walk(value, key, depth) {
      if (depth > 12) return 'payload_too_deep';
      if (key && /^(?:attachment|attachments|file|files|blob|binary|image|audio|video)$/iu.test(key)) {
        if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) return 'attachment_not_inspected';
      }
      if (typeof value === 'string') { strings.push(value); return null; }
      if (value === null || typeof value === 'boolean' || typeof value === 'number') return null;
      if (Array.isArray(value)) {
        if (seen.has(value)) return 'cyclic_payload';
        seen.add(value);
        for (const item of value) { const issue = walk(item, '', depth + 1); if (issue) return issue; }
        seen.delete(value);
        return null;
      }
      if (typeof value === 'object') {
        if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return 'unsupported_object';
        if (seen.has(value)) return 'cyclic_payload';
        seen.add(value);
        for (const [childKey, child] of Object.entries(value)) {
          const issue = walk(child, childKey, depth + 1);
          if (issue) return issue;
        }
        seen.delete(value);
        return null;
      }
      return 'unsupported_value';
    }

    const structuralIssue = walk(payload, '', 0);
    if (structuralIssue) return deny(structuralIssue, 'Payload contains content the local gate cannot fully inspect.');

    const combined = strings.join('\n');
    for (const rule of BLOCK_PATTERNS) {
      if (rule.re.test(combined)) return deny(rule.code, 'The request appears to include content outside the permitted idea-centred scope.');
    }

    return { allowed: true, code: 'clear', reason: 'No configured local blocking rule matched. This is not a guarantee of safety.' };
  }

  async function sendIfAllowed(payload, send) {
    if (typeof send !== 'function') throw new TypeError('A network function must be supplied explicitly.');
    const decision = inspectPayload(payload);
    if (!decision.allowed) return { sent: false, decision };
    const response = await send(payload);
    return { sent: true, decision, response };
  }

  return Object.freeze({ inspectPayload, sendIfAllowed, MAX_BYTES });
});
