<?php
/**
 * Unified API entrypoint.
 *
 * NOTE:
 * The project currently maintains stable root endpoints:
 * - `/api.php` (session/web)
 * - `/api-mobile.php` (token/mobile)
 *
 * This file acts as a thin proxy so older mobile/web builds that
 * referenced `src/api/unified_api.php` continue to work.
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$authMode = $_GET['auth_mode'] ?? '';
if ($authMode === 'token') {
    require_once __DIR__ . '/../../api-mobile.php';
    exit;
}

require_once __DIR__ . '/../../api.php';
exit;
