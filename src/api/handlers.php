<?php
/**
 * Deprecated handlers module.
 *
 * `src/api/unified_api.php` now proxies to the stable root endpoints:
 * - `/api.php`
 * - `/api-mobile.php`
 *
 * This file remains only to avoid fatal errors if something still includes it.
 */
class ApiHandlers {
    public function __construct($pdo) {}

    public function handle($action, $input = [], $currentUser = null) {
        return [
            'success' => false,
            'message' => 'Deprecated: use /api.php or /api-mobile.php',
            'action' => $action,
        ];
    }
}
?>

