/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    // ADR-001 Regel 7: Keine Zyklen, auch nicht über Typ-Importe (Tests ausgenommen)
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'ADR-001 Regel 7: Keine zyklischen Abhängigkeiten (auch nicht über Typ-Importe).',
      from: {
        path: '^(src|content)/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        circular: true,
      },
    },
    // ADR-001 Regel 1: domain importiert nichts aus src/ (ausser domain) oder content/
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment:
        'ADR-001 Regel 1: src/domain darf nichts aus anderen src/-Ordnern oder content/ importieren.',
      from: {
        path: '^src/domain/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^(src/(?!domain/)|content/)',
      },
    },
    {
      name: 'domain-no-ui-libs',
      severity: 'error',
      comment: 'ADR-001 Regel 1: src/domain darf kein React oder Router importieren.',
      from: {
        path: '^src/domain/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^node_modules/(react|react-dom|react-router)',
      },
    },
    // ADR-001 Regel 2: Dienste importieren kein React, keinen Router und keine UI-Schichten
    {
      name: 'services-no-react-or-ui',
      severity: 'error',
      comment:
        'ADR-001 Regel 2: Dienste (storage, catalog, i18n, nutrition, health, pwa) dürfen kein React und keine UI-/App-Schicht importieren.',
      from: {
        path: '^src/(storage|catalog|i18n|nutrition|health|pwa)/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^(src/(pages|components|hooks|app)/|node_modules/(react|react-dom|react-router))',
      },
    },
    // ADR-001 Regel 2: Erlaubte Querverbindungen zwischen Diensten nur nutrition->catalog und catalog->i18n
    {
      name: 'storage-no-other-services',
      severity: 'error',
      comment:
        'ADR-001 Regel 2: src/storage darf keine anderen Dienste importieren.',
      from: {
        path: '^src/storage/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^src/(catalog|i18n|nutrition|health|pwa)/',
      },
    },
    {
      name: 'catalog-only-domain-and-i18n',
      severity: 'error',
      comment:
        'ADR-001 Regel 2: src/catalog darf unter Diensten nur src/i18n (Typen) importieren.',
      from: {
        path: '^src/catalog/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^src/(storage|nutrition|health|pwa)/',
      },
    },
    {
      name: 'i18n-no-other-services',
      severity: 'error',
      comment:
        'ADR-001 Regel 2: src/i18n darf keine anderen Dienste importieren.',
      from: {
        path: '^src/i18n/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^src/(storage|catalog|nutrition|health|pwa)/',
      },
    },
    {
      name: 'nutrition-only-domain-and-catalog',
      severity: 'error',
      comment:
        'ADR-001 Regel 2: src/nutrition darf unter Diensten nur src/catalog importieren.',
      from: {
        path: '^src/nutrition/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^src/(storage|i18n|health|pwa)/',
      },
    },
    {
      name: 'pwa-no-other-services',
      severity: 'error',
      comment: 'ADR-001 Regel 2: src/pwa darf keine anderen Dienste importieren.',
      from: {
        path: '^src/pwa/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^src/(storage|catalog|i18n|nutrition|health)/',
      },
    },
    // ADR-001 Regel 3: health ist rein (nur domain + health selbst)
    {
      name: 'health-is-pure',
      severity: 'error',
      comment:
        'ADR-001 Regel 3: src/health ist rein (keine Speicher-, keine anderen Dienst-, keine UI-Importe).',
      from: {
        path: '^src/health/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^(src/(?!domain/|health/)|content/)',
      },
    },
    // ADR-001 Regel 4: components importieren nur domain, i18n und andere components
    {
      name: 'components-allowed-imports',
      severity: 'error',
      comment:
        'ADR-001 Regel 4: src/components darf nur src/domain, src/i18n und andere Komponenten importieren.',
      from: {
        path: '^src/components/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^(src/(pages|hooks|app|storage|catalog|nutrition|health|pwa)/|content/)',
      },
    },
    // ADR-001 Regel 5: pages importieren nicht direkt aus storage oder content
    {
      name: 'pages-no-direct-storage-or-content',
      severity: 'error',
      comment:
        'ADR-001 Regel 5: src/pages darf nicht direkt aus src/storage oder content/ importieren.',
      from: {
        path: '^src/pages/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^(src/storage/|content/)',
      },
    },
    // ADR-001: content importiert nur domain
    {
      name: 'content-only-domain',
      severity: 'error',
      comment: 'ADR-001: content/ darf aus src/ nur src/domain importieren.',
      from: {
        path: '^content/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '^src/(?!domain/)',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
