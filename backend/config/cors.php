<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env(
            'CORS_ALLOWED_ORIGINS',
            'http://localhost:3000,http://127.0.0.1:3000,https://taghvim.pixlink.ir',
        )),
    ))),
    // Allow Coolify / subdomain variants without redeploying for every host
    'allowed_origins_patterns' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env(
            'CORS_ALLOWED_ORIGIN_PATTERNS',
            '#^https://.*\.pixlink\.ir$#',
        )),
    ))),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
